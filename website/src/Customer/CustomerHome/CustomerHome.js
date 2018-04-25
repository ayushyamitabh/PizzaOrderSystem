import React, {Component} from 'react';
import {Avatar,
        Button,
        Card,
        CardActions,
        CardContent,
        CardHeader,
        CardMedia,
        Dialog,
        DialogActions,
        DialogContent,
        DialogContentText,
        DialogTitle,
        Divider,
        FormControl,
        IconButton,
        Input,
        InputAdornment,
        InputLabel,
        LinearProgress,
        MenuList,
        MenuItem,
        Popover,
        Snackbar,
        TextField,
        Typography} from 'material-ui';
import * as firebase from 'firebase';
import * as GoogleMapsLoader from 'google-maps';
import './CustomerHome.css';
import axios from 'axios';
//=================== IMPORTED ICONS =========================
import User from 'material-ui-icons/Face';
import Shop from 'material-ui-icons/Store';
import Close from 'material-ui-icons/Close';
import Comment from 'material-ui-icons/Comment';
import Logout from 'material-ui-icons/ExitToApp';
import Cart from 'material-ui-icons/ShoppingCart';
import Details from 'material-ui-icons/LibraryBooks';
import CheckCircle from 'material-ui-icons/CheckCircle';
import RemoveCart from 'material-ui-icons/RemoveShoppingCart';
import AddShoppingCart from 'material-ui-icons/AddShoppingCart';
//=============================================================

