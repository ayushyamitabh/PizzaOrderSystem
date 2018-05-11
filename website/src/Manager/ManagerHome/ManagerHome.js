import React, {Component} from 'react';
import './ManagerHome.css';
import axios from 'axios';
import * as firebase from 'firebase'
import {Avatar,
        Button,
        Card,
        CardActions,
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
        Typography } from 'material-ui';
import Logout from 'material-ui-icons/ExitToApp';
import Close from 'material-ui-icons/Close';
import * as GoogleMapsLoader from 'google-maps';

class ManagerHome extends Component{
    constructor(props) {
        super(props);
        this.state = {
            user : {
                name: '',
                picture : ''
            },
            processing: false,
            notify: false,
            notifyMessage: '',
            shopData: {},
            shopID: '',
            selectedOrder: null
        };
        this.notify = this.notify.bind(this);
        this.fireBaseListener = null;
        this.authListener = this.authListener.bind(this);
        this.loadMap = this.loadMap.bind(this);
    }

    authListener() {
        this.fireBaseListener = firebase.auth().onAuthStateChanged((user)=>{
            if (user){
                this.setState({
                    user: {
                        name: firebase.auth().currentUser.displayName,
                        picture: firebase.auth().currentUser.photoURL
                    }
                })
                firebase.database().ref(`Users/${firebase.auth().currentUser.uid}/shop`)
                .once('value')
                .then((shopuid)=>{
                    if(shopuid.val()){
                        this.setState({
                            shopID:shopuid.val() 
                        })
                        firebase.database().ref(`Shops/${shopuid.val()}`)
                        .once('value')
                        .then((shopdatasnap)=>{
                            if(shopdatasnap.val()){
                                this.setState({
                                    shopData: shopdatasnap.val()
                                })
                                this.loadMap();
                                var shopdata = shopdatasnap.val();
                                if (shopdata.cook) {
                                    this.setState({processing: true});
                                    shopdata.cook.forEach((data, index)=>{
                                        firebase.database().ref(`Users/${data}`).once('value').then((cooksnap)=>{
                                            if(cooksnap.val()){ 
                                                if (shopdata.cookData) {
                                                    shopdata.cookData.push(cooksnap.val());
                                                } else {
                                                    shopdata.cookData = [cooksnap.val()];
                                                }
                                                this.setState({
                                                    shopData: shopdata
                                                })
                                            }
                                        })
                                    })
                                    this.setState({processing: false});
                                }
                                if (shopdata.deliverer) {
                                    this.setState({processing: true});
                                    shopdata.deliverer.forEach((data, index)=>{
                                        firebase.database().ref(`Users/${data}`).once('value').then((deliverersnap)=>{
                                            if(deliverersnap.val()){ 
                                                if (shopdata.delivererData) {
                                                    shopdata.delivererData.push(deliverersnap.val());
                                                } else {
                                                    shopdata.delivererData = [deliverersnap.val()];
                                                }
                                                this.setState({
                                                    shopData: shopdata
                                                })
                                            }
                                        })
                                    })
                                    this.setState({processing: false});
                                }
                                if (shopdata.orders) {
                                    this.setState({processing: true});
                                    axios.post('https://us-central1-pos-tagmhaxt.cloudfunctions.net/getUserOrderData',{orders: shopdata.orders})
                                    .then((result)=>{
                                        if (result.data.orderData.length >= 1) {
                                            shopdata.orderData = result.data.orderData;
                                            this.setState({
                                                shopData: shopdata
                                            })
                                        }
                                        else this.notify("You don't have any orders yet.");
                                        this.setState({processing: false});
                                    })
                                    .catch((err)=>{
                                        this.notify("Couldn't get your orders 😟");
                                        this.setState({processing: false});
                                    })
                                }
                                if (shopdata.registeredRequests){
                                    this.setState({processing: true});
                                    shopdata.registeredRequests.forEach((uid, index)=>{
                                        firebase.database().ref(`Users/${uid}`).once('value').then((usersnap)=>{
                                            if(usersnap.val()){
                                                if (shopdata.registeredRequestsData) {
                                                    shopdata.registeredRequestsData.push(usersnap.val());
                                                } else {
                                                    shopdata.registeredRequestsData = [usersnap.val()];
                                                }
                                                this.setState({
                                                    shopData: shopdata
                                                })
                                            }
                                        })
                                    })
                                    this.setState({processing:false})
                                }
                                if (shopdata.registered) {
                                    this.setState({processing: true});
                                    shopdata.registered.forEach((uid, index)=>{
                                        firebase.database().ref(`Users/${uid}`).once('value').then((usersnap)=>{
                                            if(usersnap.val()){
                                                if (shopdata.registeredData) {
                                                    shopdata.registeredData.push(usersnap.val());
                                                } else {
                                                    shopdata.registeredData = [usersnap.val()];
                                                }
                                                this.setState({
                                                    shopData: shopdata
                                                })
                                            }
                                        })
                                    })
                                    this.setState({processing:false})
                                }
                                if (shopdata.vip) {
                                    this.setState({processing: true});
                                    shopdata.vip.forEach((uid, index)=>{
                                        firebase.database().ref(`Users/${uid}`).once('value').then((usersnap)=>{
                                            if(usersnap.val()){
                                                if (shopdata.vipData) {
                                                    shopdata.vipData.push(usersnap.val());
                                                } else {
                                                    shopdata.vipData = [usersnap.val()];
                                                }
                                                this.setState({
                                                    shopData: shopdata
                                                })
                                            }
                                        })
                                    })
                                    this.setState({processing:false})
                                }
                                if (shopdata.vipRequests) {
                                    this.setState({processing: true});
                                    shopdata.vipRequests.forEach((uid, index)=>{
                                        firebase.database().ref(`Users/${uid}`).once('value').then((usersnap)=>{
                                            if(usersnap.val()){
                                                if (shopdata.vipRequestsData) {
                                                    shopdata.vipRequestsData.push(usersnap.val());
                                                } else {
                                                    shopdata.vipRequestsData = [usersnap.val()];
                                                }
                                                this.setState({
                                                    shopData: shopdata
                                                })
                                            }
                                        })
                                    })
                                    this.setState({processing:false})
                                }
                            }
                        })
                    }
                })
                .catch((err)=>{
                    console.log(err);
                    this.notify("Couldn't get your shop data 😟 - please try reloading.");
                    this.setState({processing: false});
                })
            } else {
                this.notify("Couldn't get current user 😟 - please try reloading.");
                this.setState({processing: false})
            }
        })
    }

