import React, {Component} from 'react';
import {Avatar,
        Button,
        Card,
        CardActions,
        CardContent,
        CardHeader,
        Dialog,
        DialogTitle,
        DialogContent,
        DialogContentText,
        Divider,
        IconButton,
        LinearProgress,
        MenuItem,
        Snackbar,
        TextField,
        Typography} from 'material-ui';
import * as firebase from 'firebase';
import * as GoogleMapsLoader from 'google-maps';
import Close from 'material-ui-icons/Close';
import Logout from 'material-ui-icons/ExitToApp';
import './CustomerHome.css';
import axios from 'axios';

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
                ordersLoading: true,
                ordersMesage: 'Getting your orders...'
            },
            showDetails: false,
            selectedIndex: null,
            processing: false,
            notify: false,
            notifyMessage: '',
            step1complete: false,
            selectedShop: null,
            step2complete: false
        }
        this.fireBaseListener = null;
        this.authListener = this.authListener.bind(this);
        this.showDetails = this.showDetails.bind(this);
        this.hideDetails = this.hideDetails.bind(this);
        this.updateDeliverer = this.updateDeliverer.bind(this);
        this.notify = this.notify.bind(this);
        this.loadMap = this.loadMap.bind(this);
    }
    componentDidMount() {
        this.authListener();
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
                    shops.forEach((data, index)=>{
                        var tempMarker = new google.maps.Marker({
                            position: new google.maps.LatLng(data.location.x,data.location.y),
                            map: customerMap,
                            opacity: 0.5
                        });
                        tempMarker.setLabel(data.name);
                        tempMarker.addListener('click', ()=>{
                            tempMarker.setOpacity(1);
                            restraunts.forEach((r,i)=>{
                                r.setMap(null);
                            })
                            restraunts = [];
                            tempMarker.setMap(customerMap);
                            this.setState({
                                notify: true,
                                notifyMessage: `Let's get your order from ${data.name} started! 😊`,
                                step1complete: true,
                                selectedShop: data
                            });
                            document.getElementById('map').style.height = '100px';
                            customerMap.setCenter(new google.maps.LatLng(data.location.x, data.location.y));
                        })
                        restraunts.push(tempMarker);
                    })
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
            var positionMarker = new google.maps.Marker({
                position: centerLocation,
                map: customerMap
            });
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
                                orderList: snap.val().orders
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
    componentWillUnmount() {
        this.fireBaseListener && this.fireBaseListener();
        this.authListener = undefined;
    }
    render() {
        return(
            <div style={{padding:'50px 100px'}}>
                {
                    this.state.processing?
                    <LinearProgress style={{marginBottom: '10px'}}/> : null
                }
                <Snackbar 
                    onClose={()=>{this.setState({notify:false, notifyMessage: ''})}}
                    open={this.state.notify}
                    message={this.state.notifyMessage}
                    autoHideDuration={2000}
                />
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
                        <Button onClick={()=>{firebase.auth().signOut();}} size="small"><Logout />signout</Button>
                    </div>:
                    null
                }
                {
                    this.state.user.displayName ?
                    <Divider className="push-down" data-aos="fade-up" />:null
                }
                {
                    this.state.userData && this.state.user.displayName?
                    <div data-aos="fade-up">
                        {
                            this.state.userData.ordersLoading === true?
                            <LinearProgress />:null
                        }
                        <Typography variant="display1" className="push-down" data-aos="fade-up">
                            Your Past Orders
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
                                                />
                                                <CardContent>
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
                                                </CardContent>
                                                <CardActions>
                                                    <Button onClick={()=>{this.showDetails(index)}}>See details & Rate</Button>
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
                        <Typography variant="display1" className="push-down" data-aos="fade-up">
                            Feeling Hungry?
                        </Typography>
                        <Typography variant="subheading" className="push-down">
                            Get started by choosing a shop.
                        </Typography>
                        <div id="map" className="push-down" data-aos="fade-up"></div>
                        {
                            this.state.step1complete === true?
                            <Card data-aos="fade-up">
                                <CardHeader 
                                    title={this.state.selectedShop.name}
                                />
                                <CardContent>
                                    <Typography variant="title">
                                        Menu
                                    </Typography>
                                    <Divider className="push-down"/>
                                    {
                                        this.state.selectedShop.pizzas?
                                        <div>
                                            Pizzas appear here
                                        </div>:
                                        <Typography variant="subheading" style={{textAlign:'center'}} className="push-down">
                                            <i>This shop doesn't have any available pizzas right now.</i>
                                        </Typography>
                                    }
                                </CardContent>
                            </Card>:
                            null
                        }
                    </div>:
                    null
                }
            </div>
        );
    }
};