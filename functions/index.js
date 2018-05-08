'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
var ptfa = require('./ptfa.json');
var googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyAyZVH3IJTKen6oYJ8WmUP_BazsTy_AgUg'
});

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

exports.rateDeliverer = functions.https.onRequest((req, res)=>{
    return cors(req, res, ()=>{
        const duid = req.body.duid;
        const orderID = req.body.oid;
        const orderData = req.body.odata;
        admin.database().ref(`Users/${duid}`).once('value').then((snap)=>{
            if (snap.val()){
                var preserveData = snap.val();
                var delivererData = snap.val();
                var a = delivererData.averageRating * delivererData.ratingCount; // existing rating sum
                var b = a + orderData.delivererRating; // new rating sum
                var c = b / (delivererData.ratingCount + 1); // new average rating
                delivererData.averageRating = c;
                delivererData.ratingCount += 1;
                admin.database().ref(`Users/${duid}`).set(delivererData).then(()=>{
                    admin.database().ref(`Orders/${orderID}`).set(orderData).then(()=>{
                        res.status(200).send({done:true, message:"Updated deliverer's rating 😊"})
                    }).catch((err)=>{
                        res.status(500).send({done:false,error:err,message:"Couldn't update order data."})
                    })
                }).catch((err)=>{
                    res.status(500).send({done:false,error:err,message:"Couldn't update deliverer's data."})
                })
            }
        }).catch((err)=>{
            res.status(500).send({done:false,error:err,message:"Couldn't get deliverer's data."})
        })
    })
})

exports.ratePizza = functions.https.onRequest((req,res)=>{
    return cors(req, res, ()=>{
        const oid = req.body.oid;
        const odata = req.body.odata;
        const pid = req.body.pid;
        admin.database().ref(`Orders/${oid}`).set(odata).then(()=>{
            admin.database().ref(`Pizzas/${pid}`).once('value').then((snap)=>{
                if(snap.val()){
                    var pizzaData = snap.val();
                    var a = pizzaData.averageRating * pizzaData.totalOrders;
                    var b = a + odata.pizzaRatings[pid].rating;
                    var c = b / (pizzaData.totalOrders + 1);
                    pizzaData.averageRating = c;
                    pizzaData.totalOrders += 1;
                    if (pizzaData.lastThreeRatings){
                        if (pizzaData.lastThreeRatings.length >= 3){
                            var newRatings = [pizzaData.lastThreeRatings[1], pizzaData.lastThreeRatings[2], odata.pizzaRatings[pid].rating];
                            pizzaData.lastThreeRatings = newRatings;
                        } else {
                            pizzaData.lastThreeRatings.push(odata.pizzaRatings[pid].rating);
                        }
                    } else {
                        pizzaData.lastThreeRatings =[odata.pizzaRatings[pid].rating];
                    }
                    admin.database().ref(`Pizzas/${pid}`).set(pizzaData).then(()=>{
                        res.status(200).send({done:true,message:"Updated pizza's rating 😊"});
                    }).catch((err)=>{
                        res.status(500).send({done:false,error:err,message:"Couldn't update pizza's data."});
                    })
                }
            }).catch((err)=>{
                res.status(500).send({done:false,error:err,message:"Couldn't get pizza's data."});
            })
        }).catch((err)=>{
            res.status(500).send({done:false,error:err,message:"Couldn't update order's data."});
        })
    })
})

exports.mobileGetPlaces = functions.https.onRequest((req,res)=>{
    return cors(req, res, ()=>{
        var searchReq = {
            location: req.body.location,
            radius: 250,
            query: 'pizza'
        };
        googleMapsClient.places(searchReq, (err, response)=>{
            if(!err){
                res.status(200).send(response.json.results);
            } else {
                res.status(500).send(err);
            }
        });
    })
})