    loadMap() {
        this.setState({processing:true})
        GoogleMapsLoader.KEY = 'AIzaSyAyZVH3IJTKen6oYJ8WmUP_BazsTy_AgUg';
        GoogleMapsLoader.LIBRARIES = ['places'];
        GoogleMapsLoader.load((google)=>{
            var centerLocation = new google.maps.LatLng(this.state.shopData.location.x, this.state.shopData.location.y);
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
        })
    }

    componentDidMount(){
        this.setState({
            processing: true
        })
        this.authListener();
    }

    notify(message){
        this.setState({
            notify: true,
            notifyMessage: message
        })
    }

    componentWillUnmount() {
        this.fireBaseListener && this.fireBaseListener();
        this.authListener = undefined;
    }

    render() {
        return(
            <div style={{padding:'50px 200px'}}>
                {/*=============ASSIGN DELIVERER DIALOG=============*/}
                <Dialog
                    onClose={()=>{this.setState({selectedOrder:null})}} 
                    open={this.state.selectedOrder?true:false} 
                    disableBackdropClick={true} 
                    disableEscapeKeyDown={true}>
                    {
                        this.state.selectedOrder?
                        <div>
                            <DialogTitle >                               
                                <span>
                                    <span style={{paddingRight:'200px'}}>{`Order # ${this.state.selectedOrder.oid}`}</span>
                                    {this.state.processing===false?<IconButton onClick={()=>{this.setState({selectedOrder:null})}}><Close /></IconButton>:null}
                                </span>
                            </DialogTitle>
                            <DialogContent>
                                <TextField 
                                    disabled={this.state.processing}
                                    className="push-down"
                                    select
                                    fullWidth
                                    label={`Assign Deliverer`}
                                    value={this.state.selectedOrder.duid?this.state.selectedOrder.duid:''}
                                    onChange={(e)=>{
                                        this.setState({processing:true})
                                        var old = this.state.selectedOrder;
                                        if (e.target.value !== null) {
                                            old.duid = e.target.value;
                                            old.status = 'accepted';
                                            firebase.database().ref(`Orders/${this.state.selectedOrder.oid}`).set(old).then(()=>{
                                                firebase.database().ref(`Users/${e.target.value}/orders`).once('value').then((snap)=>{
                                                    if(snap.val()) {
                                                        var dorders = snap.val();
                                                        dorders.push(this.state.selectedOrder.oid);
                                                        firebase.database().ref(`Users/${e.target.value}/orders`).set(dorders).then(()=>{
                                                            window.location.reload();
                                                        })
                                                    } else {
                                                        firebase.database().ref(`Users/${e.target.value}/orders`).set([this.state.selectedOrder.oid]).then(()=>{
                                                            window.location.reload();
                                                        })                                                    }
                                                })
                                            })
                                        }
                                    }}
                                >
                                    <MenuItem value={''}><i>Choose a deliverer</i></MenuItem>
                                    {
                                        this.state.shopData.delivererData.map((deliverer, index)=>{
                                            return(
                                                <MenuItem key={`deliverer${index}`} value={this.state.shopData.deliverer[index]}>{deliverer.name}</MenuItem>
                                            );
                                        })
                                    }
                                </TextField>
                            </DialogContent>
                        </div>
                        :<div></div>
                    }
                </Dialog>
                {/*=============NOTIFCATION SNACKBAR=============*/}
                <Snackbar 
                    onClose={()=>{this.setState({notify:false, notifyMessage: ''})}}
                    open={this.state.notify}
                    message={this.state.notifyMessage}
                    autoHideDuration={2000}
                />
                {/*=============TOP PAGE LOADING BAR=============*/}
                <div className="top-loading">
                    {
                        this.state.processing?
                        <LinearProgress /> : null
                    }
                </div>
                {/*=============WELCOME USER HEADER=============*/}
                <div className ="manager-header">
                    <Avatar className="manager-avatar"
                        src={this.state.user.picture} />
                    <Typography variant="display2" style={{flex:1}}>
                        Welcome, {this.state.user.name}
                        <Button style={{float:'right'}} onClick={()=>{firebase.auth().signOut();}}>
                        <Logout style ={{marginRight: '5px'}}/> Signout
                        </Button>
                    </Typography>
                </div>
                <Divider style={{marginBottom:5, marginTop: 5}} />
                <Typography variant="headline" color="primary">Managing <strong>{this.state.shopData?this.state.shopData.name:''}</strong></Typography>
                <Typography variant="caption" >Your Google Maps ID {this.state.shopData?this.state.shopData.gmap_id:''}</Typography>
                <div id="map" data-aos="fade-up"> </div>
                <Divider style={{marginBottom:5, marginTop: 5}} />
                {/*=============SHOPS COOKS=============*/}
                <Typography variant="headline" style={{flex:1}}>
                    Your Cooks
                </Typography>
                <div className="past-orders" data-aos="fade-up">
                {
                    this.state.shopData.cookData?
                    this.state.shopData.cookData.map((cook, index)=>{
                        return(
                            <Card key={index} data-aos="fade-left" className="order-card" style={{paddingBottom: 0}}>
                                <CardHeader 
                                    title={cook.name}
                                    style={{paddingBottom: 0}}
                                />
                                <CardActions>
                                    {
                                        !cook.warned?
                                        <Button color="secondary" fullWidth 
                                            onClick={()=>{
                                                firebase.database().ref(`Users/${this.state.shopData.cook[index]}/warned`).set(true).then(()=>{
                                                    window.location.reload();
                                                })
                                            }}
                                        >
                                            Send Warning
                                        </Button>
                                        :
                                        <Button fullWidth >
                                            Already Warned
                                        </Button>
                                    }
                                </CardActions>
                            </Card>
                        );
                    })
                    :<Typography variant="caption" style={{textAlign:'center'}}> Nothing to show yet 👍</Typography>
                }
                </div>
                <Divider style={{marginBottom:5, marginTop: 5}} />
                {/*=============SHOPS DELIVERERS=============*/}
                <Typography variant="headline" style={{flex:1}}>
                    Your Deliverers
                </Typography>
                <div className="past-orders" data-aos="fade-up">
                {
                    this.state.shopData.delivererData?
                    this.state.shopData.delivererData.map((deliverer, index)=>{
                        return(
                            <Card key={index} data-aos="fade-left" className="order-card" style={{paddingBottom: 0}}>
                                <CardHeader 
                                    title={deliverer.name}
                                    subheader={deliverer.averageRating?`${deliverer.averageRating} ⭐`: 'No ratings yet'}
                                    style={{paddingBottom: 0}}
                                />
                                <CardActions>
                                    {
                                        !deliverer.warned?
                                        <Button color="secondary" fullWidth 
                                            onClick={()=>{
                                                firebase.database().ref(`Users/${this.state.shopData.deliverer[index]}/warned`).set(true).then(()=>{
                                                    window.location.reload();
                                                })
                                            }}
                                        >
                                            Send Warning
                                        </Button>
                                        :
                                        <Button fullWidth >
                                            Already Warned
                                        </Button>
                                    }
                                </CardActions>
                            </Card>
                        );
                    })
                    :<Typography variant="caption" style={{textAlign:'center'}}> Nothing to show yet 👍</Typography>
                }
                </div>
                <Divider style={{marginBottom:5, marginTop: 5}} />
                {/*=============SHOPS ORDERS=============*/}
                <Typography variant="headline" style={{flex:1}}>
                    Your Orders
                </Typography>
                <div className="past-orders" data-aos="fade-up">
                {
                    this.state.shopData.orderData?
                    this.state.shopData.orderData.map((order, index)=>{
                        return(
                            <Card key={index} data-aos="fade-left" className="order-card" style={{paddingBottom: 0}}>
                                <CardHeader 
                                    title={`Order# ${order.oid}`}
                                    subheader={`Deliverer : ${order.delivererRating} ⭐ | Customer : ${order.customerRating} ⭐`}
                                    style={{paddingBottom: 0}}
                                />
                                <CardActions>
                                    {
                                        order.status === 'ordered'?
                                        <Button variant="raised" 
                                            color="primary" 
                                            fullWidth
                                            onClick={()=>{this.setState({selectedOrder:order})}}
                                        > 
                                            Assign Deliverer 
                                        </Button>:
                                        order.status === 'accepted'?
                                        <Button fullWidth onClick={()=>{this.props.history.push(`/guest/view/${order.oid}`)}} > Out for delivery </Button>:
                                        <Button fullWidth > Deliverered 👍 </Button>
                                    }
                                </CardActions>
                            </Card>
                        );
                    })
                    :<Typography variant="caption" style={{textAlign:'center'}}> Nothing to show yet 👍</Typography>
                }
                </div>
                <Divider style={{marginBottom:5, marginTop: 5}} />
                {/*=============REGISTERED CUSTOMER REQUESTS=============*/}
                <Typography variant="headline" style={{flex:1}}>
                    Registered Customer Requests
                </Typography>
                <div className="past-orders" data-aos="fade-up">
                {
                    this.state.shopData.registeredRequestsData?
                    this.state.shopData.registeredRequestsData.map((user, index)=>{
                        return(
                            <Card key={index} data-aos="fade-left" className="order-card" style={{paddingBottom: 0}}>
                                <CardHeader 
                                    title={user.name}
                                    subheader={user.averageRating?`${user.averageRating} ⭐`:'No ratings yet'}
                                    style={{paddingBottom: 0}}
                                />
                                <CardActions>
                                        <Button variant="raised" color="primary" fullWidth
                                            onClick={()=>{
                                                var old = this.state.shopData;
                                                if (old.registered) {
                                                    old.registered.push(old.registeredRequests[index]);
                                                } else {
                                                    old.registered = [old.registeredRequests[index]];
                                                }
                                                old.registeredRequests.splice(index, 1);
                                                delete old.delivererData;
                                                delete old.cookData;
                                                delete old.orderData;
                                                delete old.registeredData;
                                                delete old.registeredRequestsData;
                                                delete old.vipData;
                                                delete old.vipRequestsData;
                                                firebase.database().ref(`Shops/${this.state.shopID}`).set(old).then(()=>{
                                                    window.location.reload();
                                                })
                                            }}
                                        > 
                                            Accept Request 
                                        </Button>
                                </CardActions>
                            </Card>
                        );
                    })
                    :<Typography variant="caption" style={{textAlign:'center'}}> Nothing to show yet 👍</Typography>
                }
                </div>
                <Divider style={{marginBottom:5, marginTop: 5}} />
                {/*=============REGISTERED CUSTOMERS =============*/}
                <Typography variant="headline" style={{flex:1}}>
                    Registered Customers
                </Typography>
                <div className="past-orders" data-aos="fade-up">
                {
                    this.state.shopData.registeredData?
                    this.state.shopData.registeredData.map((user, index)=>{
                        return(
                            <Card key={index} data-aos="fade-left" className="order-card" style={{paddingBottom: 0}}>
                                <CardHeader 
                                    title={user.name}
                                    subheader={user.averageRating?`${user.averageRating} ⭐`:'No ratings yet'}
                                    style={{paddingBottom: 0}}
                                />
                                <CardActions>
                                <Button variant="raised" color="primary" fullWidth
                                            onClick={()=>{
                                                var old = this.state.shopData;
                                                old.registered.splice(index, 1);
                                                delete old.delivererData;
                                                delete old.cookData;
                                                delete old.orderData;
                                                delete old.registeredData;
                                                delete old.registeredRequestsData;
                                                delete old.vipData;
                                                delete old.vipRequestsData;
                                                firebase.database().ref(`Shops/${this.state.shopID}`).set(old).then(()=>{
                                                    window.location.reload();
                                                })
                                            }}
                                > 
                                    Remove Registered Cusotmer 
                                </Button>
                                </CardActions>
                            </Card>
                        );
                    })
                    :<Typography variant="caption" style={{textAlign:'center'}}> Nothing to show yet 👍</Typography>
                }
                </div>
                <Divider style={{marginBottom:5, marginTop: 5}} />
                {/*=============VIP CUSTOMER REQUESTS =============*/}
                <Typography variant="headline" style={{flex:1}}>
                    VIP Customer Requests
                </Typography>
                <div className="past-orders" data-aos="fade-up">
                {
                    this.state.shopData.vipRequestsData?
                    this.state.shopData.vipRequestsData.map((user, index)=>{
                        return(
                            <Card key={index} data-aos="fade-left" className="order-card" style={{paddingBottom: 0}}>
                                <CardHeader 
                                    title={user.name}
                                    subheader={user.averageRating?`${user.averageRating} ⭐`:'No ratings yet'}
                                    style={{paddingBottom: 0}}
                                />
                                <CardActions>
                                    <Button variant="raised" color="primary" fullWidth
                                        onClick={()=>{
                                            var old = this.state.shopData;
                                            if (old.vip) {
                                                old.vip.push(old.vipRequests[index]);
                                            } else {
                                                old.vip = [old.vipRequests[index]];
                                            }
                                            old.registered.splice(old.registered.indexOf(old.vipRequests[index]),1);
                                            old.vipRequests.splice(index, 1);
                                            delete old.delivererData;
                                            delete old.cookData;
                                            delete old.orderData;
                                            delete old.registeredData;
                                            delete old.registeredRequestsData;
                                            delete old.vipData;
                                            delete old.vipRequestsData;
                                            firebase.database().ref(`Shops/${this.state.shopID}`).set(old).then(()=>{
                                                window.location.reload();
                                            })
                                        }}
                                    > 
                                        Accept Request 
                                    </Button>
                                </CardActions>
                            </Card>
                        );
                    })
                    :<Typography variant="caption" style={{textAlign:'center'}}> Nothing to show yet 👍</Typography>
                }
                </div>
                <Divider style={{marginBottom:5, marginTop: 5}} />
                {/*=============VIP CUSTOMERs =============*/}
                <Typography variant="headline" style={{flex:1}}>
                    VIP Customers
                </Typography>
                <div className="past-orders" data-aos="fade-up">
                {
                    this.state.shopData.vipData?
                    this.state.shopData.vipData.map((user, index)=>{
                        return(
                            <Card key={index} data-aos="fade-left" className="order-card" style={{paddingBottom: 0}}>
                                <CardHeader 
                                    title={user.name}
                                    subheader={user.averageRating?`${user.averageRating} ⭐`:'No ratings yet'}
                                    style={{paddingBottom: 0}}
                                />
                                <CardActions>
                                <Button variant="raised" color="primary" fullWidth
                                            onClick={()=>{
                                                var old = this.state.shopData;
                                                old.vip.splice(index, 1);
                                                delete old.delivererData;
                                                delete old.cookData;
                                                delete old.orderData;
                                                delete old.registeredData;
                                                delete old.registeredRequestsData;
                                                delete old.vipData;
                                                delete old.vipRequestsData;
                                                firebase.database().ref(`Shops/${this.state.shopID}`).set(old).then(()=>{
                                                    window.location.reload();
                                                })
                                            }}
                                > 
                                    Remove VIP Cusotmer 
                                </Button>
                                </CardActions>
                            </Card>
                        );
                    })
                    :<Typography variant="caption" style={{textAlign:'center'}}> Nothing to show yet 👍</Typography>
                }
                </div>
                <Divider style={{marginBottom:5, marginTop: 5}} />
            </div>
        );
    }
}
export default ManagerHome;
