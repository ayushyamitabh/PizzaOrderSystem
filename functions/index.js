'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
var ptfa = require('./ptfa.json');

admin.initializeApp({
    credential: admin.credential.cert(ptfa),
    databaseURL: "https://pos-tagmhaxt.firebaseio.com"
});

exports.addShop = functions.https.onRequest((req, res)=>{
    return cors(req, res, ()=>{
        const setData = {
            location: req.body.location,
            gmap_id: req.body.gmap_id,
            name: req.body.name
        };
        admin.database().ref(`Shops/${req.body.uid}`).set(setData).then((result)=>{
            res.status(201).send('Added new shop.');
        }, (error)=>{
            res.status(409).send('Failed to create shop.');
        })
    });
});