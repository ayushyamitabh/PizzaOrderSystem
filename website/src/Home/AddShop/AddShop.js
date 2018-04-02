import React, {Component} from 'react';
import './AddShop.css';
import {Button,
        Card,
        CardContent,
        CardHeader,
        Divider, 
        LinearProgress,
        Snackbar,
        TextField,
        Typography} from 'material-ui';
import * as firebase from 'firebase';
import * as GoogleMapsLoader from 'google-maps';
import Done from 'material-ui-icons/CheckCircle';
import Next from 'material-ui-icons/PlayCircleFilled';
import {Link} from 'react-router-dom';

export default class AddShop extends Component{
    constructor(props){
        super(props);
        this.state = {
            processing: true,
            shopList: null,
            notify: false,
            notifyMsg: '',
            step1complete: false,
            step2complete: false,
            shop: {
                shopUID: '',
                name: '',
                location: {
                    x: '',
                    y: ''
                },
                gmap_id: ''
            }
        };
        this.checkShop = this.checkShop.bind(this);
        this.prepareShopData = this.prepareShopData.bind(this);
        this.uuid = this.uuid.bind(this);
    }
    componentDidMount(){
        firebase.database().ref('Shops/').once('value', (snap)=>{
            if (snap.val()) {
                this.setState({
                    shopList: snap.val()
                })
            }
        })
        GoogleMapsLoader.KEY = 'AIzaSyAyZVH3IJTKen6oYJ8WmUP_BazsTy_AgUg';
        GoogleMapsLoader.LIBRARIES = ['places'];
        GoogleMapsLoader.load((google)=>{
            var centerLocation = new google.maps.LatLng(40.8188696,-73.9461309);
            var placesMarkers = [];
            var myMap = new google.maps.Map(document.getElementById('map-container'),{
                center: {lat: 40.8188696, lng: -73.9461309},
                zoom: 15,
                draggable: false,
                zoomControl: false,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                mapTypeId:'roadmap'
            })
            var placesService = new google.maps.places.PlacesService(myMap);
            var searchReq = {
                location: centerLocation,
                radius: '50',
                query: 'pizza'
            }
            placesService.textSearch(searchReq,(result,status)=>{
                this.setState({
                    processing: true
                })
                myMap.setOptions({draggable:false});
                result.forEach((shop)=>{
                    var tempMarker = new google.maps.Marker({
                        position: shop.geometry.location,
                        map: myMap,
                        opacity: 0.5
                    });
                    placesMarkers.push(tempMarker);
                    tempMarker.setLabel(String(placesMarkers.length));
                    tempMarker.addListener('click', ()=>{
                        placesMarkers.forEach((markshop)=>{
                            markshop.setOpacity(0.5);
                            markshop.setZIndex(10);
                        })
                        tempMarker.setOpacity(1);
                        tempMarker.setZIndex(100);
                        myMap.setOptions({draggable: false});
                        if (this.checkShop(shop) === false) {
                            document.getElementById('map-container').style.height = '100px';
                            placesMarkers.forEach((markHere)=>{
                                markHere.setMap(null);
                            })
                            placesMarkers = [];
                            new google.maps.Marker({
                                position: shop.geometry.location,
                                map: myMap
                            });
                            myMap.setZoom(17);
                            myMap.setCenter(shop.geometry.location);
                            this.setState({step1complete:true});
                            this.prepareShopData(shop);
                        }
                    })
                })
                this.setState({
                    processing: false
                })
                myMap.setOptions({draggable:true});
            })
            myMap.addListener('dragend', ()=>{
                this.setState({
                    processing: true
                })
                myMap.setOptions({draggable:false});
                var draggedSearchReq = {
                    location: myMap.getCenter(),
                    radius: '250',
                    query: 'pizza'
                }
                placesService.textSearch(draggedSearchReq,(result,status)=>{
                    placesMarkers.forEach((existingshop)=>{
                        existingshop.setMap(null);
                    })
                    placesMarkers= [];
                    result.forEach((shop)=>{
                        var tempMarker = new google.maps.Marker({
                            position: shop.geometry.location,
                            map: myMap,
                            opacity: 0.5
                        });
                        placesMarkers.push(tempMarker);
                        tempMarker.setLabel(String(placesMarkers.length));
                        tempMarker.addListener('click', ()=>{
                            placesMarkers.forEach((markshop)=>{
                                markshop.setOpacity(0.5);
                                markshop.setZIndex(10);
                            })
                            tempMarker.setOpacity(1); 
                            tempMarker.setZIndex(100);
                            myMap.setOptions({draggable: false});
                            if (this.checkShop(shop) === false) {
                                document.getElementById('map-container').style.height = '100px';
                                placesMarkers.forEach((markHere)=>{
                                    markHere.setMap(null);
                                })
                                placesMarkers = [];
                                new google.maps.Marker({
                                    position: shop.geometry.location,
                                    map: myMap
                                });
                                myMap.setZoom(17);
                                myMap.setCenter(shop.geometry.location);
                                this.setState({step1complete:true});
                                this.prepareShopData(shop);
                            }
                        })
                    })
                    this.setState({
                        processing: false
                    })
                    myMap.setOptions({draggable:true});
                })
            })
        })
    }
    checkShop(shop){
        this.setState({processing: true});
        var found = false;
        Object.keys(this.state.shopList).forEach( (key, index)=>{
            if (this.state.shopList[key].gmap_id === shop.id) {
                this.setState({
                    notify: true,
                    notifyMsg: "Looks like that shop is already registered"
                })
                found = true;
            }
        })
        if (!found){
            this.setState({
                notify: true,
                notifyMsg: "Great to have you on-board. This shouldn't take too long 😊."
            })
        }
        this.setState({processing: false});
        return found;
    }
    uuid() {
        var uuid = "", i, random;
        for (i = 0; i < 32; i++) {
          random = Math.random() * 16 | 0;
      
          if (i === 8 || i === 12 || i === 16 || i === 20) {
            uuid += "-"
          }
          uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
        }
        return uuid;
      }
    prepareShopData(shop){
        this.setState({
            shop: {
                shopUID: this.uuid(),
                name: shop.name,
                gmap_id: shop.id,
                location: {
                    x: shop.geometry.location.lat(),
                    y: shop.geometry.location.lng()
                }
            }
        })
    }
    confirmShop(){
        this.setState({processing:true})
        const setData = {
            name: this.state.shop.name,
            location: this.state.shop.location,
            gmap_id: this.state.shop.gmap_id
        };
        firebase.database().ref(`Shops/${this.state.shopUID}`).set(setData).then(
        ()=>{
            this.setState({
                notify: true,
                notifyMsg: "You're good to go! 👍",
                step2complete: true,
                processing: false
            })
        },(err)=>{
            this.setState({
                notify: true,
                notifyMsg: err.message,
                processing: false
            })
        })
    }
    render() {
        return(
            <div className="add-shop-page">
                <Snackbar 
                    onClose={()=>{this.setState({notify:false, notifyMsg: ''})}}
                    open={this.state.notify}
                    autoHideDuration={2000}
                    message={this.state.notifyMsg}
                />
                <div className="add-shop-title-bar">
                    <Typography variant="display2">
                        Weirdoughs | Add Shop
                    </Typography>
                    <Typography variant="subheading" style={{marginTop:'10px'}}>
                        Select location below to add a shop.
                    </Typography>
                </div>
                <Divider />
                {
                    this.state.processing?
                    <LinearProgress style={{marginTop: '10px'}} data-aos="fade-up"/>:
                    null
                }
                <div id="map-container" data-aos="fade-up" style={this.state.processing===false?{marginTop:'10px'}:null}> </div>
                {
                    this.state.step1complete ? 
                    <Card data-aos="slide-up" className="push-down">
                        <CardHeader title="Essentials" subheader="Just getting to know your shop."/>
                        <CardContent>
                            <TextField 
                                disabled={this.state.step2complete || this.state.processing}
                                className="push-down"
                                fullWidth
                                label="Shop Name"
                                value={this.state.shop.name}
                            />
                            <TextField 
                                disabled={this.state.step2complete || this.state.processing}
                                className="push-down"
                                fullWidth
                                label="Google Maps ID"
                                value={this.state.shop.gmap_id}
                            />
                            <TextField 
                                disabled={this.state.step2complete || this.state.processing}
                                className="push-down"
                                fullWidth
                                label="Weirdoughs Shop ID"
                                value={this.state.shop.shopUID}
                            />
                            <Typography 
                                variant="body2" 
                                className="push-down"
                            >
                                Save these somewhere!
                            </Typography>
                            <Button 
                                disabled={this.state.step2complete || this.state.processing}
                                variant="raised"
                                color="primary"
                                fullWidth
                                className="push-down"
                            >
                                <Done style={{marginRight:'10px'}}/>
                                CONFIRM & DONE!
                            </Button>
                        </CardContent>
                    </Card>:
                    null
                }
                {
                    this.state.step1complete && this.state.step2complete ?
                    <Card style={{marginBottom:'100px'}} data-aos="slide-up" className="push-down">
                        <CardHeader title="What's next" subheader="Get your manager, cooks, and deliverers on board!"/>
                        <CardContent>
                            <Button 
                                component={Link}
                                to="/sign-up"
                                fullWidth
                                color="secondary"
                                variant="raised"
                                className="push-down"
                            >
                                <Next style={{marginRight:'10px'}}/>
                                Go to Sign-Up page
                            </Button>
                        </CardContent>
                    </Card>:
                    null
                }
            </div>
        );
    }
}