import axios from 'axios';
import './GuestOrder.css';
import * as firebase from 'firebase';
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
        MenuList,
        MenuItem,
        Popover,
        Snackbar,
        Step,
        StepLabel,
        StepContent,
        Stepper,
        TextField,
        Tooltip,
        Toolbar,
        Typography} from 'material-ui';
import Pay from 'material-ui-icons/Payment';
import Delete from 'material-ui-icons/Delete';
import {SketchField, Tools} from 'react-sketch';
import Cart from 'material-ui-icons/ShoppingCart';
import AddShoppingCart from 'material-ui-icons/AddShoppingCart';
//=================== DRAWING TOOL ICONS =========================
import DrawTool from 'material-ui-icons/Create';
import SelectTool from 'material-ui-icons/OpenWith';
import LineTool from 'material-ui-icons/Remove';
import RectangleTool from 'material-ui-icons/CropDin';
import CircleTool from 'material-ui-icons/PanoramaFishEye';
import Undo from 'material-ui-icons/Replay';
import LoadImage from 'material-ui-icons/RestaurantMenu';
import Dollar from 'material-ui-icons/MonetizationOn';
//=============================================================

export default class GuestOrder extends Component {
    constructor(props){
        super(props);
        this.state = {
            oldOrderId: '',
            notify: false,
            notifyMessage: '',
            processing: true,
            selectedShop: null,
            cart: null,
            showCart: false,
            step1complete: false,
            customizeStep: 0,
            customizeCompleted: null,
            selectedTool: Tools.Select,
            customizedImages: null,
        }
        this.trackOrder = this.trackOrder.bind(this);
        this.notify = this.notify.bind(this);
        this.addToCart = this.addToCart.bind(this);
        this.getLocation = this.getLocation.bind(this);
        this.placeOrder = this.placeOrder.bind(this);
    }
    componentDidMount(){
        this.getLocation();
    }
    dataURItoBlob(dataURI) {
        var byteString = atob(dataURI.split(',')[1]);
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], {type: mimeString});
    }
    placeOrder(){
        this.setState({processing:true});
        const payment = {
            noc: document.getElementById('card-name').value,
            num: document.getElementById('card-number').value,
            cvc: document.getElementById('card-cvc').value,
            doe: document.getElementById('card-date').value,
            tip: document.getElementById('card-tip').value
        };
        if (payment.noc === '' || payment.num === '' || payment.cvc === '' || payment.doe === '' || payment.tip === ''){
            this.notify("Looks like you're missing something.")
            this.setState({
                processing:false
            })
        } else {
            firebase.database().ref('Orders/total').once('value').then((snap)=>{
                if(snap.val()) {
                    const TOTAL = snap.val();
                    firebase.database().ref('Orders/total').set(TOTAL + 1).then(()=>{
                        const imgDataUrls = this.state.customizedImages? this.state.customizedImages:{};
                        var imageBlobs = {};
                        var imageURLs = {};
                        Object.keys(imgDataUrls).forEach((key, index)=>{
                            imageBlobs[key] = this.dataURItoBlob(imgDataUrls[key]);
                        })
                        Object.keys(imageBlobs).forEach((key, index)=>{
                            const imgBlb = imageBlobs[key];
                            var metadata = {
                                contentType: 'image/jpeg',
                            };
                            firebase.storage().ref(`Guests/order${TOTAL}/${key}.png`).put(imgBlb, metadata)
                            .then(()=>{
                                firebase.storage().ref(`Guests/order${TOTAL}/${key}.png`)
                                .getDownloadURL()
                                .then((imgUrl)=>{
                                    imageURLs[key] = imgUrl;
                                    if(Object.keys(imageURLs).length === Object.keys(imageBlobs).length){
                                        const oData = {
                                            cuid: 'guest',
                                            images: imageURLs,
                                            cart: this.state.cart,
                                            payment: payment,
                                            orderNumber: TOTAL
                                        };
                                        axios.post('https://us-central1-pos-tagmhaxt.cloudfunctions.net/placeOrder',oData)
                                        .then((result)=>{
                                            this.notify(result.data.message);
                                            this.setState({processing:false});
                                            this.props.history.push(`/guest/view/orderID${TOTAL}`);
                                        })
                                        .catch((err)=>{
                                            this.notify(err.message);
                                            this.setState({processing:false})
                                        })                                        
                                    }
                                })
                            })
                        })
                    })
                }
            })
        }
    }
    getLocation(){
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
                                        processing: false,
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
                    if(shops.length >= 1) guestMap.fitBounds(bounds);
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
        if(Number(quantity)>0){
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
            console.log(old);
        }
    }
    render() {
        return (
            <div className="guest-order-page">
                {/*=============CART POPOVER DIALOG=============*/}
                {
                    this.state.cart?
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
                        <div style={{padding:'15px 30px 30px 30px', maxHeight: '500px'}}>
                            <Typography variant="display1" style={{width:'30vw'}}>Your Cart</Typography>
                            <Typography variant="subheading">Ordering from {this.state.cart.name}</Typography>                            <Divider />
                            <MenuList role="menu">
                            {
                                this.state.cart?
                                Object.keys(this.state.cart.items).map((key, index)=>{
                                    var cartItem = this.state.cart.items[key];
                                    return(
                                        <MenuItem key={`cart-item-${index}`} >
                                            <div style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'flex-start', flex: 1}}>
                                                <Typography variant="subheading">{cartItem.name}</Typography>
                                                <Typography style={{fontSize:'11px', color:'lightgray'}}>{cartItem.quantity} x ${cartItem.unitPrice} = ${cartItem.quantity*cartItem.unitPrice}</Typography>
                                            </div>
                                            <IconButton
                                                disabled={this.state.step1complete}
                                                onClick={()=>{
                                                    var old = this.state.cart;
                                                    delete old.items[key];
                                                    if (Object.keys(this.state.cart.items).length <= 0) {
                                                        this.setState({showCart:false, cart: null})
                                                    } else {
                                                        this.setState({
                                                            cart: old
                                                        })
                                                    }
                                                }}> 
                                                <Delete /> 
                                            </IconButton>
                                        </MenuItem>
                                    );
                                }):null
                            }
                            </MenuList>
                            <Divider />
                            <Typography variant="subheading" style={{marginTop:10, marginBottom:10}}>
                                <strong>Total</strong> : ${this.state.cart.total.toFixed(2)}
                            </Typography>
                            <Button variant="raised" color="secondary" size="small" fullWidth
                                disabled={this.state.step1complete}
                                style={{marginBottom:20}}
                                onClick={()=>{
                                    this.setState({showCart:false,cart:null})
                                }}>
                                Empty 🛒
                            </Button>
                        </div>
                    </Popover>:
                    null
                }
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
                    <Button data-aos-once={true}
                        disabled={this.state.processing}
                        data-aos="fade-up"
                        fullWidth
                        variant="raised"
                        color="secondary"
                        onClick={()=>{window.location.reload();}}
                    >
                        Empty Cart & Change Shop
                    </Button>:null
                }
                {
                    this.state.selectedShop?
                    <div data-aos="fade-up"   data-aos-once={true}>
                        <Card data-aos="fade-up"   data-aos-once={true}>
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
                                                                disabled={this.state.step1complete}
                                                                id={`pizzaItem-${index}`}
                                                                type="number"
                                                                endAdornment={
                                                                    <InputAdornment position="end">
                                                                        <IconButton disabled={this.state.step1complete} onClick={()=>{this.addToCart(index, document.getElementById(`pizzaItem-${index}`).value);}}>
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
                {
                    this.state.cart?
                    <Button data-aos-once={true}
                        data-aos-offset={10} 
                        data-aos="fade-up"
                        fullWidth
                        variant="raised"
                        color="primary"
                        onClick={()=>{
                            var toSet = new Array(Object.keys(this.state.cart.items).length);
                            toSet.fill(false);
                            this.setState({
                                customizeCompleted:toSet,
                                step1complete:true
                            })
                        }}
                    >
                        Customize Your Pizzas
                    </Button>:null
                }
                {
                    this.state.step1complete?
                    <Card data-aos="fade-up" data-aos-once={true}>
                        <CardHeader 
                            title="Customize Your Pizzas"
                            subheader="Draw on your pizzas 🎨🖌"
                            style={{paddingBottom:0}}
                        />
                        <CardContent style={{paddingTop:0}}>
                            <Divider className="push-down"/>
                            <Typography variant="caption" className="push-down"> 
                                <strong>Skip:</strong> Won't save customize progress. You can still come back and edit it. |
                                <strong> Save & Continue:</strong> Will save your customization. You won't be able to edit it. |
                                <i> Leaving this page will also lose all customization - even saved ones. Continuing to payment will lock-in all customization.</i>
                            </Typography>
                            <Stepper orientation="vertical" activeStep={this.state.customizeStep}>
                            {
                                this.state.cart?
                                Object.keys(this.state.cart.items).map((key,index)=>{
                                    var custPizza = this.state.cart.items[key];
                                    return(
                                        <Step key={index} active={this.state.customizeStep === index} completed={this.state.customizeCompleted[index]}>
                                            <StepLabel>{custPizza.name}</StepLabel>
                                            <StepContent>
                                            {this.state.customizeCompleted[index] === false?
                                                <div>
                                                    <Toolbar className="tools">
                                                        <Typography variant="subheading">
                                                            Drawing Tools
                                                        </Typography>
                                                        <Typography variant="caption" style={{flex:1, paddingLeft: 10}} className="hint"> 
                                                            Use this toolbar to switch tools for drawing.
                                                        </Typography>
                                                        <Tooltip title="Load Pizza Image">
                                                            <IconButton onClick={()=>{
                                                                firebase.database().ref(`Pizzas/${key}/image`).once('value').then((snap)=>{
                                                                    if (snap.val() && this[`sketch${index}`]) {
                                                                        document.getElementById('pizza-bckg').src=snap.val();
                                                                    }
                                                                })
                                                            }}> <LoadImage /> </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Undo">
                                                            <IconButton onClick={()=>{this[`sketch${index}`].undo();}}> 
                                                                <Undo /> 
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Select">
                                                            <IconButton onClick={()=>{this.setState({selectedTool:Tools.Select})}} color={this.state.selectedTool===Tools.Select?"secondary":"default"}> 
                                                                <SelectTool /> 
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Pencil">
                                                            <IconButton onClick={()=>{this.setState({selectedTool:Tools.Pencil})}} color={this.state.selectedTool===Tools.Pencil?"secondary":"default"}> 
                                                                <DrawTool /> 
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Line">
                                                            <IconButton onClick={()=>{this.setState({selectedTool:Tools.Line})}} color={this.state.selectedTool===Tools.Line?"secondary":"default"}> 
                                                                <LineTool /> 
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Rectangle">
                                                            <IconButton onClick={()=>{this.setState({selectedTool:Tools.Rectangle})}} color={this.state.selectedTool===Tools.Rectangle?"secondary":"default"}> 
                                                                <RectangleTool /> 
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Circle">                                        
                                                            <IconButton onClick={()=>{this.setState({selectedTool:Tools.Circle})}} color={this.state.selectedTool===Tools.Circle?"secondary":"default"}> 
                                                                <CircleTool /> 
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Clear">
                                                            <IconButton onClick={()=>{this[`sketch${index}`].clear();}}> 
                                                                <Delete /> 
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Toolbar>
                                                    <SketchField 
                                                        style={{border: '1px solid black', margin:'0 auto'}}
                                                        name={`sketch${index}`}
                                                        ref={(c)=> {
                                                            this[`sketch${index}`] = c;
                                                        }}
                                                        width='300px' 
                                                        height='300px' 
                                                        tool={this.state.selectedTool} 
                                                        lineColor='black'
                                                        backgroundColor='#f0d0f0'
                                                        lineWidth={3}
                                                        crossOrigin
                                                    />
                                                    <div id="pizza-bckg-cont"><img id="pizza-bckg" /></div>
                                                    <Button 
                                                        fullWidth 
                                                        color="secondary" 
                                                        onClick={()=>{
                                                            this.setState({
                                                                customizeStep: this.state.customizeStep + 1
                                                            })
                                                        }}>
                                                        Skip
                                                    </Button>
                                                    <Button 
                                                        disabled={this.state.customizeCompleted[index]}
                                                        variant="raised"
                                                        fullWidth 
                                                        color="primary" 
                                                        onClick={()=>{
                                                            var old = this.state.customizeCompleted;
                                                            old[index] = true;
                                                            this[`sketch${index}`].crossOrigin = "Anonymous";
                                                            var customImages = this.state.customizedImages;
                                                            var imgurl = this[`sketch${index}`].toDataURL('image/jpeg');
                                                            if(customImages) customImages[key] = imgurl;
                                                            else customImages = {[key]:imgurl};
                                                            this.setState({
                                                                customizeCompleted: old,
                                                                customizeStep: this.state.customizeStep + 1,
                                                                customizedImages:customImages
                                                            })
                                                        }}>
                                                        Save & Continue
                                                    </Button>
                                                </div>:
                                                <div>
                                                    <img src={this.state.customizedImages ? this.state.customizedImages[key] : null} style={{width:300,height:300,border:'1px solid black',margin:'0 auto'}}/>
                                                    <Typography variant="caption">Saved</Typography>
                                                    <Button 
                                                        fullWidth 
                                                        color="secondary" 
                                                        onClick={()=>{
                                                            this.setState({
                                                                customizeStep: this.state.customizeStep + 1
                                                            })
                                                        }}>
                                                        Next
                                                    </Button>
                                                </div>
                                            }
                                            </StepContent>
                                        </Step>
                                    );
                                }):null
                            }
                            </Stepper>
                            {
                                this.state.customizeStep > 0 ?
                                    <div>
                                        <Button
                                            disabled={this.state.step2complete}
                                            fullWidth 
                                            color="primary" 
                                            size="small"
                                            onClick={()=>{
                                                this.setState({
                                                    customizeStep: this.state.customizeStep -1
                                                })
                                            }}>
                                            Back
                                        </Button>
                                    </div>
                                :null
                            }
                        </CardContent>
                    </Card>
                    :null
                }
                {
                    this.state.customizeCompleted && this.state.customizeStep >= Object.keys(this.state.cart.items).length?
                    <Button 
                        disabled={this.state.step2complete}
                        variant="raised"
                        fullWidth 
                        color="secondary" 
                        size="small"
                        onClick={()=>{
                            this.setState({
                                step2complete: true
                            })
                        }}
                    > 
                        Continue to Payment
                    </Button>:
                    null
                }
                {/*=============PAYMENT AND PLACE ORDER=============*/}
                {
                    this.state.step2complete?
                    <Card data-aos="slide-up" data-aos-offset="10" data-aos-once={true}>
                        <CardHeader 
                            title="Payment & Complete"
                            subheader="💳 Pay and place your order..."
                            style={{paddingBottom:0}}
                        />
                        <CardContent style={{paddingTop:0}}>
                            <TextField 
                                style={{marginTop:10}}
                                disabled={this.state.processing}
                                label="Name on Card"
                                id="card-name"
                                required
                                fullWidth
                            />
                            <div style={{display:'flex', flexDirection:'row', width:'100%'}}>
                                <TextField 
                                    style={{marginTop:10, flex: 1}}
                                    disabled={this.state.processing}
                                    label="Card Number"
                                    type="number"
                                    id="card-number"
                                    maxLength={12}
                                    required
                                />
                                <TextField 
                                    style={{marginTop:10}}
                                    disabled={this.state.processing}
                                    label="CVC"
                                    id="card-cvc"
                                    type="number"
                                    maxLength={3}
                                    required
                                />
                            </div>
                            <TextField
                                style={{marginTop:10}}
                                disabled={this.state.processing}
                                id="card-date"
                                label="Expiry Date"
                                type="date"
                                fullWidth
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />                                    
                            <div style={{display:'flex', flexDirection:'row', width:'100%'}}>
                                <TextField 
                                    style={{marginTop:10, flex:1}}
                                    disabled={this.state.processing}
                                    label="Total"
                                    id="card-total"
                                    type="number"
                                    maxLength={3}
                                    required
                                    value={this.state.cart.total.toFixed(2)}
                                    InputProps={{
                                        startAdornment: (
                                        <InputAdornment position="start">
                                            <Dollar />
                                        </InputAdornment>
                                        )
                                    }}
                                />
                                <TextField 
                                    style={{marginTop:10, flex:1}}
                                    disabled={this.state.processing}
                                    label="Tip"
                                    id="card-tip"
                                    type="number"
                                    maxLength={3}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                        <InputAdornment position="start">
                                            <Dollar />
                                        </InputAdornment>
                                        )
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>:null
                }
                {
                    this.state.step2complete?
                    <Button 
                        disabled={this.state.processing}
                        fullWidth 
                        variant="raised" 
                        color="primary" 
                        onClick={()=>{this.placeOrder()}} 
                        data-aos="slide-up" 
                        data-aos-offset="10" 
                        data-aos-once={true}> 
                        <Pay style={{marginRight:10}}/>Place Order
                    </Button>
                    :null
                }
            </div>
        );
    }
}