export default class CustomerHome extends Component{
    constructor(props){
        super(props);
        this.state = {
            user: {
                displayName: null,
                profilePicture: null,
                uid: null
            },
            userData: {
                orderList: null,
                orders: null,
                ordersMesage: 'Getting your orders...'
            },
            showDetails: false,
            selectedIndex: null,
            processing: false,
            notify: false,
            notifyMessage: '',
            step1complete: false,
            selectedShop: null,
            selectedGMAPID: null,
            step2complete: false,
            confirm : {
                show: false,
                title: '',
                message: '',
                actions: {
                    accept: {
                        text: '',
                        callBack: ()=>{}
                    },
                    reject:{
                        text: '',
                        callBack: ()=>{}
                    }
                }
            },
            showCart: false
        }
        this.fireBaseListener = null;
        this.authListener = this.authListener.bind(this);
        this.showDetails = this.showDetails.bind(this);
        this.hideDetails = this.hideDetails.bind(this);
        this.updateDeliverer = this.updateDeliverer.bind(this);
        this.notify = this.notify.bind(this);
        this.loadMap = this.loadMap.bind(this);
        this.alert = this.alert.bind(this);
    }
    componentDidMount() {
        this.authListener();
    }
    alert(title, message, accept={text: '', callBack: ()=>{}}, reject={text: '', callBack: ()=>{}}){
        this.setState({
            confirm: {
                show: true,
                title: title,
                message: message,
                actions : {
                    accept: accept,
                    reject: reject
                }
            }
        })
    }
    notify(message){
        this.setState({
            notify: true,
            notifyMessage: message
        })
    }
    loadMap(location){
        this.setState({
            processing: true
        })
        GoogleMapsLoader.KEY = 'AIzaSyAyZVH3IJTKen6oYJ8WmUP_BazsTy_AgUg';
        GoogleMapsLoader.LIBRARIES = ['places'];
        GoogleMapsLoader.load((google)=>{
            var centerLocation = new google.maps.LatLng(location.x, location.y);
            var customerMap = new google.maps.Map(document.getElementById('map'),{
                center: centerLocation,
                zoom: 15,
                draggable: false,
                zoomControl: false,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                mapTypeId:'roadmap'
            });
            var positionMarker = new google.maps.Marker({
                position: centerLocation,
                map: customerMap
            });
            var searchReq = {
                location: centerLocation,
                radius: '250',
                query: 'pizza'
            };
            var restraunts = [];
            var placesService = new google.maps.places.PlacesService(customerMap);
            placesService.textSearch(searchReq, (results)=>{
                axios.post('https://us-central1-pos-tagmhaxt.cloudfunctions.net/getClosestShops',results)
                .then((closeShops)=>{
                    var shops = closeShops.data.shops;
                    shops = shops.slice(0,3);
                    if (shops.length === 0){
                        this.notify("Couldn't find any shops near you.")
                    }
                    var bounds = new google.maps.LatLngBounds();
                    bounds.extend(centerLocation);
                    shops.forEach((data, index)=>{
                        var tempMarker = new google.maps.Marker({
                            position: new google.maps.LatLng(data.location.x,data.location.y),
                            map: customerMap,
                            opacity: 0.5
                        });
                        bounds.extend(tempMarker.getPosition());
                        tempMarker.setLabel(data.name);
                        tempMarker.addListener('click', ()=>{
                            this.setState({processing: true})
                            var hasCart = this.state.userData.cart? true: false;
                            if (hasCart) {
                                if (this.state.userData.cart.gmap_id !== data.gmap_id){
                                    var found = false, foundName = '';
                                    shops.forEach((checkGmap)=>{
                                        if (checkGmap.gmap_id === this.state.userData.cart.gmap_id){
                                            found = true;
                                            foundName = checkGmap.name;
                                        }
                                    })
                                    if (found){
                                        this.alert(
                                            'Empty cart?',
                                            `Items from another shop are in your cart - do you want to empty your cart and continue? If not - cancel and select ${foundName} to continue.`,
                                            {
                                                text: 'Empty & Continue',
                                                callBack: ()=>{
                                                    firebase.database().ref(`Users/${this.state.user.uid}/cart`).set({}).then(()=>{
                                                        this.notify("Emptied your cart 🛒");
                                                        this.setState({
                                                            confirm : {
                                                                show: false,
                                                                title: '',
                                                                message: '',
                                                                actions: {
                                                                    accept: {
                                                                        text: '',
                                                                        callBack: ()=>{}
                                                                    },
                                                                    reject:{
                                                                        text: '',
                                                                        callBack: ()=>{}
                                                                    }
                                                                }
                                                            }
                                                        })
                                                        if (data.pizzas){
                                                            axios.post('https://us-central1-pos-tagmhaxt.cloudfunctions.net/getPizzas',{pizzas: data.pizzas})
                                                            .then((pizzaData)=>{
                                                                data.pizzas = pizzaData.data;                                    
                                                                tempMarker.setOpacity(1);
                                                                restraunts.forEach((r,i)=>{
                                                                    r.setMap(null);
                                                                })
                                                                restraunts = [];
                                                                tempMarker.setMap(customerMap);
                                                                tempMarker.setZIndex(100);
                                                                positionMarker.setMap(null);
                                                                customerMap.setCenter(new google.maps.LatLng(data.location.x, data.location.y));
                                                                document.getElementById('map').style.height = '100px';
                                                                this.setState({
                                                                    processing: false,
                                                                    step1complete: true,
                                                                    selectedShop: data,
                                                                    selectedGMAPID: data.gmap_id
                                                                });
                                                                this.notify(`Let's get your order from ${data.name} started! 😊`);
                                                            }).catch((error)=>{
                                                                this.setState({
                                                                    processing: false
                                                                })
                                                                this.notify("Couldn't get the shop's details. 😟");
                                                            })
                                                        } else {
                                                            this.setState({
                                                                processing:false
                                                            })
                                                            this.notify("This shop doesn't have any 🍕's yet.");
                                                        }
                                                    })
                                                }
                                            },
                                            {
                                                text: 'Keep Cart',
                                                callBack: ()=>{
                                                    this.setState({
                                                        processing: false,
                                                        confirm : {
                                                            show: false,
                                                            title: '',
                                                            message: '',
                                                            actions: {
                                                                accept: {
                                                                    text: '',
                                                                    callBack: ()=>{}
                                                                },
                                                                reject:{
                                                                    text: '',
                                                                    callBack: ()=>{}
                                                                }
                                                            }
                                                        }
                                                    })
                                                }
                                            }
                                        )
                                    } else {
                                        firebase.database().ref(`Users/${this.state.user.uid}/cart`).set({}).then(()=>{
                                            this.alert(
                                                'Emptied Cart',
                                                "Emptied your cart because you had items from a shop that isn't available from your current location.",
                                                {
                                                    text: 'Okay',
                                                    callBack: ()=>{
                                                        this.setState({
                                                            processing: false,
                                                            confirm : {
                                                                show: false,
                                                                title: '',
                                                                message: '',
                                                                actions: {
                                                                    accept: {
                                                                        text: '',
                                                                        callBack: ()=>{}
                                                                    },
                                                                    reject:{
                                                                        text: '',
                                                                        callBack: ()=>{}
                                                                    }
                                                                }
                                                            }
                                                        })
                                                    }
                                                }
                                            )
                                            if (data.pizzas){
                                                axios.post('https://us-central1-pos-tagmhaxt.cloudfunctions.net/getPizzas',{pizzas: data.pizzas})
                                                .then((pizzaData)=>{
                                                    data.pizzas = pizzaData.data;                                    
                                                    tempMarker.setOpacity(1);
                                                    restraunts.forEach((r,i)=>{
                                                        r.setMap(null);
                                                    })
                                                    restraunts = [];
                                                    tempMarker.setMap(customerMap);
                                                    tempMarker.setZIndex(100);
                                                    positionMarker.setMap(null);
                                                    customerMap.setCenter(new google.maps.LatLng(data.location.x, data.location.y));
                                                    document.getElementById('map').style.height = '100px';
                                                    this.setState({
                                                        processing: false,
                                                        step1complete: true,
                                                        selectedShop: data,
                                                        selectedGMAPID: data.gmap_id
                                                    });
                                                    this.notify(`Let's get your order from ${data.name} started! 😊`);
                                                }).catch((error)=>{
                                                    this.setState({
                                                        processing: false
                                                    })
                                                    this.notify("Couldn't get the shop's details. 😟");
                                                })
                                            } else {
                                                this.setState({
                                                    processing:false
                                                })
                                                this.notify("This shop doesn't have any 🍕's yet.");
                                            }
                                        })
                                    }
                                } else {
                                    if (data.pizzas){
                                        axios.post('https://us-central1-pos-tagmhaxt.cloudfunctions.net/getPizzas',{pizzas: data.pizzas})
                                        .then((pizzaData)=>{
                                            data.pizzas = pizzaData.data;                                    
                                            tempMarker.setOpacity(1);
                                            restraunts.forEach((r,i)=>{
                                                r.setMap(null);
                                            })
                                            restraunts = [];
                                            tempMarker.setMap(customerMap);
                                            tempMarker.setZIndex(100);
                                            positionMarker.setMap(null);
                                            customerMap.setCenter(new google.maps.LatLng(data.location.x, data.location.y));
                                            document.getElementById('map').style.height = '100px';
                                            this.setState({
                                                processing: false,
                                                step1complete: true,
                                                selectedShop: data,
                                                selectedGMAPID: data.gmap_id
                                            });
                                            this.notify(`Let's get your order from ${data.name} started! 😊`);
                                        }).catch((error)=>{
                                            this.setState({
                                                processing: false
                                            })
                                            this.notify("Couldn't get the shop's details. 😟");
                                        })
                                    } else {
                                        this.setState({
                                            processing:false
                                        })
                                        this.notify("This shop doesn't have any 🍕's yet.");
                                    }
                                }
                            } else {
                                if (data.pizzas){
                                    axios.post('https://us-central1-pos-tagmhaxt.cloudfunctions.net/getPizzas',{pizzas: data.pizzas})
                                    .then((pizzaData)=>{
                                        data.pizzas = pizzaData.data;                                    
                                        tempMarker.setOpacity(1);
                                        restraunts.forEach((r,i)=>{
                                            r.setMap(null);
                                        })
                                        restraunts = [];
                                        tempMarker.setMap(customerMap);
                                        tempMarker.setZIndex(100);
                                        positionMarker.setMap(null);
                                        customerMap.setCenter(new google.maps.LatLng(data.location.x, data.location.y));
                                        document.getElementById('map').style.height = '100px';
                                        this.setState({
                                            processing: false,
                                            step1complete: true,
                                            selectedShop: data,
                                            selectedGMAPID: data.gmap_id
                                        });
                                        this.notify(`Let's get your order from ${data.name} started! 😊`);
                                    }).catch((error)=>{
                                        this.setState({
                                            processing: false
                                        })
                                        this.notify("Couldn't get the shop's details. 😟");
                                    })
                                } else {
                                    this.setState({
                                        processing:false
                                    })
                                    this.notify("This shop doesn't have any 🍕's yet.");
                                }
                            }

                        })
                        restraunts.push(tempMarker);
                    })
                    customerMap.fitBounds(bounds);
                    this.setState({
                        processing: false
                    })
                }).catch((error)=>{
                    this.setState({
                        notify: true,
                        notifyMessage: "Couldn't get closest shops 😟."
                    })
                })
            })
        })
    }
    authListener() {
        this.fireBaseListener = firebase.auth().onAuthStateChanged((user)=>{
            if (user) {
               firebase.database().ref(`Users/${user.uid}/`).once('value', 
                    (snap)=>{
                        this.setState({
                            user: {
                                displayName: user.displayName,
                                profilePicture: user.photoURL,
                                uid: user.uid
                            },
                            userData : {
                                variant: snap.val().type,
                                orderList: snap.val().orders,
                                cart: snap.val().cart
                            }
                        })
                        if (snap.val().location){
                            var location = {x:snap.val().location.x,y: snap.val().location.y};
                            this.loadMap(location);
                        } else {
                            navigator.geolocation.getCurrentPosition((position)=>{
                                var location = {x:position.coords.latitude,y: position.coords.longitude};
                                firebase.database().ref(`Users/${firebase.auth().currentUser.uid}/location`).set({x:position.coords.latitude, y:position.coords.longitude}).then(()=>{
                                    this.notify("Updated your saved location for next time 😊");
                                    this.loadMap(location);
                                })
                            },(error)=>{
                                var location = {x:40.8188696,y: -73.9461309};
                                if (error.code === 1) {
                                    this.notify("🤚 Couldn't get your location - we need your location to deliver 🍕.");
                                    setTimeout(()=>{this.notify("Change your location permissions and reload.🔄")},2000);
                                }
                                this.loadMap(location);
                            })
                        }
                        if (snap.val()){
                            axios.post('https://us-central1-pos-tagmhaxt.cloudfunctions.net/getUserOrderData',{orders: snap.val().orders})
                            .then((result)=>{
                                if (result.data.orderData.length >= 1){
                                    const old = this.state.userData;
                                    old['orders'] = result.data.orderData;
                                    old['ordersMessage'] = '';
                                    old['ordersLoading'] = false;
                                    this.setState({
                                        userData : old
                                    });
                                } else {
                                    const old = this.state.userData;
                                    old['ordersLoading'] = false;
                                    old['ordersMessage'] = "You don't have any orders yet.";
                                    this.setState({
                                        userData: old
                                    })
                                }
                            }).catch((error)=>{
                                var old = this.state.userData;
                                old['ordersLoading'] = false;
                                old['ordersMesage'] = "Couldn't get your orders 😟";
                                this.setState({
                                    userData: old                               
                                })
                            })
                        }
                    }
                )
            }
        })
    }
    showDetails(index){
        this.setState({
            selectedIndex: index,
            showDetails: true
        });
    }
    hideDetails(){
        this.setState({
            selectedIndex: null,
            showDetails: false
        })
    }
    updateDeliverer(index){
        const duid = this.state.userData.orders[index].duid;
        firebase.database().ref(`Users/${duid}`).once('value').then((snap)=>{
            if (snap.val()){
                var delivererData = snap.val();
                var a = delivererData.averageRating * delivererData.ratingCount; // existing rating sum
                var b = a + this.state.userData.orders[index].delivererRating; // new rating sum
                var c = b / (delivererData.ratingCount + 1); // new average rating
                delivererData.averageRating = c;
                delivererData.ratingCount += 1;
                firebase.database().ref(`Users/${duid}`).set(delivererData).then(()=>{
                    firebase.database().ref(`Orders/${this.state.userData.orderList[index]}`).set(this.state.userData.orders[index]).then(()=>{
                        this.setState({
                            processing:false
                        })
                    })
                })
            }
        })
    }
    updatePizza(index, key){
        firebase.database().ref(`Orders/${this.state.userData.orderList[index]}`).set(this.state.userData.orders[index]).then(()=>{
            firebase.database().ref(`Pizzas/${key}`).once('value').then((snap)=>{
                if(snap.val()){
                    var pizzaData = snap.val();
                    var a = pizzaData.averageRating * pizzaData.totalOrders;
                    var b = a + this.state.userData.orders[index].pizzaRatings[key].rating;
                    var c = b / (pizzaData.totalOrders + 1);
                    pizzaData.averageRating = c;
                    pizzaData.totalOrders += 1;
                    if (pizzaData.lastThreeRatings){
                        if (pizzaData.lastThreeRatings.length >= 3){
                            var newRatings = [pizzaData.lastThreeRatings[1], pizzaData.lastThreeRatings[2], this.state.userData.orders[index].pizzaRatings[key].rating];
                            pizzaData.lastThreeRatings = newRatings;
                        } else {
                            pizzaData.lastThreeRatings.push(this.state.userData.orders[index].pizzaRatings[key].rating);
                        }
                    } else {
                        pizzaData.lastThreeRatings =[this.state.userData.orders[index].pizzaRatings[key].rating];
                    }
                    firebase.database().ref(`Pizzas/${key}`).set(pizzaData).then(()=>{
                        this.setState({
                            processing: false
                        })
                    })
                }
            })
        })
    }
    addToCart(index, quantity){
        var pizza = this.state.selectedShop.pizzas[index];
        if (quantity>=1){
            if(this.state.userData.cart){
                if(this.state.userData.cart.items[pizza.id]){
                    var old = this.state.userData;
                    old.cart.total += Number(quantity) * old.cart.items[pizza.id].unitPrice;
                    old.cart.items[pizza.id].quantity += Number(quantity);
                    this.setState({
                        userData: old
                    }) 
                } else {
                    var old = this.state.userData;
                    old.cart.items[pizza.id] = {
                        unitPrice: pizza.cost,
                        quantity: Number(quantity),
                        name: pizza.name
                    };
                    old.cart.total += Number(quantity) * old.cart.items[pizza.id].unitPrice;
                    this.setState({
                        userData: old
                    })
                }
            } else {
                var old = this.state.userData;
                old.cart = {
                    name: this.state.selectedShop.name,
                    gmap_id: this.state.selectedGMAPID,
                    items: {
                        [pizza.id]: {
                            unitPrice: pizza.cost,
                            quantity: Number(quantity),
                            name: pizza.name
                        }
                    },
                    total: Number(quantity) * pizza.cost
                };
                this.setState({
                    userData: old
                })
            }            
            firebase.database().ref(`Users/${this.state.user.uid}/cart`).set(this.state.userData.cart).then(()=>{
                this.notify(`Updated your 🛒 - added ${quantity} x ${pizza.name}`);
            })
        }
    }
    componentWillUnmount() {
        this.fireBaseListener && this.fireBaseListener();
        this.authListener = undefined;
    }
    render() {
        return(
            <div style={{padding:'50px 100px'}}>
                {/*=============CART POPOVER DIALOG=============*/}
                {
                    this.state.showCart?                    
                    <Popover
                        open={this.state.showCart}
                        onClose={()=>{this.setState({showCart:false})}}
                        anchorEl={document.getElementById('open-cart-btn')}
                        anchorOrigin={{
                            vertical:'center',
                            horizontal:'center'
                        }}
                        transformOrigin={{
                            vertical: 'bottom',
                            horizontal:'right'
                        }}
                    >
                        <div style={{padding:'15px 30px'}}>
                            <Typography variant="display1" style={{width:'30vw'}}>Your Cart</Typography>
                            <Typography variant="subheading">Ordering from {this.state.userData.cart.name}</Typography>
                            <Divider />
                            <MenuList role="menu">
                            {
                                this.state.userData.cart?
                                Object.keys(this.state.userData.cart.items).map((key, index)=>{
                                    return(
                                        <MenuItem key={`cart-item-${index}`}>
                                            {this.state.userData.cart.items[key].name}
                                        </MenuItem>
                                    );
                                }):null
                            }
                            </MenuList>
                        </div>
                    </Popover>:null
                }
                {/*=============CART FLOATING BUTTON=============*/}            
                {
                    this.state.userData.cart?
                    <Button 
                        variant="fab" 
                        color="primary" 
                        aria-label="Your Cart" 
                        className="cart-button"
                        id="open-cart-btn"
                        onClick={()=>{this.setState({showCart:true})}}
                    >
                        <Cart />
                    </Button>
                    :null
                }                
                {/*=============TOP PAGE LOADING BAR=============*/}
                <div className="top-loading">
                {
                    this.state.processing?
                    <LinearProgress /> : null
                }
                </div>
                {/*=============NOTIFCATION SNACKBAR=============*/}
                <Snackbar 
                    onClose={()=>{this.setState({notify:false, notifyMessage: ''})}}
                    open={this.state.notify}
                    message={this.state.notifyMessage}
                    autoHideDuration={2000}
                />
                {/*=============EMPTY CONFIRMATION DIALOG=============*/}
                <Dialog
                    onClose={()=>{
                        this.setState({
                            confirm : {
                                show: false,
                                title: '',
                                message: '',
                                actions: {
                                    accept: {
                                        text: '',
                                        callBack: ()=>{}
                                    },
                                    reject:{
                                        text: '',
                                        callBack: ()=>{}
                                    }
                                }
                            }
                        })
                    }} 
                    open={this.state.confirm.show} 
                    disableBackdropClick={true} 
                    disableEscapeKeyDown={true}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{this.state.confirm.title}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {this.state.confirm.message}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        {
                            this.state.confirm.actions.reject.text !== ''?
                            <Button color="secondary" onClick={()=>{this.state.confirm.actions.reject.callBack()}}>
                                {this.state.confirm.actions.reject.text}
                            </Button>:
                            null
                        }
                        {
                            this.state.confirm.actions.accept.text !== ''?
                            <Button color="primary" variant="raised" onClick={()=>{this.state.confirm.actions.accept.callBack()}}>
                                {this.state.confirm.actions.accept.text}
                            </Button>:
                            null
                        }
                    </DialogActions>
                </Dialog>
                {/*=============VIEW ORDER DETAILS=============*/}
                <Dialog 
                    onClose={()=>{this.hideDetails(false)}} 
                    open={this.state.showDetails} 
                    disableBackdropClick={true} 
                    disableEscapeKeyDown={true}
                >
                {
                    this.state.showDetails ?
                    <div>                        
                    {
                        this.state.processing?
                        <LinearProgress />:null
                    }
                        <DialogTitle
                            children={
                                <span>
                                    <span style={{paddingRight:'200px'}}>{`Order from ${this.state.userData.orders[this.state.selectedIndex].shopName}`}</span>
                                    {this.state.processing===false?<IconButton onClick={()=>{this.hideDetails()}}><Close /></IconButton>:null}
                                </span>
                            }
                        ></DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Order# {this.state.userData.orderList[this.state.selectedIndex]}
                                <br />
                                Total: ${this.state.userData.orders[this.state.selectedIndex].total}
                                <br />
                                Rate your order and deliverers below
                                <br />
                            </DialogContentText>
                            {
                                this.state.userData.orders[this.state.selectedIndex].delivererRating === 0?
                                <TextField
                                    disabled={this.state.processing}
                                    className="push-down"
                                    select
                                    label="Deliverer Rating"
                                    fullWidth
                                    value={this.state.userData.orders[this.state.selectedIndex].delivererRating}
                                    onChange={(e)=>{
                                        const old = this.state.userData;
                                        old.orders[this.state.selectedIndex].delivererRating = e.target.value;
                                        this.setState({
                                            userData: old,
                                            processing: true
                                        })
                                        if (e.target.value !== 0) this.updateDeliverer(this.state.selectedIndex);
                                        else this.setState({processing:false});
                                    }}
                                >   
                                    <MenuItem value={0}><i>Choose a rating</i></MenuItem>
                                    <MenuItem value={5}><span role="img" aria-label="star">⭐⭐⭐⭐⭐(5) </span></MenuItem>
                                    <MenuItem value={4}><span role="img" aria-label="star">⭐⭐⭐⭐(4) </span></MenuItem>
                                    <MenuItem value={3}><span role="img" aria-label="star">⭐⭐⭐(3) </span></MenuItem>
                                    <MenuItem value={2}><span role="img" aria-label="star">⭐⭐(2) </span></MenuItem>
                                    <MenuItem value={1}><span role="img" aria-label="star">⭐(1) </span></MenuItem>
                                </TextField>:
                                <Typography variant="subheading" className="push-down">
                                    Deliverer Rating:&nbsp; 
                                    <strong>
                                    {this.state.userData.orders[this.state.selectedIndex].delivererRating} <span role="img" aria-label="star">⭐</span>
                                    </strong>
                                </Typography>
                            }
                            {
                                Object.keys(this.state.userData.orders[this.state.selectedIndex].pizzaRatings).map((key, index)=>{
                                    var pizza = this.state.userData.orders[this.state.selectedIndex].pizzaRatings[key];
                                    if (pizza.rating === 0){
                                        return(
                                            <TextField 
                                                disabled={this.state.processing}
                                                className="push-down"
                                                key={`pizza${index}`}
                                                select
                                                fullWidth
                                                label={`Rate ${pizza.name}`}
                                                value={pizza.rating}
                                                onChange={(e)=>{
                                                    var old = this.state.userData;
                                                    old.orders[this.state.selectedIndex].pizzaRatings[key].rating = e.target.value;
                                                    this.setState({
                                                        userData: old,
                                                        processing: true
                                                    })
                                                    if (e.target.value !== 0) this.updatePizza(this.state.selectedIndex, key);
                                                    else this.setState({processing:false});
                                                }}
                                            >
                                                <MenuItem value={0}><i>Choose a rating</i></MenuItem>
                                                <MenuItem value={5}><span role="img" aria-label="star">⭐⭐⭐⭐⭐(5) </span></MenuItem>
                                                <MenuItem value={4}><span role="img" aria-label="star">⭐⭐⭐⭐(4) </span></MenuItem>
                                                <MenuItem value={3}><span role="img" aria-label="star">⭐⭐⭐(3) </span></MenuItem>
                                                <MenuItem value={2}><span role="img" aria-label="star">⭐⭐(2) </span></MenuItem>
                                                <MenuItem value={1}><span role="img" aria-label="star">⭐(1) </span></MenuItem>
                                            </TextField>
                                        );
                                    } else {
                                        return(
                                            <Typography variant="subheading" className="push-down" key={`pizza${index}`}>
                                                {pizza.name} Rating:&nbsp; 
                                                <strong>
                                                {pizza.rating} <span role="img" aria-label="star">⭐</span>
                                                </strong>
                                                {
                                                    pizza.rating <=3 ?                                                    
                                                        pizza.complaint?
                                                        <TextField 
                                                            fullWidth
                                                            multiline
                                                            label={`Comment for ${pizza.name}`}
                                                            disabled
                                                            rowsMax="2"
                                                            value={pizza.complaint}
                                                        />:
                                                        <div>
                                                            <TextField 
                                                                fullWidth
                                                                multiline
                                                                label={`Comment for ${pizza.name}`}
                                                                rowsMax="2"
                                                                id={`pizzaComplaint-${key}`}
                                                            />
                                                            <Button 
                                                                fullWidth 
                                                                color="secondary"
                                                                onClick={
                                                                    ()=>{
                                                                        var value = document.getElementById(`pizzaComplaint-${key}`).value;
                                                                        if(value && value !== ""){
                                                                            var old = this.state.userData;
                                                                            old.orders[this.state.selectedIndex].pizzaRatings[key].complaint = value;
                                                                            this.setState({
                                                                                userData: old
                                                                            });
                                                                            firebase.database().ref(`Orders/${this.state.userData.orderList[this.state.selectedIndex]}/`)
                                                                            .set(this.state.userData.orders[this.state.selectedIndex])
                                                                            .then(()=>{
                                                                                this.notify("We'll let the shop know what went wrong 👍");
                                                                            }).catch(()=>{
                                                                                this.notify("Couldn't save your comment, please try again in a bit.");
                                                                            })
                                                                        } else {
                                                                            this.notify("You can't save an empty comment.");
                                                                        }
                                                                    }
                                                                }
                                                            >
                                                                <Comment style={{marginRight:'10px'}}/>
                                                                Save Comment
                                                            </Button>
                                                        </div>
                                                    :null
                                                }
                                            </Typography>
                                        );
                                    }
                                })
                            }
                        </DialogContent>
                    </div>:
                    <div></div>
                }
                </Dialog>
                {/*=============WELCOME USER HEADER=============*/}                
                {
                    this.state.user.displayName && this.state.user.profilePicture ?
                    <div className="customer-header" data-aos="fade-up">
                        <Avatar 
                            alt={this.state.user.displayName}
                            src={this.state.user.profilePicture}
                            className="user-avatar"
                        />
                        <Typography variant="display2" style={{flex:1}}>
                            Welcome, {this.state.user.displayName}
                        </Typography>
                        <Button size="small"><User style={{marginRight:'5px'}} />Account</Button>
                        <Button onClick={()=>{firebase.auth().signOut();}} size="small"><Logout style={{marginRight:'5px'}}/>signout</Button>
                    </div>:
                    null
                }
                {
                    this.state.user.displayName ?
                    <Divider className="push-down" data-aos="fade-up" />:null
                }
                {/*=============MAIN CONTENT BELOW=============*/}
                {
                    this.state.userData && this.state.user.displayName?
                    <div data-aos="fade-up">
                        {/*=============PAST ORDERS SECTION=============*/}
                        <Typography variant="display1" className="push-down" data-aos="fade-up">
                            Your Past Orders
                        </Typography>
                        <Typography variant="subheading" className="push-down">
                            Check details, rate and leave comments for your past orders.
                        </Typography>
                        <div className="past-orders" data-aos="fade-up">
                            {
                                this.state.userData.orders?
                                    this.state.userData.orders.map((data, index)=>{
                                        return(
                                            <Card key={index} data-aos="fade-left" className="order-card">
                                                <CardHeader 
                                                    title={data.shopName}
                                                    subheader={`Order # ${this.state.userData.orderList[index]}`}
                                                    style={{paddingBottom: 0}}
                                                />
                                                <CardContent style={{paddingBottom:0, paddingTop: 0}}>
                                                    {
                                                        data.delivererRating === 0 ? 
                                                        <Typography variant="subheading" style={{color:'red'}}>
                                                            <i> Deliverer not rated yet</i>
                                                        </Typography>:
                                                        <Typography variant="subheading">
                                                            Deliverer Rating: <strong>{data.delivererRating} <span role="img" aria-label="star">⭐</span></strong>
                                                        </Typography>
                                                    }
                                                    <Typography variant="subheading" style={{fontSize:'10.5px'}}>
                                                        <i>See details to rate pizzas and deliverer.</i>
                                                    </Typography>
                                                    <Divider />
                                                </CardContent>
                                                <CardActions>
                                                    <Button 
                                                        fullWidth
                                                        onClick={()=>{this.showDetails(index)}} 
                                                        color="primary" 
                                                        size="small">
                                                        <Details style={{marginRight:'10px'}} />
                                                        See details
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        );
                                    })
                                :
                                <Typography variant="subheading" className="no-orders">
                                    {this.state.userData.ordersMesage}
                                </Typography>
                            }
                        </div>
                        <Divider className="push-down" data-aos="fade-up" />
                        {/*=============NEW ORDERS SECTION=============*/}
                        <Typography variant="display1" className="push-down" data-aos="fade-up">
                            Feeling Hungry?
                        </Typography>
                        <Typography variant="subheading" className="push-down">
                            Get started by choosing a shop.
                        </Typography>
                        <div id="map" className="push-down" data-aos="fade-up"></div>
                        {/*=============EMPTY & CHANGE=============*/}
                        {
                            this.state.step1complete === true?
                            <Button 
                                fullWidth
                                variant="raised" 
                                color="primary"
                                onClick={()=>{
                                    firebase.database().ref(`Users/${this.state.user.uid}/cart`).set({}).then(()=>{
                                        this.notify("Emptied your 🛒");
                                        window.location.reload();
                                    })
                                }}
                            >
                                <RemoveCart  style={{marginRight: '10px'}}/>
                                EMPTY CART  &
                                <Shop style={{marginLeft:'10px',marginRight:'10px'}} />
                                CHANGE SHOP
                            </Button>
                            :null
                        }
                        {/*=============MENU AND SHOP DETAILS=============*/}
                        {
                            this.state.step1complete === true?
                            <Card data-aos="fade-up">
                                <CardHeader 
                                    title={this.state.selectedShop.name}
                                    subheader={this.state.selectedShop.address}
                                    style={{paddingBottom:0}}
                                />
                                <CardContent style={{paddingTop:0}}>
                                    <Divider className="push-down"/>
                                    {
                                        this.state.selectedShop.pizzas?
                                        <div style={{display: 'flex', flexDirection: 'row', paddingTop: '20px'}}>
                                            {   
                                                this.state.selectedShop.pizzas?
                                                this.state.selectedShop.pizzas.map((data, index)=>{
                                                    return(
                                                        <Card key={`pizza${index}`} style={{minWidth:'200px',marginRight:'10px'}}>
                                                            <CardMedia
                                                                style={{height:'100px'}}
                                                                image={data.image}
                                                                title={data.name}
                                                            />
                                                            <CardHeader
                                                                title={data.name}
                                                                subheader={`${data.averageRating} ⭐ | $${data.cost}`}
                                                                style={{paddingBottom:0}}
                                                            />
                                                            <CardContent style={{paddingTop:0}}>
                                                                <FormControl>
                                                                    <InputLabel htmlFor={`pizzaItem-${index}`}>Quantity</InputLabel>
                                                                    <Input
                                                                        id={`pizzaItem-${index}`}
                                                                        type="number"
                                                                        endAdornment={
                                                                            <InputAdornment position="end">
                                                                                <IconButton onClick={()=>{this.addToCart(index, document.getElementById(`pizzaItem-${index}`).value);}}>
                                                                                    <AddShoppingCart />
                                                                                </IconButton>
                                                                            </InputAdornment >
                                                                        }
                                                                    />
                                                                </FormControl>
                                                            </CardContent>
                                                        </Card>
                                                    );
                                                })
                                                :null
                                            }
                                        </div>:null
                                    }
                                </CardContent>
                            </Card>:
                            null
                        }
                        {
                            this.state.userData.cart && this.state.step1complete?
                            <Button fullWidth variant="raised" color="secondary">
                                <CheckCircle style={{marginRight:'10px'}} /> Continue to next step
                            </Button>:
                            null
                        }
                    </div>:
                    null
                }
            </div>
        );
    }
};