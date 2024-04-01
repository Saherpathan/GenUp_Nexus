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
from controllers.mindmap import saveMindmap, getMindmap, deleteMindmap, getMindmapByid, saveMindmapById
import json
from bson import ObjectId
from dotenv import load_dotenv
import os


load_dotenv()

app = Flask(__name__)

bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET')

# MongoDB configuration
username = urllib.parse.quote_plus(os.getenv('MONGO_USERNAME'))
password = urllib.parse.quote_plus(os.getenv('MONGO_PASSWORD'))
restUri = os.getenv('REST_URI');

uri = f'mongodb+srv://{username}:{password}{restUri}'

client = MongoClient(uri, server_api=ServerApi('1'))
db = client.GenUpNexus
users_collection = db["users"]
interviews_collection = db["interviews"]
savedMindmap = db["savedMindmap"]

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)


GOOGLE_API_KEY=os.getenv('GOOGLE_API_KEY')

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# Caches to reduce no of queries to MongoDB...
user_id_ping = {'current': 0}
user_chats = {}

@app.route('/')
def index():
    return "Server is Running..."

@app.route('/index')
def index2():
    return "routes checking..."

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

    print(result);

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
    print(data);
    return get_initial_data(), 200


# if __name__ == '__main__':
#     app.run(debug=True)