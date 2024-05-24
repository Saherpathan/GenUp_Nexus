from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson.objectid import ObjectId
import google.generativeai as genai
import urllib.parse
from models import UserSchema
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token
from middleware.authUser import auth_user
from datetime import timedelta 
from controllers.demo import get_initial_data
from controllers.mindmap import saveMindmap, getMindmap, getMindmapHistory, deleteMindmap, getMindmapByid, saveMindmapById, saveGeneratedData
import json
from bson import ObjectId, json_util
from email.message import EmailMessage
import smtplib
import ssl
from dotenv import load_dotenv
import random
import os
import re
import requests
import time

load_dotenv()

app = Flask(__name__)

bcrypt = Bcrypt(app)
jwt = JWTManager(app)


app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET')
CORS(app,resources={r"/*":{"origins":"*"}})

# MongoDB configuration
username = urllib.parse.quote_plus(os.getenv('MONGO_USERNAME'))
password = urllib.parse.quote_plus(os.getenv('MONGO_PASSWORD'))
restUri = os.getenv('REST_URI')

uri = f'mongodb+srv://{username}:{password}{restUri}'

client = MongoClient(uri)
db = client.GenUpNexus
users_collection = db["users"]
interviews_collection = db["interviews"]
savedMindmap = db["savedMindmap"]
roadmap_collection = db['roadmaps']
otps_collection = db['otps']

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)


GOOGLE_API_KEY=os.getenv('GOOGLE_API_KEY')

genai.configure(api_key=GOOGLE_API_KEY)

generation_config = {
  "temperature": 0.8,
  "top_p": 1,
  "top_k": 40,
  "max_output_tokens": 2048,
}

