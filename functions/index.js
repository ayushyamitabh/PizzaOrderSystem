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

exports.doesShopExist = functions.https.onRequest((req, res)=>{
    return cors(req, res, ()=>{
        admin.database().ref(`Shops/`).once('value').then((snapshot)=>{
            var shops = snapshot.val();
            if (shops) {
                Object.keys(shops).forEach((key, index)=>{
                    if (shops[key].gmap_id === req.body.gmap_id) {
                        res.status(200).send({found: true});
                    }
                })
                res.status(200).send({found: false});
            }
        }).catch((error)=>{
            res.status(500).send("Couldn't get data from database");
        })
    })
})