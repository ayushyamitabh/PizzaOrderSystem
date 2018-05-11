import React, { Component } from 'react';
import {Divider, LinearProgress, MenuList, MenuItem, Snackbar, Typography} from 'material-ui';
import * as firebase from 'firebase';
import './GuestView.css';
import * as GoogleMapsLoader from 'google-maps';
export default class GuestView extends Component {
    constructor(props){
        super(props);
        this.state = {
            processing: false,
            notify: false,
            notifyMessage: '',
            oData: null
        };
        console.log(this.props.match.params.orderID);
    }
    componentDidMount(){
        this.setState({
            processing: true
        })
        firebase.database().ref(`Orders/${this.props.match.params.orderID}`).on('value',(snap)=>{
            if (snap.val()) {
                this.setState({
                    oData: snap.val()
                })
                firebase.database().ref(`Shops/${snap.val().shop}/location`).once('value').then((shopsnap)=>{
                    if(shopsnap.val()){
                        const from = {
                            x: shopsnap.val().x,
                            y: shopsnap.val().y
                        };
                        firebase.database().ref(`Users/${snap.val().cuid}/location`).once('value').then((usersnap)=>{
                            if(usersnap.val()) {
                                this.loadMap(from,{x:usersnap.val().x, y:usersnap.val().y});
                            } else {
                                this.loadMap(from,{x:40.8188696, y:-73.9461309});
                            }
                        })
                    }
                })
            } else {
                this.notify("That order doesn't exist");
                setTimeout(()=>{this.props.history.goBack();},2750);
            }
        })
    }
    loadMap(from,to){
        GoogleMapsLoader.KEY = 'AIzaSyAyZVH3IJTKen6oYJ8WmUP_BazsTy_AgUg';
        GoogleMapsLoader.LIBRARIES = ['places'];
        GoogleMapsLoader.load((google)=>{
            const FROM_LatLng = new google.maps.LatLng(from.x, from.y);
            const TO_LatLng = new google.maps.LatLng(to.x, to.y);
            const centerLocation = new google.maps.LatLng(from.x, from.y);
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
            var bounds = new google.maps.LatLngBounds();
            bounds.extend(FROM_LatLng);
            bounds.extend(TO_LatLng);
            guestMap.fitBounds(bounds);
            var directionService = new google.maps.DirectionsService();
            var directionDisplay = new google.maps.DirectionsRenderer();
            directionDisplay.setMap(guestMap);
            var request = {
                origin: FROM_LatLng,
                destination: TO_LatLng,
                travelMode: 'DRIVING'
            };
            directionService.route(request, (result, status)=>{
                if (status == 'OK'){
                    directionDisplay.setDirections(result);
                    this.setState({
                        processing:false
                    })
                }
            })
        })
    }
    notify(message){
        this.setState({
            notify: true,
            notifyMessage: message
        })
    }
    render() {
        return (
            <div className="guest-view-page">
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
                    Tracking Order# {this.props.match.params.orderID} 🚴‍
                </Typography>
                <Divider style={{marginTop:5, marginBottom: 5}}/>
                {   
                    this.state.oData?
                    <div>
                        <Typography variant="headline" data-aos="slide-up">
                            🍽 {this.state.oData.shopName}
                        </Typography>
                        <Typography variant="subheading" data-aos="slide-up">
                            📝 ${this.state.oData.total}
                        </Typography>
                        <Typography variant="subheading" data-aos="slide-up">
                            💳 {this.state.oData.payment.noc}
                        </Typography>
                        <Typography variant="subheading" data-aos="slide-up">
                            ✅ {this.state.oData.status.toUpperCase()}
                        </Typography>
                        <Divider style={{marginTop:5, marginBottom: 5}}/>
                        <Typography variant="headline" data-aos="slide-up">
                            Your Item(s)
                        </Typography>
                        <MenuList role="menu">
                        {
                            Object.keys(this.state.oData.pizzaRatings).map((key, index)=>{
                                var pizza = this.state.oData.pizzaRatings[key];
                                return(
                                    <MenuItem key={`item${index}`}>
                                        <div style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'flex-start', flex: 1}}>
                                            <Typography variant="subheading">{pizza.name}</Typography>
                                            <Typography style={{fontSize:'11px', color:'darkgray'}}>{pizza.drawing? 'Customized':'Not Customized'}</Typography>
                                        </div>
                                    </MenuItem>
                                )
                            })
                        }
                        </MenuList>
                        <Divider style={{marginTop:5, marginBottom: 5}}/>
                        <div id="map"> </div>
                    </div>:
                    <Typography variant="title">Order not found...</Typography>
                }
            </div>
        );
    }
}