safety_settings = [
  {
    "category": "HARM_CATEGORY_HARASSMENT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    "category": "HARM_CATEGORY_HATE_SPEECH",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
]

model = genai.GenerativeModel('gemini-1.0-pro', generation_config=generation_config, safety_settings=safety_settings)

# Caches to reduce no of queries to MongoDB...
user_id_ping = {'current': 0}
user_chats = {}

@app.route('/')
def index():
    return "Server is Running..."

@app.route('/index')
def index2():
    return "routes checking..."

#generative model routes
@app.route('/tree', methods=["POST", "GET"])
def tree():
    if request.method == 'POST':
        data = request.get_json()
        query = data.get('query')
        print(query)
        response = model.generate_content('''I will give you a topic and you have to generate an explanation of the topic in points in hierarchical tree structure and respond with JSON structure as follows:
        {
            "name": "Java",
            "children": [
                {
                "name": "Development Environment",
                "children": [
                    {
                    "name": "Java Source Code",
                    "value": ".java files",
                    "description": "Human-readable code written with Java syntax."
                    },
                    {
                    "name": "Java Development Kit (JDK)",
                    "children": [
                        {
                        "name": "Compiler",
                        "value": "translates to bytecode",
                        "description": "Transforms Java source code into bytecode instructions understood by the JVM."
                        },
                        {
                        "name": "Java Class Library (JCL)",
                        "value": "predefined classes and functions",
                        "description": "Provides a collection of reusable code for common functionalities."
                        }
                    ]
                    }
                ]
                },
                {
                "name": "Execution",
                "children": [
                    {
                    "name": "Java Runtime Environment (JRE)",
                    "children": [
                        {
                        "name": "Java Virtual Machine (JVM)",
                        "value": "executes bytecode",
                        "description": "Software program that interprets and executes bytecode instructions."
                        },
                        {
                        "name": "Class Loader",
                        "value": "loads bytecode into memory",
                        "description": "Loads .class files containing bytecode into JVM memory for execution."
                        }
                    ]
                    },
                    {
                    "name": "Bytecode",
                    "value": ".class files (platform-independent)",
                    "description": "Machine-independent instructions generated by the compiler, executable on any system with JVM."
                    },
                    {
                    "name": "Just-In-Time (JIT) Compilation (optional)",
                    "value": "improves performance by translating bytecode to machine code",
                    "description": "Technique that translates frequently used bytecode sections into native machine code for faster execution."
                    }
                ]
                },
                {
                "name": "Key Features",
                "children": [
                    {
                    "name": "Object-Oriented Programming",
                    "value": "uses objects and classes",
                    "description": "Programs are structured around objects that encapsulate data and behavior."
                    },
                    {
                    "name": "Platform Independent (write once, run anywhere)",
                    "value": "bytecode runs on any system with JVM",
                    "description": "Java code can be compiled once and run on any platform with a JVM installed."
                    },
                    {
                    "name": "Garbage Collection",
                    "value": "automatic memory management",
                    "description": "JVM automatically reclaims memory from unused objects, simplifying memory management for developers."
                    }
                ]
                }
            ]
            }
            Topic is: ''' + query)
        
        # print(response.text)
        return jsonify({'success': True, 'data': response.text})
        # return temp 

@app.route('/tree/demo', methods=["POST"])
@auth_user
def treeDemo():
    if request.method == 'POST':
        data = request.get_json()
        query = data.get('query')
        print(query)
        response = model.generate_content('''Generate a comprehensive knowledge map representing the user's query, suitable for ReactFlow visualization.

**Prompt:** {query}

**Structure:**

- Top-level node: Represent the user's query.
- Sub-nodes branching out based on the query's relevance:
    - Leverage external knowledge sources (e.g., Wikipedia, knowledge graphs, domain-specific APIs) to identify relevant sub-concepts, related entities, and potential relationships.
- Consider including different categories of sub-nodes:
    - **Concepts:** Core ideas or principles related to the query.
    - **Subfields:** Specialized areas within the main topic.
    - **Applications:** Practical uses of the concept or subfield.
    - **Tools and Technologies:** Software or platforms used to implement the concepts.
    - **Examples:** Illustrative instances or use cases.
    - **Historical Context:** Milestones or key figures in the topic's development.
    - **See Also:** Links to broader concepts or related areas for the further exploration.
    
                                          
**Content:**

- Each node should have a label describing the concept, entity, or tool.
- Include brief descriptions, definitions, or key points within the nodes or as tooltips.
- Consider using icons to visually represent different categories of nodes (e.g.💡 for concepts, ⚙️ for tools, 📅 for historical context, 🧩 for subfields).
- Also follow the n-ary tree structure for better visualization.
- There should be atmax 10 nodes.
- Ensure the knowledge map is visually appealing, well-organized, and easy to navigate.

**Desired Format:**

- JSON structure compatible with ReactFlow:
    - nodes (list): id, position, type(custom), data(label, description, icon, category).
    - edges (list): id, source, target, label(if required), animated (true or false), style(stroke).
- The nodes should not overlap and have enough spacing for readability, therefore adjust it position accordingly.
- keep atleast 2 edges "animated":true.
- Strictly keep the all the nodes with type property value as custom. 
- to edit edges add style with stroke property and a hexcode value to it(Only use this color: #e92a67, #a853ba, #2a8af6, #e92a67).
                                   
Topic is: ''' + query)
        
        # response.text(8,)
        print(response.text)
        json_data = response.text
        modified_json_data = json_data[8:-3]

        while True:
            new_object_id = ObjectId()
            if savedMindmap.find_one({'_id': new_object_id}) is None:
                break 

        return jsonify({'success': True, 'data': modified_json_data, 'objectId': str(new_object_id)})
        # return temp 

@app.route('/mindmap/generate/data', methods=["POST"])
# @auth_user
def generateData():
    if request.method == 'POST':
        data = request.get_json()
        topic = data.get('topic')
        description = data.get('description')
        category = data.get('category')
        nodeId = data.get('nodeId')
        mapId = data.get('mapId')
        # userId = request.userId

        # try: 
        #     mindMap = savedMindmap.find_one({"_id": ObjectId(mapId)})
            
        #     if mindMap["userId"] != userId:
        #         return jsonify({"message": "Unauthorized"}), 401
            
        # except Exception as e:
        #     print(e) 
        #     return jsonify({"error": "An error occurred"}), 500

        response = model.generate_content('''I will provide you a topic & related description. You need to generate its detailed explanation, also provide its links to the related topics and respond in markdown. 
        - make sure the content is well structured and easy to read.  
        Topic: ''' + topic + '\n\n' + '''Description: ''' + description)                                 
        print(response.text)
        json_data = response.text

        saveGeneratedData(mapId, nodeId, json_data, savedMindmap)

        return jsonify({'success': True, 'data': json_data})                                  

def res(user_id):
    avg_text = 0        
    avg_code = 0
    count = 0
    for i, ele in enumerate(user_chats[user_id]['chat'].history):
        if i == 0:
            continue

        if ele.role == 'model':
            temp = json.loads(ele.parts[0].text)
            print(temp)
            if 'question' in temp.keys():
                continue
            elif 'next_question' in temp.keys() or 'end' in temp.keys():
                count += 1
                avg_text += temp['text_correctness']
                if temp['code_correctness']:
                    avg_code += temp['code_correctness']
            print(json.loads(ele.parts[0].text), end='\n\n')

    avg_text /= count
    avg_code /= count

    user_chats[user_id]['test_results'] = {'avg_text': avg_text, 'avg_code': avg_code}

    return True

@app.route('/interview', methods=["POST", "GET"])
def interview():
    if request.method == 'POST':
        data = request.get_json()
        print(data)
        if data.get('from') == 'client':
            user_id = data.get('user_id')
            request_type = data.get('type')

            if request_type == 1:           # Initialize Questionarrie.
                chat = model.start_chat(history=[])
                user_chats[user_id] = {}
                user_chats[user_id]['chat'] = chat
                user_chats[user_id]['processed'] = False

                position = data.get('position')
                round = data.get('round')
                difficulty_level = data.get('difficulty_level')
                company_name = data.get('company_name')

                user_chats[user_id]['position'] = position
                user_chats[user_id]['round'] = round
                user_chats[user_id]['difficulty_level'] = difficulty_level
                user_chats[user_id]['company_name'] = company_name
                
                response = chat.send_message('''You are a Interviewer. I am providing you with the the position for which the inerview is, Round type, difficulty level of the interview to be conducted, Company name.
                                             You need to generate atmost 2 interview questions one after another.
                                             The questions may consists of writing a small code along with text as well.
                                             
                                             Now generate first question in following JSON format: 
                                             {
                                                "question": "What is ...?"
                                             }

                                             I will respond to the question in the following JSON format:
                                             {
                                                "text_answer": "answer ...",
                                                "code": "if any...."
                                             }
                                             
                                             Now after evaluating the answers you need to respond in the following JSON format:
                                             {
                                                "next_question": "What is ...?",
                                                "text_correctness": "Test the correctness of text and return a range from 1 to 5 of correctness of text.",
                                                "text_suggestions": "Some suggestions regarding the text_answer.... in string format."
                                                "code_correctness": "Test the correctness of code and return a range from 1 to 5 of correctness of code",
                                                "code_suggestions": "Any suggestions or optimizations to the code...in string format.",
                                             }

                                             At the end of the interview if no Questions are required then respond in the following format:
                                             {
                                                "text_correctness": "Test the correctness of text and return a range from 1 to 5 of correctness of text.",
                                                "text_suggestions": "Some suggestions regarding the text_answer...."
                                                "code_correctness": "Test the correctness of code and return a range from 1 to 5 of correctness of code",
                                                "code_suggestions": "Any suggestions or optimizations to the code...",
                                                "end": "No more Questions thanks for your time."
                                             }
                                             
                                             Here are the details:
                                             Position : '''+ position + '''
                                             Round: '''+ round + '''
                                             Difficullty Level : '''+ difficulty_level + '''
                                             Company Interview : ''' + company_name + '''
                                        
                                        - It is required that the response should be an object. Don't include any other verbose explanations and don't include the markdown syntax anywhere.''')
                print(response.text)
                print(response.text)
                temp = json.loads(response.text)
                user_chats[user_id]['qa'] = [{'question': temp['question']}]
                return jsonify({'success': True, 'data': response.text})
            
            if request_type == 2:
                text_data = data.get('text_data')
                code = data.get('code')

                chat = user_chats[user_id]['chat']
                response = chat.send_message('''{"text_answer": "''' + text_data + '''", "code": "''' + code + '''"}''')
                
                print(response.text)

                json_text =  json.loads(response.text)
                
                for i, ele in enumerate(user_chats[user_id]['qa']):
                    if i == len(user_chats[user_id]['qa'])-1:
                        ele['text_answer'] = text_data
                        ele['code_answer'] = code
                        ele['text_correctness'] = json_text['text_correctness']
                        ele['text_suggestions'] = json_text['text_suggestions']
                        ele['code_correctness'] = json_text['code_correctness']
                        ele['code_suggestions'] = json_text['code_suggestions']
                
                try:
                    if json_text['end']:
                        user_id_ping['current'] = user_id
                        if res(user_id):
                            print(user_chats[user_id])
                        return jsonify({'success': True, 'data': response.text, 'end': True})
                except Exception as e:
                    print(e)

                user_chats[user_id]['qa'].append({'question': json_text['next_question']})
            
                return jsonify({'success': True, 'data': response.text, 'end': False})

        
        elif data.get('from') == 'gradio':
            print(data)
            user_id = data.get('user_id')
            user_chats[user_id]['processed'] = True
            user_chats[user_id]['gradio_results'] = {'total_video_emotions': data.get('total_video_emotions'), 'emotions_final': data.get('emotions_final'), 'body_language': data.get('body_language'), 'distraction_rate': data.get('distraction_rate'), 'formatted_response': data.get('formatted_response'), 'total_transcript_sentiment': data.get('total_transcript_sentiment')}
            
            emotion_weights = {
                'admiration': 0.8,
                'amusement': 0.7,
                'angry': -0.8,
                'annoyance': -0.7,
                'approval': 0.9,
                'calm': 0.8,
                'caring': 0.8,
                'confusion': -0.5,
                'curiosity': 0.6,
                'desire': 0.7,
                'disappointment': -0.8,
                'disapproval': -0.9,
                'disgust': -0.9,
                'embarrassment': -0.7,
                'excitement': 0.8,
                'fear': -0.8,
                'fearful': -0.8,
                'gratitude': 0.9,
                'grief': -0.9,
                'happy': 0.9,
                'love': 0.9,
                'nervousness': -0.6,
                'optimism': 0.8,
                'pride': 0.9,
                'realization': 0.7,
                'relief': 0.8,
                'remorse': -0.8,
                'sad': -0.9,
                'surprise': 0.7,
                'surprised': 0.7,
                'neutral': 0.0
            }
            
            temp = data.get('total_video_emotions')
            temp2 = data.get('emotions_final')
            temp3 = data.get('formatted_response')
            temp4 = data.get('total_transcript_sentiment')

            total_video_emotion_score = sum(temp[emotion] * emotion_weights[emotion] for emotion in temp)
            total_video_emotion_normalized_score = ((total_video_emotion_score + 1) / 2) * 9 + 1

            emotion_final_score = sum(temp2[emotion] * emotion_weights[emotion] for emotion in temp2)
            emotion_final_normalized_score = ((emotion_final_score + 1) / 2) * 9 + 1

            speech_sentiment_score = sum(temp3[emotion] * emotion_weights[emotion] for emotion in temp3)
            speech_sentiment_normalized_score = ((speech_sentiment_score + 1) / 2) * 9 + 1

            total_transcript_sentiment_score = sum(temp4[emotion] * emotion_weights[emotion] for emotion in temp4)
            total_transcript_sentiment_normalized_score = ((total_transcript_sentiment_score + 1) / 2) * 9 + 1

            body_language_score = data.get('body_language')['Good'] * 10
            distraction_rate_score = data.get('distraction_rate') * 10

            avg_text_score = user_chats[user_id]['test_results']['avg_text']
            avg_code_score = user_chats[user_id]['test_results']['avg_code']

            interview_score = (total_video_emotion_normalized_score + emotion_final_normalized_score + speech_sentiment_normalized_score + total_transcript_sentiment_normalized_score + body_language_score + distraction_rate_score + avg_text_score + avg_code_score)/7

            print(interview_score)
            user_chats[user_id]['interview_score'] = interview_score
            
            user_chats[user_id]['user_id'] = user_id
            print(user_chats[user_id])

            # Store user_chats[user_id] into MongoDB...
            del user_chats[user_id]["chat"]
            result = interviews_collection.insert_one(user_chats[user_id])
            print(result)

            return jsonify({'success': True})
        

@app.route('/result', methods=['POST', 'GET'])
def result():
    if request.method == 'POST':
        data = request.get_json()
        user_id = data.get('user_id')

        if data.get('type') == 1:
            result = interviews_collection.find({ "user_id" : user_id}, {"_id" : 1, "company_name" : 1, "difficulty_level" : 1, "interview_score" : 1, "position" : 1, "round" : 1 })
            temp = []
            for ele in result:
                ele['_id'] = str(ele['_id'])
                temp.append(ele)

            return jsonify({'success': True, 'data': temp})
        
        elif data.get('type') == 2:
            result2 = interviews_collection.find_one({ "_id": ObjectId(data.get("_id")), "user_id": user_id })
            if result2:
                result2['_id'] = str(result2['_id'])
                print(result2)
                return jsonify({'success': True, 'data': result2})
            else:
                if not user_chats[user_id]['processed']:
                    return jsonify({'processing': True})
                else:
                    return jsonify({'error': "No such record found."})


@app.route('/useridping', methods=['GET'])
def useridping():
    if request.method == 'GET':
        return jsonify(user_id_ping)


# User Routes
@app.route('/user/verifymail', methods=['POST'])
def verifymail():
    data = request.json
    name = data.get('name')
    email = data.get('email')

    if not email:
        return jsonify({"error": "Invalid email"}), 400

    existing_user = users_collection.find_one({"email": email})

    if existing_user:
        return jsonify({"message": "User already exists"}), 404
    
    msg = EmailMessage()

    otp = str(random.randint(100000, 999999))
    msg["Subject"] = "GenUP Nexus Verification"
    msg["From"] = "GenUP Nexus Team"
    msg["To"] = email

    html_content = render_template('email.html', name=name, otp=otp)
    msg.set_content(html_content, subtype='html')

    context = ssl.create_default_context()

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
        smtp.login('smilecheck100@gmail.com', os.getenv('GMAIL_SSL_KEY'))
        smtp.send_message(msg)

    otps_collection.insert_one({"email": email, "otp": otp})

    return jsonify({"success": True}), 200


@app.route('/user/signup', methods=['POST'])
def signup():
    data = request.json
    print(data)
    form = data.get('form')
    name = form['name']
    email = form['email']
    password = form['password']
    otp = data.get('otp')

    if not email:
        return jsonify({"error": "Invalid email"}), 400
    
    stored_otp = otps_collection.find_one({"email": email}, sort=[('_id', -1)])

    if stored_otp['otp'] == otp:
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        result = users_collection.insert_one({
            "name": name,
            "email": email,
            "password": hashed_password
        })

        expires = timedelta(days=7)
        access_token = create_access_token(identity={"email": email, "id": str(result.inserted_id)}, expires_delta=expires)

        res = {"name": name, "email": email, "userId": str(result.inserted_id)}
        
        return jsonify({"result": res, "token": access_token}), 201

    else:
        return jsonify({"error": "Invalid otp"}), 400

@app.route('/user/signin', methods=['POST'])
def signin():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = users_collection.find_one({"email": email})

    if not user:
        return jsonify({"message": "User doesn't exist"}), 404

    if not bcrypt.check_password_hash(user['password'], password):
        return jsonify({"message": "Invalid Credentials"}), 404

    expires = timedelta(days=7)
    access_token = create_access_token(identity={"email": user['email'], "id": str(user['_id'])}, expires_delta=expires)

    res = {"name": user['name'], "email": user['email'], "userId": str(user['_id'])}

    return jsonify({"result": res, "token": access_token}), 200

#protected route wiht auth_user middleware
@app.route('/user/delete', methods=['POST'])
@auth_user
def delete_account():
    email = request.email
    print(email)
    try:
        result = users_collection.delete_one({"email": email})
        if result.deleted_count == 1:
            return jsonify({"result": True}), 200
        else:
            return jsonify({"result": False, "message": "User not found"}), 404
    except Exception as e:
        print(e)
        return jsonify({"message": "Something went wrong"}), 500

# mindmap routes
@app.route('/mindmap/save', methods=['POST'])
@auth_user
def mindmapSave():
    userId = request.userId
    data = request.json
    return saveMindmap(data, userId, savedMindmap)

@app.route('/mindmap/save/id', methods=['POST'])
@auth_user
def mindmapSaveId():
    userId = request.userId
    data = request.json
    return saveMindmapById(data, userId, savedMindmap)

@app.route('/mindmap/get', methods=['GET'])
@auth_user
def mindmapGet():
    userId = request.userId
    return getMindmap(userId, savedMindmap)

@app.route('/mindmap/history/get', methods=['GET'])
@auth_user
def mindmapGetHistory():
    userId = request.userId
    return getMindmapHistory(userId, savedMindmap)

@app.route('/mindmap/get/<id>', methods=['GET'])
def mindmapGetById(id):
    return getMindmapByid(id, savedMindmap)

@app.route('/mindmap/delete', methods=['POST'])
@auth_user
def mindmapDelete():
    userId = request.userId
    data = request.json
    return deleteMindmap(userId, data, savedMindmap)

@app.route('/mindmap/demo', methods=['POST'])
def mindmapDemo():
    data = request.json
    print(data)
    return get_initial_data(), 200


@app.route('/roadmap', methods=['POST'])
# @auth_user
def roadmap():
    if request.method == 'POST':
        data = request.get_json()
        user_id = data.get('user_id')

        if data.get('type') == 1:
            day_data = data.get('todayData')
            position = data.get('position')
            time_road = data.get('time')
            company = data.get('company')

            # Generate New Roadmap
            chat_starter = '''Generate a week-wise roadmap for '''+ position + ''' in English in the following JSON format:
            {
                "week1": {
                    "title": "...",
                    "description": "What will i learn in this week...",
                    "data": {
                        "day1": {
                            "description": "...",
                            "heading": "What will I do on this day...",
                            "links": [ "link1", "link2", .... ]
                        },
                        "day2": {
                            "description": "...",
                            "heading": "What will I do on this day...",
                            "links": [ "link1", "link2", .... ]
                        },
                        "day3": {
                            "description": "...",
                            "heading": "What will I do on this day...",
                            "links": [ "link1", "link2", .... ]
                        },
                        "day4": {
                            "description": "...",
                            "heading": "What will I do on this day...",
                            "links": [ "link1", "link2", .... ]
                        },
                        "day5": {
                            "description": "...",
                            "heading": "What will I do on this day...",
                            "links": [ "link1", "link2", .... ]
                        },
                        "day6": {
                            "description": "...",
                            "heading": "What will I do on this day...",
                            "links": [ "link1", "link2", .... ]
                        },
                        "day7": {
                            "description": "...",
                            "heading": "What will I do on this day...",
                            "links": [ "link1", "link2", .... ]
                        }
                    }
                }
            }
            - I am preparing to get '''+ position + ''' at ''' + company + '''company.
            - I will ask you one by one to generate for next weeks. Generate only links, do not add anything to links.
            - It is required that the response should be an object. Don't include any other verbose explanations and don't include the markdown syntax anywhere.
            - Roadmap length is of total ''' + time_road + ''' weeks. So adjust the content among the weeks accordingly.'''			# Prompt
            
            roadmap_list = []

            chat = model.start_chat(history=[])
            response = chat.send_message(chat_starter)

            print(response.text)

            if response.text[0] == '{':
                roadmap_list.append(json.loads(response.text))
            elif response.text[0] == '`':
                roadmap_list.append(json.loads(response.text[7:-3]))

            for i in range(1,int(time_road)):
                new_response = chat.send_message(f"Now generate for next week{i+1}")
                print(new_response.text)
                if new_response.text[0] == '{':
                    roadmap_list.append(json.loads(new_response.text))
                elif new_response.text[0] == '`':
                    roadmap_list.append(json.loads(new_response.text[7:-3]))

            roads_data = roadmap_list

            print(roads_data)

            time.sleep(60)

            # Youtube Integration & links modification
            API_KEY = os.getenv('YOUTUBE_API_KEY')
            url = "https://youtube.googleapis.com/youtube/v3/search"
            
            for index, ele in enumerate(roads_data):
                for i in range(0,7):
                    params = {
                      "part": "snippet",
                      "q": ele[f"week{index + 1}"]['data'][f"day{i+1}"]['heading'] + ele[f"week{index + 1}"]['title'],
                      "key": API_KEY,
                      "maxResults" : 3
                    }
                
                    response = requests.get(url, params=params)
                    
                    if response.status_code == 200:
                        video_data = response.json()

                        temp1 = []
                        for vid in video_data['items']:
                            if vid['id']['kind']=='youtube#playlist':
                                temp1.append({'viewed': False, 'type': 'playlist', 'playlistId': vid['id']['playlistId'], 'videoTitle': vid['snippet']['title'], 'channelName': vid['snippet']['channelTitle'], 'thumbnail': vid['snippet']['thumbnails']['high']['url']})
                            elif vid['id']['kind']=='youtube#video':
                                temp1.append({'viewed': False, 'type': 'video', 'videoId': vid['id']['videoId'], 'videoTitle': vid['snippet']['title'], 'channelName': vid['snippet']['channelTitle'], 'thumbnail': vid['snippet']['thumbnails']['high']['url']})

                        ele[f"week{index + 1}"]['data'][f"day{i+1}"]['youtube'] = temp1

                    # Reference Links
                        temp2 = []
                        for link in ele[f"week{index + 1}"]['data'][f"day{i+1}"]['links']:
                            temp2.append({'link': link, 'visited': False})

                        ele[f"week{index + 1}"]['data'][f"day{i+1}"]['links'] = temp2
                    
                    else:
                        print("Error:", response.json())
                      
            # Save to MongoDB
            roadmap_collection.insert_one({'data': roads_data, 'title': position, 'activeDays': [day_data], 'userId': user_id})

            try:
                results = roadmap_collection.find({"userId": user_id}, {"_id": 1, "title": 1, "activeDays": 1}).limit(5)
                roadmaps = [{"_id": str(result["_id"]), "title": result["title"], "activeDays": result["activeDays"]} for result in results]

                if roadmaps:
                    return json_util.dumps({"data": roadmaps}), 200
                else:
                    return jsonify({"msg": "No Mindmap stored"}), 404
            except Exception as e:
                print(e)  
                return jsonify({"error": "An error occurred"}), 500

            # return jsonify({'success': True})
        
        elif data.get('type') == 2:
            # Get roadmap data
            roadmap_data = roadmap_collection.find_one({"_id": ObjectId(data.get("_id")), "userId": user_id})
            
            practice_temp = roadmap_data['practice']            # Modify to remove answer and explanation
            for key in practice_temp.values():
                for question in key:
                    if not question.get('solved', False):
                        question.pop('answer', None)
                        question.pop('explaination', None)

            if roadmap_data:
                return jsonify({'success': True, 'roadmapData': {'data': roadmap_data['data']}, 'activeDays': roadmap_data['activeDays'], 'practice': practice_temp, 'title': roadmap_data['title']})
            else:
                return jsonify({'success': False})
            

@app.route('/roadmap/history', methods=['GET'])
@auth_user
def roadmapGetHistory():
    userId = request.userId
    try:
        results = roadmap_collection.find({"userId": userId}, {"_id": 1, "title": 1, "activeDays": 1}).limit(5)
        roadmaps = [{"_id": str(result["_id"]), "title": result["title"], "activeDays": result["activeDays"]} for result in results]

        if roadmaps:
            return json_util.dumps({"data": roadmaps}), 200
        else:
            return jsonify({"msg": "No Mindmap stored"}), 404
    except Exception as e:
        print(e)  
        return jsonify({"error": "An error occurred"}), 500


@app.route('/roadmapmodder', methods=['POST'])
def roadmapmodder():
    if request.method == 'POST':
        data = request.get_json()
        user_id = data.get('user_id')
        obj_id = data.get('_id')
        day_data = data.get('todayData')
        week_num = data.get('weekNum')
        day_num = data.get('dayNum')
        week_field = f'week{week_num}'
        day_field = f'day{day_num}'

        if data.get('type') == 11:                  # Add Youtube Video
            video_url = data.get('videoUrl')

            video_id_match = re.search(r"(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})", video_url)
            video_id = video_id_match.group(1)
            api_key = os.getenv('YOUTUBE_API_KEY')

            api_url = f"https://www.googleapis.com/youtube/v3/videos?id={video_id}&key={api_key}&part=snippet"
            response = requests.get(api_url)
            temp = {}
            if response.status_code == 200:
                data = response.json()
            
            if 'items' in data and data['items']:
                item = data['items'][0]
                print(item)

                if item['kind'] == 'youtube#video':
                    temp = {
                        "channelName": item['snippet']['channelTitle'],
                        "thumbnail": item['snippet']['thumbnails']['high']['url'],
                        "type": 'video',
                        "videoId": item['id'],
                        "videoTitle": item['snippet']['localized']['title'],
                        "viewed": True
                    }
                elif item['kind'] == 'youtube#playlist':
                    temp = {
                        "channelName": item['snippet']['channelTitle'],
                        "thumbnail": item['snippet']['thumbnails']['high']['url'],
                        "type": 'playlist',
                        "playlistId": item['id'],
                        "videoTitle": item['snippet']['localized']['title'],
                        "viewed": True
                    }

            else:
                print("Error occurred:", response.status_code)
            
            temp_data = roadmap_collection.find_one({"_id": ObjectId(obj_id)})
            temp_data['data'][week_num-1][week_field]['data'][day_field]['youtube'].append(temp)

            roadmap_collection.update_one(
                {"_id": ObjectId(obj_id)},
                {"$set": { "data": temp_data['data'] }}
            )
            
            if temp_data['activeDays'][len(temp_data['activeDays'])-1]['day'] != day_data['day'] or temp_data['activeDays'][len(temp_data['activeDays'])-1]['month'] != day_data['month'] or temp_data['activeDays'][len(temp_data['activeDays'])-1]['year'] != day_data['year']:
                temp_data['activeDays'].append(day_data)
                roadmap_collection.update_one(
                    {"_id": ObjectId(obj_id)},
                    {"$set": { "activeDays": temp_data['activeDays'] }}
                )
            
            return jsonify({'success': True, 'youtubeUpdate': temp})
            
        elif data.get('type') == 12:                # Update Youtube Video View
            video_index = data.get('videoIndex')

            temp_data = roadmap_collection.find_one({"_id": ObjectId(obj_id)})
            temp_data['data'][week_num-1][week_field]['data'][day_field]['youtube'][video_index]['viewed'] = True

            print("Meow")

            roadmap_collection.update_one(
                {"_id": ObjectId(obj_id)},
                {"$set": { "data": temp_data['data'] }}
            )
            
            print("Meow")
            
            if temp_data['activeDays'][len(temp_data['activeDays'])-1]['day'] != day_data['day'] or temp_data['activeDays'][len(temp_data['activeDays'])-1]['month'] != day_data['month'] or temp_data['activeDays'][len(temp_data['active_days'])-1]['year'] != day_data['year']:
                temp_data['activeDays'].append(day_data)
                roadmap_collection.update_one(
                    {"_id": ObjectId(obj_id)},
                    {"$set": { "activeDays": temp_data['activeDays'] }}
                )
            
            
            print("Meow")

            return jsonify({'success': True})

        elif data.get('type') == 21:                # Add Reference Link
            ref_link = data.get('refLink')

            temp_data = roadmap_collection.find_one({"_id": ObjectId(obj_id)})
            temp_data['data'][week_num-1][week_field]['data'][day_field]['links'].append({"link": ref_link, "visited": True})

            roadmap_collection.update_one(
                {"_id": ObjectId(obj_id)},
                {"$set": { "data": temp_data['data'] }}
            )
            
            if temp_data['activeDays'][len(temp_data['activeDays'])-1]['day'] != day_data['day'] or temp_data['activeDays'][len(temp_data['activeDays'])-1]['month'] != day_data['month'] or temp_data['activeDays'][len(temp_data['activeDays'])-1]['year'] != day_data['year']:
                temp_data['activeDays'].append(day_data)
                roadmap_collection.update_one(
                    {"_id": ObjectId(obj_id)},
                    {"$set": { "activeDays": temp_data['activeDays'] }}
                )

        elif data.get('type') == 22:                # Update Reference link Visit
            ref_link_index = data.get('refLinkIndex')

            temp_data = roadmap_collection.find_one({"_id": ObjectId(obj_id)})
            temp_data['data'][week_num-1][week_field]['data'][day_field]['links'][ref_link_index]["visited"] = True

            roadmap_collection.update_one(
                {"_id": ObjectId(obj_id)},
                {"$set": { "data": temp_data['data'] }}
            )

            if temp_data['activeDays'][len(temp_data['activeDays'])-1]['day'] != day_data['day'] or temp_data['activeDays'][len(temp_data['activeDays'])-1]['month'] != day_data['month'] or temp_data['activeDays'][len(temp_data['activeDays'])-1]['year'] != day_data['year']:
                temp_data['activeDays'].append(day_data)
                roadmap_collection.update_one(
                    {"_id": ObjectId(obj_id)},
                    {"$set": { "activeDays": temp_data['activeDays'] }}
                )

        # Add Mindmaps change in mindap generation fucntion such that if roadmapId, WeekNum, DayNum is sent while generation of mindmap then associate it directly with the roadmap.

        elif data.get('type') == 31:                # Update isComplete
            temp_data = roadmap_collection.find_one({"_id": ObjectId(obj_id)})
            temp_data['data'][week_num-1][week_field]['data'][day_field]['isComplete'] = True

            roadmap_collection.update_one(
                {"_id": ObjectId(obj_id)},
                {"$set": { "data": temp_data['data'] }}
            )
            
            if temp_data['activeDays'][len(temp_data['activeDays'])-1]['day'] != day_data['day'] or temp_data['activeDays'][len(temp_data['activeDays'])-1]['month'] != day_data['month'] or temp_data['activeDays'][len(temp_data['activeDays'])-1]['year'] != day_data['year']:
                temp_data['activeDays'].append(day_data)
                roadmap_collection.update_one(
                    {"_id": ObjectId(obj_id)},
                    {"$set": { "activeDays": temp_data['activeDays'] }}
                )

        return jsonify({'success': True})


@app.route('/problemgenerator', methods=['POST'])
def problemgenerator():
    if request.method == 'POST':
        data = request.get_json()
        user_id = data.get('user_id')
        obj_id = data.get('_id')
        week_day = int(data.get('weekDay'))

        if data.get('type') == 1:
            query = data.get('query') 

            prompt = '''
                Generate 5 Multiple Choice Questions with single correct answers and 4 options in the following format:
                [{"question": "What is that?", "options": {"1": "Option1", "2": "Option2", "3": "Option3", "4": "Option4"}, "answer" : {"3": "Option3"}, "explaination": "This is explaination."}, ... , {"question": "What is that?", "options": {"0": "Option1", "1": "Option2", "3": "Option3", "4": "Option4"}, "answer" : {"3": "Option3"}, "explaination": "This is explaination."}]

                - Topic for questions is : ''' + query + '''
                - It is required that the response should be an list of objects. Don't include any other verbose explanations and don't include the markdown syntax anywhere.
            '''

            response = model.generate_content(prompt)

            if response.text[0] == '[':
                retro = json.loads(response.text)
                for ele in retro:
                    ele["solved"] = False
                
                roadmap_collection.update_one(
                    {"_id": ObjectId(obj_id)},
                    {"$set": { f"practice.{str(week_day)}": retro }}
                )
                
                problems_data = roadmap_collection.find_one({"_id": ObjectId(data.get("_id")), "userId": user_id}, {"_id": 1, "practice": 1})
                
                return jsonify({"success": True, "practice": problems_data['practice'] }), 200
            
            elif response.text[0] == '`':
                retro = json.loads(response.text[7:-3])
                for ele in retro:
                    ele["solved"] = False
                
                roadmap_collection.update_one(
                    {"_id": ObjectId(obj_id)},
                    {"$set": {  f"practice.{str(week_day)}": retro }}
                )

                problems_data = roadmap_collection.find_one({"_id": ObjectId(data.get("_id")), "userId": user_id}, {"_id": 1, "practice": 1})
                
                return jsonify({"success": True, "practice": problems_data['practice'] }), 200
            
            print(response.text)
            return jsonify({"success": False}), 500

        elif data.get('type') == 2:
            query = data.get('query') 

            prompt = '''
                Generate 5 Multiple Choice Questions with single correct answers and 4 options in the following format:
                [{"question": "What is that?", "options": {"1": "Option1", "2": "Option2", "3": "Option3", "4": "Option4"}, "answer" : {"3": "Option3"}, "explaination": "This is explaination."}, ... , {"question": "What is that?", "options": {"0": "Option1", "1": "Option2", "3": "Option3", "4": "Option4"}, "answer" : {"3": "Option3"}, "explaination": "This is explaination."}]

                - Topic for questions is : ''' + query + '''
                - It is required that the response should be an list of objects. Don't include any other verbose explanations and don't include the markdown syntax anywhere.
            '''

            response = model.generate_content(prompt)
            
            if response.text[0] == '[':
                temp_data = roadmap_collection.find_one({"_id": ObjectId(obj_id)})
                retro = json.loads(response.text)
                for ele in retro:
                    ele["solved"] = False
                
                temp_data['practice'][str(week_day)] += retro
                roadmap_collection.update_one(
                    {"_id": ObjectId(obj_id)},
                    {"$set": { "practice": temp_data['practice'] }}
                )

                problems_data = roadmap_collection.find_one({"_id": ObjectId(data.get("_id")), "userId": user_id}, {"_id": 1, "practice": 1})
                
                return jsonify({"success": True, "practice": problems_data['practice'] }), 200
            
            elif response.text[0] == '`':
                temp_data = roadmap_collection.find_one({"_id": ObjectId(obj_id)})
                retro = json.loads(response.text[7:-3])
                for ele in retro:
                    ele["solved"] = False
                
                temp_data['practice'][str(week_day)] += retro
                roadmap_collection.update_one(
                    {"_id": ObjectId(obj_id)},
                    {"$set": { "practice": temp_data['practice'] }}
                )

                problems_data = roadmap_collection.find_one({"_id": ObjectId(data.get("_id")), "userId": user_id}, {"_id": 1, "practice": 1})
                
                return jsonify({"success": True, "practice": problems_data['practice'] }), 200
            
            print(response.text)
            return jsonify({"success": False}), 500


@app.route('/problemhandler', methods=['POST'])
def problemhandler():
    if request.method == 'POST':
        data = request.get_json()
        obj_id = data.get('_id')
        week_day = data.get('weekDay')
        indexer = data.get('index')
        keyer = data.get('key')

        temp1 = f"practice.{week_day}"
        temp2 = f"practice.{week_day}.{indexer}.solved"

        test = roadmap_collection.find_one(
            {"_id": ObjectId(obj_id)},
            {temp1: 1}
        )

        notor = [int(key) for key in test['practice'][str(week_day)][int(indexer)]['answer'].keys()][0]
        if notor == int(keyer):
            roadmap_collection.update_one(
                {"_id": ObjectId(obj_id)},
                {"$set": { temp2 : True }}
            )
            return jsonify({"success": True, "answer": {notor: test['practice'][str(week_day)][int(indexer)]['answer'][f"{notor}"]}, "explaination": test['practice'][str(week_day)][int(indexer)]['explaination']}), 200
        else:
            return jsonify({"success": False}), 200


# if __name__ == '__main__':
#     app.run(debug=True, host='0.0.0.0')