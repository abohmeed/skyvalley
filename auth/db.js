require('dotenv').config()
const mongoClient = require('mongodb').MongoClient;
const uri = "mongodb://" + process.env.MONGODB_HOST + ":" + process.env.MONGODB_PORT;
const bcrypt = require('bcrypt');
const saltRounds = 10;
const redis = require('redis');
const redisClient = redis.createClient({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT });
redisClient.on('error', err => {
    console.log('Error ' + err);
    process.exit(1)
});
const jwt = require("jsonwebtoken");
const exp = Math.floor(Date.now() / 1000) + parseInt(process.env.ACCESS_TOKEN_LIFE)
exports.add = (user, res) => {
    user = user
    mongoClient.connect(uri, (err, client) => {
        if (err) {
            throw err;
        } else {
            var db = client.db("UserDB")
            db.collection('Users').findOne({ "username": user.username }, (err, result) => {
                if (err) {
                    throw err
                }
                if (result) {
                    res.status(406).json({ "message": "The user already exists" })
                } else {
                    bcrypt.genSalt(saltRounds, (err, salt) => {
                        if (err) {
                            throw err
                        } else {
                            bcrypt.hash(user.password, salt, (err, hash) => {
                                if (err) {
                                    throw err
                                } else {
                                    user.password = hash
                                    db.collection('Users').insertOne(user, (err, result) => {
                                        if (err) {
                                            throw err;
                                        }
                                        res.status(201).json({ "message": "User created successfully" })
                                    });
                                };
                            });
                        };
                    });
                };
            });
        };
    });
};
exports.login = (username, password, response) => {
    mongoClient.connect(uri, (err, client) => {
        if (err) {
            throw err
        } else {
            var db = client.db("UserDB")
            db.collection('Users').findOne({ "username": username }, (err, result) => {
                if (err) {
                    throw err
                } else {
                    if (result) {
                        bcrypt.compare(password, result.password, (err, res) => {
                            if (err) {
                                throw err
                            } else {
                                if (res) {
                                    jwt.sign({
                                        exp: exp,
                                        user: {
                                            username: username
                                        }
                                    }, process.env.ACCESS_TOKEN_SECRET, (err, token) => {
                                        redisClient.set(username, token, (err, reply) => {
                                            if (err)
                                                throw err;
                                        });
                                        redisClient.expireat(username, exp);
                                        response.json({ token })
                                    });
                                } else {
                                    response.status(403).json({ "error": "Invalid username or password" })
                                }
                            }
                        })
                    } else {
                        response.status(403).json({ "error": "Invalid username or password" })
                    }
                }
            })
        }
    })
}