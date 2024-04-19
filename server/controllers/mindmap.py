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

def saveMindmapById(data, userId, savedMindmap):
    try:
        map_id = data["_id"]
        existing_map = savedMindmap.find_one({"_id": ObjectId(map_id)})
        
        if existing_map:
            existing_user_id = existing_map.get("userId")
            
            if existing_user_id != userId:
                # If the existing map belongs to a different user, create a new map for the current user
                savedMindmap.insert_one({
                    "userId": userId,
                    "data": data["data"]
                })
                return jsonify({"message": "Mindmap Saved to your space!"}), 201
            else:
                # If the existing map belongs to the current user, update it with the new data
                savedMindmap.update_one({"_id": ObjectId(map_id)}, {"$set": {"data": data["data"]}})
                return jsonify({"message": "Mindmap Updated!"}), 200
        else:
            # If the map does not exist, create a new one with the provided _id for the current user
            savedMindmap.insert_one({
                "_id": ObjectId(map_id),
                "userId": userId,
                "data": data["data"]
            })
            return jsonify({"message": "Minmdap Saved!"}), 201
    except Exception as e:
        print(e) 
        return jsonify({"error": "An error occurred"}), 500

def saveGeneratedData(mapId, nodeId, json_data, savedMindmap):
    try:
        mindMap = savedMindmap.find_one({"_id": ObjectId(mapId)})

        # if mindMap["userId"] != userId:
        #     return jsonify({"message": "Unauthorized"}), 401
        
        initialNode = mindMap["data"]["initialNodes"]

        for node in initialNode:
            if node["id"] == nodeId:
                node["data"]["GenData"] = json_data

        # print(initialNode);
        savedMindmap.update_one({"_id": ObjectId(mapId)}, {"$set": {"data.initialNodes": initialNode}})
        return jsonify({"message": "Data Added!"}), 200

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
    
def getMindmapHistory(userId, savedMindmap):
    try:
        results = savedMindmap.find({"userId": userId}).limit(3)
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