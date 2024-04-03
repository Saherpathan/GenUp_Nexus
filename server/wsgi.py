from app import app
from flask import Flask
from flask_socketio import SocketIO, emit

socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('connection')
def connect():
    print('Client connected')

@socketio.on('pointerMove')
def handle_pointer_move(data):
    emit('remotePointerMove', data, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)
