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

exports.getUserOrderData = functions.https.onRequest((req, res)=>{
    return cors(req, res, ()=>{
        var oData = [];
        req.body.orders.forEach((data)=>{
            admin.database().ref(`Orders/${data}`).once('value').then((snapshot)=>{
                var order = snapshot.val();
                if (order) {
                    oData.push(order);
                }
                if (oData.length === req.body.orders.length) {
                    res.status(200).send({orderData: oData});
                }
            }).catch((error)=>{
                res.status(500).send("Couldn't get data from database");
            })
        })
    })
})

exports.getClosestShops = functions.https.onRequest((req, res)=>{
    return cors(req, res, ()=>{
        var places = req.body;
        admin.database().ref(`Shops/`).once('value').then((snapshot)=>{
            var shops = snapshot.val();
            if(shops){
                var gmapIDs = [];
                var result = [];
                Object.keys(shops).forEach((shop)=>{
                    gmapIDs.push(shops[shop].gmap_id);
                })
                places.forEach((place)=>{
                    var ind = gmapIDs.indexOf(place.id);
                    if(ind>=0){
                        shops[Object.keys(shops)[ind]].address = place.formatted_address;
                        result.push(shops[Object.keys(shops)[ind]]);
                    }
                })
                res.status(200).send({shops:result});
            }
        }).catch((error)=>{
            res.status(500).send("Couldn't get data from database");
        })
    })
})

exports.getPizzas = functions.https.onRequest((req, res)=>{
    return cors(req, res, ()=>{
        var idList = req.body.pizzas;
        var dataList = [];
        idList.forEach((id)=>{
            admin.database().ref(`Pizzas/${id}`).once('value').then((snapshot)=>{
                var pizzaData = snapshot.val();
                pizzaData.id = id;
                dataList.push(pizzaData);
                if (dataList.length === idList.length){
                    res.status(200).send(dataList);
                }
            }).catch((error)=>{
                res.status(500).send("Couldn't get data from database");
            })
        })
    })
})