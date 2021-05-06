require('dotenv').config()
const redis = require('redis');
const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());
const client = redis.createClient({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT });
client.on('error', err => {
    console.log('Error ' + err);
    process.exit(1)
});
exp = Math.floor(Date.now() / 1000) + parseInt(process.env.ACCESS_TOKEN_LIFE)
// app.use(express.urlencoded({ extended: true }));
// app.post("/", extractToken, (req, res) => {
// jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET, (err, authData) => {
//     if (err) {
//       res.sendStatus(403);
//     } else {
//       res.json({
//         authData,
//       });
//     }
// });
// });
app.post("/login", (req, res) => {
    if (req.body.username == "abohmeed" && req.body.password == "password") {
        jwt.sign({
            exp: exp,
            user: {
                username: req.body.username
            }
        }, process.env.ACCESS_TOKEN_SECRET, (err, token) => {
            client.set(req.body.username, token, (err, reply) => {
                if (err)
                    throw err;
            });
            client.expireat(req.body.username, exp);
            res.json({ token })
        });
    } else {
        res.status(403).send('forbidden >_<')
    }
});
// function extractToken(req, res, next) {
// const bearerHeader = req.headers["authorization"];
// if (typeof bearerHeader !== "undefined") {
//     const bearerToken = bearerHeader.split(" ")[1];
//     req.token = bearerToken;
//     next();
// } else {
//     res.sendStatus(403);
// }
// }
function saveToken(username, jwtToken) {
    client.set(username, jwtToken, (err, reply) => {
        if (err)
            throw err;



        console.log(reply);
    });
}
// client.get('foo', (err, reply) => {
// if (err) throw err;
// console.log(reply);
// });

app.listen(3000, () => console.log("Server started"));
