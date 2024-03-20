from flask import request, jsonify
import jwt

from dotenv import load_dotenv
import os

load_dotenv()

def auth_user(next_function):
    def middleware_function(*args, **kwargs):
        try:
            token = request.headers.get('Authorization', '').split(" ")[1]
            is_custom_auth = len(token) < 500
            decoded_data = None

            if token and is_custom_auth:
                secret_key = os.getenv('JWT_SECRET')
                decoded_data = jwt.decode(token, secret_key, algorithms=["HS256"])
                print(decoded_data)
                dat = decoded_data.get('sub')
                request.email = dat.get('email')
                request.userId = dat.get('id')
            else:
                #google auth
                decoded_data = jwt.decode(token)
                request.email = decoded_data.get('email')
                request.userId = decoded_data.get('sub')

            return next_function(*args, **kwargs)

        except Exception as e:
            print(e)  # Log the error if needed
            return jsonify({"error": "Unauthorized"}), 401

    return middleware_function