'use strict';
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jsonwebtoken = require("jsonwebtoken");
const randomstring = require("randomstring"); 
const fetch = require("node-fetch");

const iss = process.env.GUESTISSID;
const secret = process.env.GUESTSEC;

// create application/json parser
var jsonParser = bodyParser.json();

//create application/x-www-form-urlencoded parser
//var urlencodedParser = bodyParser.urlencoded({ extended: false });

//enable CORS support
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// POST to /jot - processes only JSON bodies
app.post('/jot', jsonParser, (req, res) => {
    // check to see if valid JSON is being sent
    if (!req.body.name || !req.body.email || !req.is('application/json')) return res.status(400).send('Bad Request - Please send me valid JSON to process');

    console.log("Recieved NAME = " + req.body.name + "\nRecieved EMAIL = " + req.body.email);

    let guestToken = new Promise((resolve, reject) => {
        resolve(
        jsonwebtoken.sign(
                {
                    "sub": randomstring.generate(8),
                    "name": req.body.name,
                    "iss": iss
                }, 
                Buffer.from(secret, 'base64'), 
                { 
                    expiresIn: '1h' 
                }
            )
        );
        reject("Something went wrong while building JWT");
    });

    guestToken.then((jot) => {
        //fetchOAuth(jot).then(cot => res.json(cot));
        console.log("Created JWT = " + jot);
        res.json(jot);
    });

});


app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
    
});

app.post('/cot', jsonParser, (req, res) => {

    // check to see if valid JSON is being sent
    if (!req.body.jwt || !req.is('application/json')) return res.status(400).send('Bad Request - Please send me valid JSON to process');

    fetch('https://api.ciscospark.com/v1/jwt/login', { 
                method: 'POST',
                headers: { 'Authorization': req.body.jwt },
            })
            .then(res => res.json())
            .then(json => {
                console.log("Got OAuth from Spark = " + JSON.stringify(json));
                res.json(json);
            });
        });

//app.listen(3000); // <-- comment this line out from your app
module.exports = app; // export your app so aws-serverless-express can use it