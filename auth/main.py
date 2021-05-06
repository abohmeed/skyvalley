from flask import Flask, request, jsonify, make_response, app
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import jwt
import datetime
from functools import wraps

app.config['SECRET_KEY'] = 'Th1s1ss3cr3t'


@app.route('/register', methods=['GET', 'POST'])
def signup_user():
    data = request.get_json()
    hashed_password = generate_password_hash(data['password'], method='sha256')
    return jsonify({'message': 'registered successfully'})
