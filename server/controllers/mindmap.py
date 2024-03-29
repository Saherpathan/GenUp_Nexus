from flask import jsonify
from bson import json_util, ObjectId

def saveMindmap(data, userId, savedMindmap):
    try:
        result = savedMindmap.insert_one({
            "userId": userId,
            "data": data,
        })

        print(result.inserted_id)
        return jsonify({"result": str(result.inserted_id)}), 201
    except Exception as e:
        print(e) 
        return jsonify({"error": "An error occurred"}), 500

def getMindmap(userId, savedMindmap):
    try:
        results = savedMindmap.find({"userId": userId})
        mindmaps = [{"_id": str(result["_id"]), "data": result["data"]} for result in results]

        if mindmaps:
            # Convert ObjectId to string for JSON serialization
            return json_util.dumps({"data": mindmaps}), 200
        else:
            return jsonify({"msg": "No Mindmap stored"}), 404
    except Exception as e:
        print(e)  
        return jsonify({"error": "An error occurred"}), 500
    
def getMindmapByid(id, savedMindmap):
    try:
        object_id = ObjectId(id)
        result = savedMindmap.find_one({"_id": object_id})
        if result:
            return json_util.dumps({"data": result}), 200
        else:
            return jsonify({"msg": "Mindmap not found"}), 404
    except Exception as e:
        print(e)
        return jsonify({"error": "An error occurred"}), 500
    
def deleteMindmap(userId, data, savedMindmap):
    try:
        object_id = ObjectId(data["_id"])
        result = savedMindmap.delete_one({"userId": userId, "_id": object_id})
        if result.deleted_count == 1:
            return jsonify({"result": True}), 200
        else:
            return jsonify({"result": False, "message": "Mindmap not found"}), 404
    except Exception as e:
        print(e)
        return jsonify({"message": "Something went wrong"}), 500