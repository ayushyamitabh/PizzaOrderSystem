import axios from 'axios';
import './GuestOrder.css';
import {Link} from 'react-router-dom';
import React, {Component} from 'react';
import * as GoogleMapsLoader from 'google-maps';
import {Button,
        Card,
        CardActions,
        CardContent,
        CardHeader,
        CardMedia,
        Divider,
        FormControl,
        IconButton,
        Input,
        InputLabel,
        InputAdornment,
        LinearProgress,
        Snackbar,
        TextField,
        Typography} from 'material-ui';
import Cart from 'material-ui-icons/ShoppingCart';
import AddShoppingCart from 'material-ui-icons/AddShoppingCart';

export default class GuestOrder extends Component {
    constructor(props){
        super(props);
        this.state = {
            oldOrderId: '',
            notify: false,
            notifyMessage: '',
            processing: true,
            selectedShop: null,
            cart: null
        }
        this.trackOrder = this.trackOrder.bind(this);
        this.notify = this.notify.bind(this);
        this.addToCart = this.addToCart.bind(this);
    }
    componentDidMount(){
        navigator.geolocation.getCurrentPosition((position)=>{
            this.loadMap(position.coords.latitude, position.coords.longitude);
        },(error)=>{
            var location = {x:40.8188696,y: -73.9461309};
            if (error.code === 1) {
                this.notify("🤚 Couldn't get your location - using default location.");
                this.loadMap(40.8188696,-73.9461309);
            }
        })
    }
    loadMap(x, y){
        GoogleMapsLoader.KEY = 'AIzaSyAyZVH3IJTKen6oYJ8WmUP_BazsTy_AgUg';
        GoogleMapsLoader.LIBRARIES = ['places'];
        GoogleMapsLoader.load((google)=>{
            const centerLocation = new google.maps.LatLng(x, y);
            var guestMap = new google.maps.Map(document.getElementById('map'),{
                center: centerLocation,
                zoom: 15,
                draggable: false,
                zoomControl: false,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                mapTypeId:'roadmap'
            })
            var myLocation = new google.maps.Marker({
                position: centerLocation,
                map: guestMap
            });
            var placesService = new google.maps.places.PlacesService(guestMap);
            var searchReq = {
                location: centerLocation,
                radius: '50',
                query: 'pizza'
            }            
            placesService.textSearch(searchReq,(results,status)=>{
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
                            map: guestMap,
                            opacity: 0.5
                        });
                        bounds.extend(tempMarker.getPosition());
                        tempMarker.setLabel(data.name);
                        tempMarker.addListener('click',()=>{
                            this.setState({
                                processing: true
                            })
                            if (data.pizzas) {
                                axios.post('https://us-central1-pos-tagmhaxt.cloudfunctions.net/getPizzas',{pizzas: data.pizzas})
                                .then((pizzaData)=>{
                                    tempMarker.set('opacity', 1);
                                    data.pizzas = pizzaData.data;
                                    guestMap.setCenter(new google.maps.LatLng(data.location.x, data.location.y));
                                    this.notify(`Let's get your order from ${data.name} started! 😊`);
                                    this.setState({
                                        processing: true,
                                        selectedShop: data
                                    })
                                }).catch((error)=>{
                                    this.setState({
                                        processing: false
                                    })
                                    this.notify("Couldn't get the shop's details. 😟");
                                })
                            } else {
                                this.notify("This shop doesn't have any 🍕 yet");
                                this.setState({processing:false})
                            }
                        })
                    })

                    guestMap.fitBounds(bounds);
                    this.notify("Change permision and reload if you want to use live location.");
                    this.setState({
                        processing: false
                    })
                })
                .catch((err)=>{
                    this.notify(err.message);
                })
            })
        })
    }
    notify(message){
        this.setState({
            notify: true,
            notifyMessage: message
        })
    }
    trackOrder() {
        if (this.state.oldOrderId !== '') this.props.history.push(`/guest/view/${this.state.oldOrderId}`);
    }
    addToCart(index, quantity){
        var pizza = this.state.selectedShop.pizzas[index];
        var old = this.state.cart;
        if(old !== null) {
            if (old.items[pizza.id]) {
                old.items[pizza.id].quantity += Number(quantity);
                old.total += Number(quantity) * old.items[pizza.id].unitPrice;
                this.setState({cart:old});
            } else {
                old.items[pizza.id] = {
                    unitPrice: pizza.cost,
                    quantity: Number(quantity),
                    name: pizza.name
                };
                this.setState({cart:old});
            }
        } else {
            old = {
                gmap_id: this.state.selectedShop.gmap_id,
                name: this.state.selectedShop.name,
                items: {
                    [pizza.id]: {
                        unitPrice: pizza.cost,
                        quantity: Number(quantity),
                        name: pizza.name
                    }
                },
                total: pizza.cost * Number(quantity)
            };
            this.setState({cart:old})
        }
    }
    render() {
        return (
            <div className="guest-order-page">
                {/*=============CART FLOATING BUTTON=============*/}            
                {
                    this.state.cart?
                    <Button 
                        disabled={this.state.processing}
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
                {/*=============TRACK ORDER BY ID=============*/}
                <Typography variant="display1" className="user-name" data-aos="fade-up">
                    Already ordered? Track your order 🚴‍
                </Typography>
                <TextField 
                    label="Order ID"
                    required
                    id="view-order-id"
                    fullWidth
                    data-aos="fade-up"
                    value={this.state.oldOrderId}
                    onChange={(e)=>{this.setState({oldOrderId:e.target.value})}}
                />
                <Button 
                    style={{marginTop:5, marginBottom: 5}}
                    data-aos="fade-up"
                    color="secondary" 
                    fullWidth 
                    className="login"
                    onClick={()=>{this.trackOrder()}}
                >
                    Track Order
                </Button>
                <Divider style={{marginTop:5, marginBottom: 5}}/>
                <Typography variant="display1" className="user-name" data-aos="fade-up" style={{marginTop:15, marginBottom: 20}}>
                    Feeling Hungry? Get some 🍕
                </Typography>
                <div id="map" style={{height: this.state.selectedShop?'100px':'500px'}}> </div>
                {
                    this.state.selectedShop?
                    <div>
                        <Card data-aos="fade-up" data-aos-once={true}>
                            <CardHeader 
                                title={this.state.selectedShop.name}
                                subheader={this.state.selectedShop.address}
                                style={{paddingBottom:0}}
                            />
                            <CardContent style={{paddingTop:0}}>
                                <Divider className="push-down"/>
                                {
                                    this.state.selectedShop.pizzas?
                                    <div className="past-orders" >
                                    {
                                        this.state.selectedShop.pizzas.map((data, index)=>{
                                            return(
                                                <Card key={`pizza${index}`} style={{minWidth:'200px',marginRight:'10px', maxWidth:'300px', width: '300px'}}>
                                                    <CardMedia
                                                        style={{height:'100px'}}
                                                        image={data.image}
                                                        title={data.name}
                                                    />
                                                    <CardHeader
                                                        title={data.name}
                                                        subheader={`${data.averageRating} ⭐ | $${data.cost}`}
                                                        style={{paddingBottom:0, height: 100, maxHeight: 100}}
                                                    />
                                                    <CardContent style={{paddingTop:0, display: 'flex', flexDirection: 'column'}}>
                                                        <FormControl style={{flex:1}}>
                                                            <InputLabel htmlFor={`pizzaItem-${index}`}>Quantity</InputLabel>
                                                            <Input
                                                                disabled={this.state.step3complete}
                                                                id={`pizzaItem-${index}`}
                                                                type="number"
                                                                endAdornment={
                                                                    <InputAdornment position="end">
                                                                        <IconButton disabled={this.state.step3complete} onClick={()=>{this.addToCart(index, document.getElementById(`pizzaItem-${index}`).value);}}>
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
                                    }
                                    </div>:
                                    null
                                }
                            </CardContent>
                        </Card>
                    </div>
                    :null
                }
            </div>
        );
    }
}