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
    databaseURL: "https://pos-tagmhaxt.firebaseio.com",
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
                        if (pizzaRatings.lastThreeRatings.length >= 3) {
                            var SUB_PAR_COUNT = 0;
                            pizzaRatings.lastThreeRatings.forEach((data, index) => {
                                if (data < 3) {
                                    SUB_PAR_COUNT += 1;
                                }
                            });
                            if (SUB_PAR_COUNT >= 3){
                                admin.database().ref(`Pizzas/${pid}`).set(null).then(()=>{
                                    res.status(200).send({done:true,message:"Updated pizza's rating 😊"});
                                })
                            } else {
                                res.status(200).send({done:true,message:"Updated pizza's rating 😊"});
                            }
                        }
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

exports.rateCustomer = functions.https.onRequest((req, res)=>{
    return cors(req, res, ()=>{
        admin.database().ref(`Users/${req.body.uid}`).once('value').then((snap)=>{
            const USER_DATA = snap.val();
            if (USER_DATA) {
                if (USER_DATA.averageRating) {
                    var a = USER_DATA.averageRating * USER_DATA.totalRatings;
                    var b = USER_DATA.averageRating + req.body.rating;
                    USER_DATA.totalRatings += 1;
                    USER_DATA.averageRating = b / USER_DATA.totalRatings;
                } else {
                    USER_DATA.averageRating = req.body.rating;
                    USER_DATA.totalRatings = 1;
                }
                admin.database().ref(`Users/${req.body.uid}`).set(USER_DATA).then(()=>{
                    admin.database().ref(`Orders/${req.body.oid}/customerRating`).set(req.body.rating).then(()=>{
                        res.status(200).send({message:"Successfully updated customer's rating 😊"});
                    }).catch((err)=>{
                        res.status(500).send(err);
                    })
                }).catch((err)=>{
                    res.status(500).send(err);
                })
            }
        }).catch((err)=>{
            res.status(500).send(err);
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

exports.registerUserStatus = functions.https.onRequest((req, res)=>{
    return cors(req, res, ()=>{
        var rData = req.body;
        admin.database().ref('Shops')
        .orderByChild('gmap_id')
        .equalTo(rData.gmap_id)
        .once('value')
        .then((snap)=>{
            admin.database().ref('Shops').orderByChild('gmap_id').equalTo(rData.gmap_id).once('value').then((snap)=>{
                var shopData = snap.val();
                var shopUID = Object.keys(shopData)[0];
                var shop = shopData[shopUID];
                admin.database().ref(`Users/${rData.uid}/shops`).once('value').then((snap)=>{
                    if (snap.val()){
                        var old = snap.val();
                        if (old.indexOf(shopUID)<0) {
                            old.push(shopUID);
                            admin.database().ref(`Users/${rData.uid}/shops`).set(old);
                        }
                    } else {
                        admin.database().ref(`Users/${rData.uid}/shops`).set([shopUID]);
                    }
                })
                if (rData.currentStatus === 'visitor'){
                    if (shop.registeredRequests){
                        if (shop.registeredRequests.indexOf(rData.uid) >= 0){
                            res.status(200).send({message:"You've already applied, your status will be updated soon."});
                        } else {
                            shop.registeredRequests.push(rData.uid);
                            admin.database().ref(`Shops/${shopUID}`).set(shop).then(()=>{
                                res.status(200).send({message:'Sent your application! 😊'});
                            })
                        }
                    } else {
                        shop.registeredRequests = [rData.uid];
                        admin.database().ref(`Shops/${shopUID}`).set(shop).then(()=>{
                            res.status(200).send({message:'Sent your application! 😊'});
                        })
                    }
                } else if (rData.currentStatus === 'registered'){
                    if (shop.vipRequests) {
                        if (shop.vipRequests.indexOf(rData.uid)>= 0){
                            res.status(200).send({message:"You've already applied, your status will be updated soon."});
                        } else {
                            shop.vipRequests.push(rData.uid);
                            admin.database().ref(`Shops/${shopUID}`).set(shop).then(()=>{
                                res.status(200).send({message:'Sent your application! 😊'});
                            })
                        }
                    } else {
                        shop.vipRequests = [rData.uid];
                        admin.database().ref(`Shops/${shopUID}`).set(shop).then(()=>{
                            res.status(200).send({message:'Sent your application! 😊'});
                        })
                    }
                }
            })
            .catch((err)=>{
                res.status(500).send({message:"Couldn't apply right now 😟"});
            })
        })
    })
})

exports.placeOrder = functions.https.onRequest((req,res)=>{
    return cors(req, res, ()=>{
        admin.database().ref('Shops')
        .orderByChild('gmap_id')
        .equalTo(req.body.cart.gmap_id)
        .once('value')
        .then((snap)=>{
            if (snap.val()) {
                const SHOPS = snap.val();
                const SHOP_UID = Object.keys(SHOPS)[0];
                const SHOP_DATA = SHOPS[SHOP_UID];

                var PIZZA_RATINGS = {};
                Object.keys(req.body.cart.items).forEach((key, index)=>{
                    const TEMP_PIZZA = {
                        name: req.body.cart.items[key].name,
                        rating: 0,
                        drawing: req.body.images[key]?req.body.images[key]:null
                    };
                    PIZZA_RATINGS[key] = TEMP_PIZZA;
                });

                const ORDER_DATA = {
                    cuid: req.body.cuid,
                    customerRating: 0,
                    delivererRating: 0,
                    oid: `orderID${req.body.orderNumber}`,
                    pizzaRatings: PIZZA_RATINGS,
                    status: 'ordered',
                    total: req.body.cart.total,
                    shopName: req.body.cart.name,
                    shop: SHOP_UID,
                    payment: req.body.payment
                };
                
                admin.database().ref(`Orders/orderID${req.body.orderNumber}`)
                .set(ORDER_DATA)
                .then(()=>{
                    if (SHOP_DATA.orders) {
                        SHOP_DATA.orders.push(`orderID${req.body.orderNumber}`);
                    } else {
                        SHOP_DATA.orders = [`orderID${req.body.orderNumber}`];
                    }
                    admin.database().ref(`Shops/${SHOP_UID}/orders`).set(SHOP_DATA.orders).then(()=>{
                        admin.database().ref(`Users/${req.body.cuid}/orders`).once('value').then((snap)=>{
                            if(snap.val()){
                                var USER_ORDERS = snap.val();
                                USER_ORDERS.push(`orderID${req.body.orderNumber}`);
                                admin.database().ref(`Users/${req.body.cuid}/orders`).set(USER_ORDERS).then(()=>{
                                    res.status(200).send({message:"Successfully placed your order"});
                                })
                            } else {
                                admin.database().ref(`Users/${req.body.cuid}/orders`).set([`orderID${req.body.orderNumber}`]).then(()=>{
                                    res.status(200).send({message:"Successfully placed your order"});
                                })
                            }
                        })
                    })
                })
                .catch((err)=>{
                    res.status(500).send({error:err,message:"Couldn't place your order - please try again in a moment."});
                })
            }
        })
    })
})