from flask import Flask, jsonify, request
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
from dotenv import load_dotenv
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

model = genai.GenerativeModel('gemini-1.0-pro',
                              generation_config=generation_config,
                              safety_settings=safety_settings)

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
                                             Company Interview : ''' + company_name)
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
@app.route('/user/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not email:
        return jsonify({"error": "Invalid email"}), 400

    existing_user = users_collection.find_one({"email": email})

    if existing_user:
        return jsonify({"message": "User already exists"}), 404

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    result = users_collection.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password
    })

    print(result)

    expires = timedelta(days=7)
    access_token = create_access_token(identity={"email": email, "id": str(result.inserted_id)}, expires_delta=expires)

    res = {"name": name, "email": email, "userId": str(result.inserted_id)}
    
    return jsonify({"result": res, "token": access_token}), 201

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

            # return jsonify({'success': True, 'data': roadmap_list})

            # roadmap_list = [
            #     {
            #         "week1": {
            #         "data": {
            #             "day1": {
            #             "description": "You will learn the basics of HTML, including the different tags and attributes.",
            #             "heading": "Day 1: Introduction to HTML",
            #             "links": [
            #                 "https://www.w3schools.com/html/",
            #                 "https://developer.mozilla.org/en-US/docs/Glossary/HTML"
            #             ]
            #             },
            #             "day2": {
            #             "description": "You will learn the basics of CSS, including the different properties and selectors.",
            #             "heading": "Day 2: Introduction to CSS",
            #             "links": [
            #                 "https://www.w3schools.com/css/",
            #                 "https://developer.mozilla.org/en-US/docs/Glossary/CSS"
            #             ]
            #             },
            #             "day3": {
            #             "description": "You will learn the basics of JavaScript, including the different data types and operators.",
            #             "heading": "Day 3: Introduction to JavaScript",
            #             "links": [
            #                 "https://www.w3schools.com/js/",
            #                 "https://developer.mozilla.org/en-US/docs/Glossary/JavaScript"
            #             ]
            #             },
            #             "day4": {
            #             "description": "You will build a simple website using HTML, CSS, and JavaScript.",
            #             "heading": "Day 4: Building a Simple Website",
            #             "links": [
            #                 "https://www.w3schools.com/html/html_examples.asp",
            #                 "https://www.w3schools.com/css/css_examples.asp",
            #                 "https://www.w3schools.com/js/js_examples.asp"
            #             ]
            #             },
            #             "day5": {
            #             "description": "You will learn how to debug your website and fix any errors.",
            #             "heading": "Day 5: Debugging Your Website",
            #             "links": [
            #                 "https://www.w3schools.com/html/html_debug.asp",
            #                 "https://www.w3schools.com/css/css_debug.asp",
            #                 "https://www.w3schools.com/js/js_debug.asp"
            #             ]
            #             },
            #             "day6": {
            #             "description": "You will learn how to deploy your website to a web server.",
            #             "heading": "Day 6: Deploying Your Website",
            #             "links": [
            #                 "https://www.w3schools.com/html/html_website.asp",
            #                 "https://www.w3schools.com/css/css_website.asp",
            #                 "https://www.w3schools.com/js/js_website.asp"
            #             ]
            #             },
            #             "day7": {
            #             "description": "You will review what you have learnt this week and take an assessment to test your understanding.",
            #             "heading": "Day 7: Review and Assessment",
            #             "links": [
                            
            #             ]
            #             }
            #         },
            #         "description": "In this week, you will learn the basics of web development, including HTML, CSS, and JavaScript.",
            #         "title": "Getting Started with Web Development"
            #         }
            #     },
            #     {
            #         "week2": {
            #         "data": {
            #             "day1": {
            #             "description": "You will learn how to make your website responsive so that it looks good on all devices.",
            #             "heading": "Day 1: Responsive Design",
            #             "links": [
            #                 "https://www.w3schools.com/css/css_rwd_intro.asp",
            #                 "https://developer.mozilla.org/en-US/docs/Glossary/Responsive_web_design"
            #             ]
            #             },
            #             "day2": {
            #             "description": "You will learn how to make your website accessible to people with disabilities.",
            #             "heading": "Day 2: Accessibility",
            #             "links": [
            #                 "https://www.w3.org/WAI/fundamentals/accessibility-intro/",
            #                 "https://developer.mozilla.org/en-US/docs/Glossary/Accessibility"
            #             ]
            #             },
            #             "day3": {
            #             "description": "You will learn about advanced HTML5 features, such as the canvas element and the video element.",
            #             "heading": "Day 3: Advanced HTML5 Features",
            #             "links": [
            #                 "https://www.w3schools.com/html/html5_intro.asp",
            #                 "https://developer.mozilla.org/en-US/docs/Glossary/HTML5"
            #             ]
            #             },
            #             "day4": {
            #             "description": "You will learn about advanced CSS3 features, such as the flexbox layout and the grid layout.",
            #             "heading": "Day 4: Advanced CSS3 Features",
            #             "links": [
            #                 "https://www.w3schools.com/css/css3_intro.asp",
            #                 "https://developer.mozilla.org/en-US/docs/Glossary/CSS3"
            #             ]
            #             },
            #             "day5": {
            #             "description": "You will build a more complex website using HTML, CSS, and JavaScript.",
            #             "heading": "Day 5: Building a More Complex Website",
            #             "links": [
            #                 "https://www.w3schools.com/html/html_examples.asp",
            #                 "https://www.w3schools.com/css/css_examples.asp",
            #                 "https://www.w3schools.com/js/js_examples.asp"
            #             ]
            #             },
            #             "day6": {
            #             "description": "You will learn how to debug your website and fix any errors.",
            #             "heading": "Day 6: Debugging Your Website",
            #             "links": [
            #                 "https://www.w3schools.com/html/html_debug.asp",
            #                 "https://www.w3schools.com/css/css_debug.asp",
            #                 "https://www.w3schools.com/js/js_debug.asp"
            #             ]
            #             },
            #             "day7": {
            #             "description": "You will review what you have learnt this week and take an assessment to test your understanding.",
            #             "heading": "Day 7: Review and Assessment",
            #             "links": [
                            
            #             ]
            #             }
            #         },
            #         "description": "In this week, you will learn more advanced HTML and CSS techniques, including responsive design and accessibility.",
            #         "title": "Advanced HTML and CSS"
            #         }
            #     },
            #     {
            #         "week3": {
            #         "data": {
            #             "day1": {
            #             "description": "You will learn the basics of JavaScript, including the different data types and operators.",
            #             "heading": "Day 1: Introduction to JavaScript",
            #             "links": [
            #                 "https://www.w3schools.com/js/",
            #                 "https://developer.mozilla.org/en-US/docs/Glossary/JavaScript"
            #             ]
            #             },
            #             "day2": {
            #             "description": "You will learn about control flow in JavaScript, including the different types of loops and conditional statements.",
            #             "heading": "Day 2: Control Flow",
            #             "links": [
            #                 "https://www.w3schools.com/js/js_control.asp",
            #                 "https://developer.mozilla.org/en-US/docs/Glossary/Control_flow"
            #             ]
            #             },
            #             "day3": {
            #             "description": "You will learn about functions in JavaScript, including how to define and call them.",
            #             "heading": "Day 3: Functions",
            #             "links": [
            #                 "https://www.w3schools.com/js/js_functions.asp",
            #                 "https://developer.mozilla.org/en-US/docs/Glossary/Function"
            #             ]
            #             },
            #             "day4": {
            #             "description": "You will learn about arrays and objects in JavaScript, including how to create and use them.",
            #             "heading": "Day 4: Arrays and Objects",
            #             "links": [
            #                 "https://www.w3schools.com/js/js_arrays.asp",
            #                 "https://www.w3schools.com/js/js_objects.asp",
            #                 "https://developer.mozilla.org/en-US/docs/Glossary/Array",
            #                 "https://developer.mozilla.org/en-US/docs/Glossary/Object"
            #             ]
            #             },
            #             "day5": {
            #             "description": "You will build a simple JavaScript application using the concepts you have learnt this week.",
            #             "heading": "Day 5: Building a Simple JavaScript Application",
            #             "links": [
            #                 "https://www.w3schools.com/js/js_examples.asp"
            #             ]
            #             },
            #             "day6": {
            #             "description": "You will learn how to debug your JavaScript application and fix any errors.",
            #             "heading": "Day 6: Debugging Your JavaScript Application",
            #             "links": [
            #                 "https://www.w3schools.com/js/js_debug.asp"
            #             ]
            #             },
            #             "day7": {
            #             "description": "You will review what you have learnt this week and take an assessment to test your understanding.",
            #             "heading": "Day 7: Review and Assessment",
            #             "links": [
                            
            #             ]
            #             }
            #         },
            #         "description": "In this week, you will learn the basics of JavaScript, including the different data types, operators, and control flow.",
            #         "title": "Introduction to JavaScript"
            #         }
            #     },
            #     {
            #         "week4": {
            #         "data": {
            #             "day1": {
            #             "description": "You will learn how to handle events in JavaScript, such as clicks, mouse movements, and keyboard presses.",
            #             "heading": "Day 1: Event Handling",
            #             "links": [
            #                 "https://www.w3schools.com/js/js_events.asp",
            #                 "https://developer.mozilla.org/en-US/docs/Glossary/Event"
            #             ]
            #             },
            #             "day2": {
            #             "description": "You will learn about AJAX and how to use it to communicate with a server without reloading the page.",
            #             "heading": "Day 2: AJAX",
            #             "links": [
            #                 "https://www.w3schools.com/xml/ajax_intro.asp",
            #                 "https://developer.mozilla.org/en-US/docs/Glossary/AJAX"
            #             ]
            #             },
            #             "day3": {
            #             "description": "You will learn about JSON and how to use it to exchange data between a server and a web page.",
            #             "heading": "Day 3: JSON",
            #             "links": [
            #                 "https://www.w3schools.com/json/",
            #                 "https://developer.mozilla.org/en-US/docs/Glossary/JSON"
            #             ]
            #             },
            #             "day4": {
            #             "description": "You will learn about jQuery and how to use it to simplify JavaScript development.",
            #             "heading": "Day 4: jQuery",
            #             "links": [
            #                 "https://jquery.com/",
            #                 "https://developer.mozilla.org/en-US/docs/Glossary/jQuery"
            #             ]
            #             },
            #             "day5": {
            #             "description": "You will build a more complex JavaScript application using the concepts you have learnt this week.",
            #             "heading": "Day 5: Building a More Complex JavaScript Application",
            #             "links": [
                            
            #             ]
            #             },
            #             "day6": {
            #             "description": "You will learn how to debug your JavaScript application and fix any errors.",
            #             "heading": "Day 6: Debugging Your JavaScript Application",
            #             "links": [
                            
            #             ]
            #             },
            #             "day7": {
            #             "description": "You will review what you have learnt this week and take an assessment to test your understanding.",
            #             "heading": "Day 7: Review and Assessment",
            #             "links": [
                            
            #             ]
            #             }
            #         },
            #         "description": "In this week, you will learn more advanced JavaScript and jQuery techniques, including event handling, AJAX, and JSON.",
            #         "title": "Advanced JavaScript and jQuery"
            #         }
            #     },
            #     {
            #         "week5": {
            #         "data": {
            #             "day1": {
            #             "description": "You will learn the basics of Node.js, including how to install it and create a simple script.",
            #             "heading": "Day 1: Introduction to Node.js",
            #             "links": [
            #                 "https://nodejs.org/",
            #                 "https://developer.mozilla.org/en-US/docs/Glossary/Node.js"
            #             ]
            #             },
            #             "day2": {
            #             "description": "You will learn the basics of Express.js, including how to install it and create a simple web server.",
            #             "heading": "Day 2: Introduction to Express.js",
            #             "links": [
            #                 "https://expressjs.com/",
            #                 "https://developer.mozilla.org/en-US/docs/Glossary/Express.js"
            #             ]
            #             },
            #             "day3": {
            #             "description": "You will build a simple web server using Node.js and Express.js.",
            #             "heading": "Day 3: Building a Simple Web Server",
            #             "links": [
                            
            #             ]
            #             },
            #             "day4": {
            #             "description": "You will learn how to handle HTTP requests and responses in Node.js and Express.js.",
            #             "heading": "Day 4: Handling HTTP Requests and Responses",
            #             "links": [
                            
            #             ]
            #             },
            #             "day5": {
            #             "description": "You will learn how to use middleware in Node.js and Express.js.",
            #             "heading": "Day 5: Using Middleware",
            #             "links": [
                            
            #             ]
            #             },
            #             "day6": {
            #             "description": "You will learn how to debug your Node.js application and fix any errors.",
            #             "heading": "Day 6: Debugging Your Node.js Application",
            #             "links": [
                            
            #             ]
            #             },
            #             "day7": {
            #             "description": "You will review what you have learnt this week and take an assessment to test your understanding.",
            #             "heading": "Day 7: Review and Assessment",
            #             "links": [
                            
            #             ]
            #             }
            #         },
            #         "description": "In this week, you will learn the basics of Node.js and Express.js, including how to create and run a web server.",
            #         "title": "Introduction to Node.js and Express.js"
            #         }
            #     },
            #     {
            #         "week6": {
            #         "data": {
            #             "day1": {
            #             "description": "You will learn how to use databases in Node.js and Express.js.",
            #             "heading": "Day 1: Using Databases",
            #             "links": [
                            
            #             ]
            #             },
            #             "day2": {
            #             "description": "You will learn how to implement authentication in Node.js and Express.js.",
            #             "heading": "Day 2: Authentication",
            #             "links": [
                            
            #             ]
            #             },
            #             "day3": {
            #             "description": "You will learn how to deploy your Node.js and Express.js application to a web server.",
            #             "heading": "Day 3: Deployment",
            #             "links": [
                            
            #             ]
            #             },
            #             "day4": {
            #             "description": "You will build a more complex Node.js application using the concepts you have learnt this week.",
            #             "heading": "Day 4: Building a More Complex Node.js Application",
            #             "links": [
                            
            #             ]
            #             },
            #             "day5": {
            #             "description": "You will learn how to debug your Node.js application and fix any errors.",
            #             "heading": "Day 5: Debugging Your Node.js Application",
            #             "links": [
                            
            #             ]
            #             },
            #             "day6": {
            #             "description": "You will review what you have learnt this week and take an assessment to test your understanding.",
            #             "heading": "Day 6: Review and Assessment",
            #             "links": [
                            
            #             ]
            #             },
            #             "day7": {
            #             "description": "You will work on a project to apply the skills you have learnt this week.",
            #             "heading": "Day 7: Project",
            #             "links": [
                            
            #             ]
            #             }
            #         },
            #         "description": "In this week, you will learn more advanced Node.js and Express.js techniques, including how to use databases, authentication, and deployment.",
            #         "title": "Advanced Node.js and Express.js"
            #         }
            #     }
            # ]

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
            if roadmap_data:
                return jsonify({'success': True, 'roadmapData': {'data': roadmap_data['data']}, 'activeDays': roadmap_data['activeDays']})
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
#     temp = {
#     "data": [
#         {
#             "_id": "660c5b64fdb7f30b85660850",
#             "activeDays": [
#                 {
#                     "day": 2,
#                     "month": 4,
#                     "year": 2024,
#                     "dayOfWeek": "Tuesday"
#                 },
#                 {
#                     "day": 1,
#                     "month": 4,
#                     "year": 2024,
#                     "dayOfWeek": "Monday"
#                 },
#                 {
#                     "day": 31,
#                     "month": 3,
#                     "year": 2024,
#                     "dayOfWeek": "Sunday"
#                 },
#                 {
#                     "day": 30,
#                     "month": 3,
#                     "year": 2024,
#                     "dayOfWeek": "Saturday"
#                 },
#                 {
#                     "day": 29,
#                     "month": 3,
#                     "year": 2024,
#                     "dayOfWeek": "Friday"
#                 },
#                 {
#                     "day": 28,
#                     "month": 3,
#                     "year": 2024,
#                     "dayOfWeek": "Thursday"
#                 },
#                 {
#                     "day": 27,
#                     "month": 3,
#                     "year": 2024,
#                     "dayOfWeek": "Wednesday"
#                 },
#                 {
#                     "day": 23,
#                     "month": 3,
#                     "year": 2024,
#                     "dayOfWeek": "Saturday"
#                 },
#                 {
#                     "day": 22,
#                     "month": 3,
#                     "year": 2024,
#                     "dayOfWeek": "Friday"
#                 },
#                 {
#                     "day": 21,
#                     "month": 3,
#                     "year": 2024,
#                     "dayOfWeek": "Thursday"
#                 },
#                 {
#                     "day": 20,
#                     "month": 3,
#                     "year": 2024,
#                     "dayOfWeek": "Wednesday"
#                 },
#                 {
#                     "day": 19,
#                     "month": 3,
#                     "year": 2024,
#                     "dayOfWeek": "Tuesday"
#                 },
#                 {
#                     "day": 18,
#                     "month": 3,
#                     "year": 2024,
#                     "dayOfWeek": "Monday"
#                 },
#                 {
#                     "day": 13,
#                     "month": 3,
#                     "year": 2024,
#                     "dayOfWeek": "Wednesday"
#                 },
#                 {
#                     "day": 12,
#                     "month": 3,
#                     "year": 2024,
#                     "dayOfWeek": "Tuesday"
#                 },
#                 {
#                     "day": 11,
#                     "month": 3,
#                     "year": 2024,
#                     "dayOfWeek": "Monday"
#                 },
#                 {
#                     "day": 3,
#                     "month": 3,
#                     "year": 2024,
#                     "dayOfWeek": "Sunday"
#                 },
#                 {
#                     "day": 2,
#                     "month": 3,
#                     "year": 2024,
#                     "dayOfWeek": "Saturday"
#                 },
#                 {
#                     "day": 3,
#                     "month": 4,
#                     "year": 2024,
#                     "dayOfWeek": "Wednesday"
#                 },
#                 {
#                     "day": 4,
#                     "month": 4,
#                     "year": 2024,
#                     "dayOfWeek": "Thursday"
#                 },
#                 {
#                     "day": 5,
#                     "month": 4,
#                     "year": 2024,
#                     "dayOfWeek": "Friday"
#                 },
#                 {
#                     "day": 8,
#                     "month": 4,
#                     "year": 2024,
#                     "dayOfWeek": "Monday"
#                 }
#             ],
#             "title": "Web Development"
#         },
#         {
#             "_id": "6614f7df70efff259d69cc6b",
#             "activeDays": [
#                 {
#                     "day": 9,
#                     "month": 4,
#                     "year": 2024,
#                     "dayOfWeek": "Tuesday"
#                 }
#             ],
#             "title": "Web Development 2"
#         }
#     ]
# }
#     return json_util.dumps({"data": temp}), 200
    


@app.route('/roadmapmodder', methods=['POST'])
@auth_user
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

            roadmap_collection.update_one(
                {"_id": ObjectId(obj_id)},
                {"$set": { "data": temp_data['data'] }}
            )
            
            if temp_data['activeDays'][len(temp_data['activeDays'])-1]['day'] != day_data['day'] or temp_data['activeDays'][len(temp_data['activeDays'])-1]['month'] != day_data['month'] or temp_data['activeDays'][len(temp_data['active_days'])-1]['year'] != day_data['year']:
                temp_data['activeDays'].append(day_data)
                roadmap_collection.update_one(
                    {"_id": ObjectId(obj_id)},
                    {"$set": { "activeDays": temp_data['activeDays'] }}
                )

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


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')