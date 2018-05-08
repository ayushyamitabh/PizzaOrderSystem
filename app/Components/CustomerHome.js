import axios from 'axios';
import * as firebase from 'firebase';
import React, {Component} from 'react';
import MapView from 'react-native-maps';
import {Marker} from 'react-native-maps';
import Snackbar from 'react-native-snackbar';
import SlidingUpPanel from 'rn-sliding-up-panel';
import * as Animatable from 'react-native-animatable';
import { TextField } from 'react-native-material-textfield';
import PopupDialog, { DialogTitle, SlideAnimation } from 'react-native-popup-dialog';
import {Button, Card, Divider, Icon, IconToggle} from 'react-native-material-ui';
import {ActivityIndicator, Dimensions, Image, Picker, StyleSheet, ScrollView, Text, View} from 'react-native';

const heightDivider = 1.085;
const slideAnimation = new SlideAnimation({
    slideFrom: 'bottom',
});
const styles = StyleSheet.create({
    container: {
        flexGrow:1,
        alignItems: 'center'
    },
    map: {
        ...StyleSheet.absoluteFillObject,
        flex:1
    },
    card: {
        padding: 10,
        width: Dimensions.get('window').width - ((Dimensions.get('window').width /100) * 10),
        borderRadius: 10
    },
    cardFullWidth :{
        padding: 10,
        width: Dimensions.get('window').width
    },
    cardHeader:{
        height: 40,
        flexDirection: 'row',
        alignItems: 'center'
    },
    cardTitle: {
        fontSize: 15,
        flex: 1
    },
    customAvatar: {
        height: 40,
        width: 40,
        borderRadius: 40,
        marginRight: 10,
        marginLeft:10
    },
    pullUp: {
        backgroundColor: 'white',
        flexGrow:1,
        flex: 1,
    },
    pullUpTitle: {
        fontSize: 25,
        paddingTop: 20,
        paddingLeft: 20
    },
    pullUpContent:{
        marginTop: 20,
        flexGrow:1,
        flex:1,
        backgroundColor: 'rgba(208,208,208,0.5)'
    },
    pullUpContentContainer:{
        paddingTop: 20,
        paddingBottom: 20,
        flexGrow:1,
        flex: 1,
    },
    pullUpCard:{
        padding: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 5,
        width: Dimensions.get('window').width - ((Dimensions.get('window').width/100)*4),
        borderColor:'#4c4cff',
        borderWidth:0.5
    },
    pullUpCardTitle: {
        fontSize: 20
    },
    pullUpCardSubTitle:{
        fontSize: 15
    },
    pizzaImage: {
        flex: 1,
        maxWidth: 60,
        height: 60
    }
});
const topPos = Dimensions.get('window').height/heightDivider;
export default class CustomerHome extends Component{
    constructor(props){
        super(props);
        this.state = {
            user: {
                displayName: '',
                email: '',
                photo: null
            },
            userData: {
                location: {
                    x: null,
                    y: null
                },
                cart:{},
                orders:[],
                orderData: null
            },
            shops: null,
            showMoreUser: false,
            pulled: Dimensions.get('window').height/heightDivider,
            region: {
                latitude: 0,
                longitude: 0,
                latitudeDelta: 0.0122,
                longitudeDelta: 0.01,
            },
            onCenter: true,
            selectedOrder: null,
            selectedShop:null
        }
        this.openShop = this.openShop.bind(this);
    }
    componentDidMount(){
        firebase.database().ref(`Users/${firebase.auth().currentUser.uid}`).once('value').then((snap)=>{
            if (snap.val()) {
                this.setState({
                    user: {
                        displayName: firebase.auth().currentUser.displayName,
                        email: firebase.auth().currentUser.email,
                        photo: firebase.auth().currentUser.photoURL,
                        uid: firebase.auth().currentUser.uid
                    },
                    userData: snap.val()
                })
                axios.post('https://us-central1-pos-tagmhaxt.cloudfunctions.net/mobileGetPlaces',{location:{latitude:this.state.userData.location.x,longitude:this.state.userData.location.y}})
                .then((places)=>{
                    axios.post('https://us-central1-pos-tagmhaxt.cloudfunctions.net/getClosestShops',places.data)
                    .then((closeShops)=>{
                        var shops = closeShops.data.shops;
                        shops = shops.slice(0,3);
                        if (shops.length === 0){
                            Snackbar.show({title:"Couldn't find any shops near you. 😟",duration:Snackbar.LENGTH_SHORT});
                        } else {
                            this.setState({
                                shops:shops
                            });
                            this.refs.mapView.fitToElements(false);
                        }
                    }).catch((err)=>{
                        Snackbar.show({title:"Couldn't get shops near you. 😟",duration:Snackbar.LENGTH_SHORT});
                    })
                }).catch((err)=>{
                    Snackbar.show({title:"Couldn't search for restaurants near you. 😟",duration:Snackbar.LENGTH_SHORT});
                })
                axios.post('https://us-central1-pos-tagmhaxt.cloudfunctions.net/getUserOrderData', {orders: snap.val().orders})
                .then((result)=>{
                    this.setState({
                        region: {
                            latitude: this.state.userData.location.x ? this.state.userData.location.x : 0,
                            longitude: this.state.userData.location.y? this.state.userData.location.y: 0,
                            latitudeDelta: 0.0122,
                            longitudeDelta: 0.01,
                        }
                    })
                    setTimeout(()=>{
                        this.refs.slideUp.transitionTo(100);
                    }, 1500);
                    if(result.data.orderData.length >=1){
                        var old = this.state.userData;
                        old.orderData = result.data.orderData;
                        this.setState({
                            userData: old
                        });
                    } else {
                        Snackbar.show({
                            title: "Couldn't get your orders 😟.",
                            duration: Snackbar.LENGTH_SHORT,
                        })
                    }
                })
            }
        })
    }
    openShop(index){
        const data = this.state.shops[index];
        axios.post('https://us-central1-pos-tagmhaxt.cloudfunctions.net/getPizzas',{pizzas: data.pizzas})
        .then((pizzaData)=>{
            data.pizzaData = pizzaData.data;
            this.setState({
                selectedShop: data
            })
        })
        .catch((err)=>{
            Snackbar.show({
                title: err.message,
                duration: Snackbar.LENGTH_SHORT
            })
        })
    }
    addToCart(index){
        var pizza = this.state.selectedShop.pizzaData[index];
        var quantity = this.refs[`pizza${index}`].value();
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
                    gmap_id: this.state.selectedShop.gmap_id,
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
                Snackbar.show({
                    title: `Added ${quantity} x ${pizza.name} to 🛒`,
                    duration: Snackbar.LENGTH_SHORT
                })
                this.refs[`pizza${index}`].clear();
            }).catch((err)=>{
                Snackbar.show({
                    title: "Couldn't update your 🛒 online. We'll try again when you add the next item.",
                    duration: Snackbar.LENGTH_LONG
                })
            })
        }
    }
    render() {
        return (
            <ScrollView contentContainerStyle={styles.container}>

                <MapView 
                    ref="mapView"
                    style={styles.map}
                    region={this.state.region}
                    onRegionChangeComplete={(region)=>{this.setState({region:region,onCenter:false});}}
                    zoomEnabled={false}
                    loadingEnabled={true}>
                    <Marker 
                        coordinate={{
                            latitude: this.state.userData.location.x ? this.state.userData.location.x : 0,
                            longitude: this.state.userData.location.y? this.state.userData.location.y : 0,
                        }}
                        title="Your Location"
                    />
                    {
                        this.state.shops?
                        this.state.shops.map((data,index)=>{
                            return(
                                <Marker key={`shop${index}`}
                                    coordinate={{
                                        latitude: data.location.x ,
                                        longitude: data.location.y
                                    }}
                                    title={data.name}
                                    pinColor='yellow'
                                    onCalloutPress={()=>{
                                        this.openShop(index)
                                    }}
                                />
                            );
                        }):null
                    }
                </MapView>
                
                <SlidingUpPanel
                    draggableRange={{top:Dimensions.get('window').height/heightDivider, bottom: 190}}
                    visible={this.state.selectedShop? true:false}
                    onDrag={(pos)=>{
                        this.setState({
                            pulled: pos
                        })
                    }}
                    showBackdrop={false}
                    ref="shopSlideUp">
                    <View style={{backgroundColor:'lightgray', paddingBottom:20}}>
                        {   
                            this.state.selectedShop?
                            <View style={{flexDirection:'row', alignItems:'center', paddingBottom:20, paddingTop:20,backgroundColor:'white'}}>
                                <Icon name="restaurant" style={{paddingLeft: 20}}/>
                                <Text style={[styles.pullUpCardTitle,{paddingLeft: 10,flex:1}]}>{this.state.selectedShop.name}</Text>
                                <IconToggle color='lightblue' onPress={()=>{this.props.navigation.navigate('Cart');}} name="shopping-cart" />
                                <IconToggle color='red' name="close" style={{container:{marginRight: 20}}} onPress={()=>{this.setState({selectedShop:null})}}/>
                            </View>
                            :null
                        }
                        <Divider style={{container:{paddingTop:5,marginBottom:5}}}/>
                        {
                            this.state.selectedShop?
                            <ScrollView contentContainerStyle={{paddingTop:10, paddingBottom:190, flexGrow:1}} style={{height:(Dimensions.get('window').height/heightDivider)-189}}>
                                {
                                    this.state.selectedShop.pizzaData.map((pdata,pindex)=>{
                                        return(
                                            <Card key={`pizza${pindex}`} style={{container:styles.pullUpCard}}>
                                                <View style={{flexDirection:'row'}}>
                                                    <Image source={{uri:pdata.image}} style={styles.pizzaImage}/>
                                                    <View style={{flexDirection:'column', flex: 1, paddingLeft: 20}}>
                                                        <Text style={styles.pullUpCardTitle}>{pdata.name}</Text>
                                                        <Text style={styles.pullUpCardSubTitle}>{pdata.averageRating} ⭐ | ${pdata.cost}</Text>
                                                        <View style={{flexDirection:'row', alignItems:'flex-end'}}>
                                                            <TextField
                                                                ref={`pizza${pindex}`}
                                                                containerStyle={{flex:1}}
                                                                label="Quantity"
                                                                keyboardType="numeric"
                                                            />
                                                            <IconToggle 
                                                                name="add-shopping-cart"
                                                                onPress={()=>{this.addToCart(pindex)}}
                                                            />
                                                        </View>
                                                    </View>
                                                </View>
                                            </Card>
                                        );
                                    })
                                }
                                <Text style={{fontSize:10, textAlign:'center', marginTop:10}}>-- End of Menu --</Text>
                            </ScrollView>
                            :null
                        }
                    </View>
                </SlidingUpPanel>

                <Animatable.View animation="fadeInDown" style={{marginTop:this.state.pulled > topPos/2 ? -5 : 20}}>
                    <Card style={{container: this.state.pulled > topPos/2 ?styles.cardFullWidth:styles.card}} ref="nameCard">
                        <View style={styles.cardHeader}>
                            {
                                this.state.user.photo?
                                <Image style={styles.customAvatar} source={{uri: this.state.user.photo}}/>:
                                null
                            }
                            <Text style={styles.cardTitle}>
                                Welcome, {this.state.user.displayName}
                            </Text>
                            <IconToggle name={this.state.showMoreUser? "arrow-drop-up" :"arrow-drop-down"} onPress={()=>{this.setState({showMoreUser: !this.state.showMoreUser})}}/>                            
                            <IconToggle 
                                name={this.state.onCenter? "gps-fixed" :"gps-not-fixed"} 
                                onPress={()=>{
                                    this.setState({onCenter: true}); 
                                    this.refs.mapView.animateToRegion({
                                        latitude: this.state.userData.location.x ? this.state.userData.location.x : 0,
                                        longitude: this.state.userData.location.y? this.state.userData.location.y: 0,
                                        latitudeDelta: 0.0122,
                                        longitudeDelta: 0.01,
                                    },2000);
                                }}/>
                        </View>
                        {
                            this.state.showMoreUser?
                            <View style={{flexDirection:'row',  flex:1, marginTop:10, justifyContent:'center'}}>
                                <IconToggle color="red" onPress={()=>{this.props.navigation.navigate('Cart');}} name="power-settings-new" onPress={()=>{firebase.auth().signOut();Snackbar.show({title: 'Signing out...',duration: Snackbar.LENGTH_SHORT})}}/>
                                <IconToggle onPress={()=>{this.props.navigation.navigate('Cart');}} name="shopping-cart" />
                            </View>
                            :null
                        }
                    </Card>
                </Animatable.View>

                <PopupDialog
                    dialogTitle={<DialogTitle title={this.state.selectedOrder? `Order from ${this.state.selectedOrder.shopName}`: ''}/>}
                    dialogAnimation={slideAnimation}
                    ref="orderPopup"
                    width={Dimensions.get('window').width*0.9}
                >
                {
                    this.state.selectedOrder?
                    <ScrollView contentContainerStyle={{flexGrow:1, padding: 20}}>
                        <Text style={{fontSize:15}}>Order ID: {this.state.selectedOrder.oid}</Text>
                        <Text style={{fontSize:15}}>Total: ${this.state.selectedOrder.total}</Text>
                        <Divider style={{container:{paddingTop:5,marginTop:5,marginBottom:5}}}/>
                        <Text style={{fontSize:15, color: 'black'}}>About Deliverer: </Text>
                        <Picker
                            onValueChange={(iVal,iInd)=>{
                                var old = this.state.selectedOrder;
                                old.delivererRating = iVal;
                                this.setState({
                                    selectedOrder:old
                                })
                            }}
                            mode='dropdown'
                            selectedValue={this.state.selectedOrder.delivererRating}
                            enabled={this.state.selectedOrder.delivererRating===0}
                        >
                            <Picker.Item value={0} label="None"/>
                            <Picker.Item value={1} label="⭐"/>
                            <Picker.Item value={2} label="⭐⭐"/>
                            <Picker.Item value={3} label="⭐⭐⭐"/>
                            <Picker.Item value={4} label="⭐⭐⭐⭐"/>
                            <Picker.Item value={5} label="⭐⭐⭐⭐⭐"/>
                        </Picker>
                        {
                            this.state.selectedOrder.delivererRating <=3?                            
                            <View>
                                <TextField 
                                    ref="dCom"
                                    labelHeight={2}
                                    label="Complaint"
                                    value={this.state.selectedOrder.delivererComplaint}
                                    editable={this.state.selectedOrder.delivererComplaint?false:true}
                                />
                            </View>:null
                        }
                        {
                            this.state.selectedOrder.delivererComplaint?
                                null:
                                this.state.selectedOrder.delivererRating <=3?
                                <Button 
                                    raised
                                    primary
                                    text="Save Comment"
                                    onPress={()=>{
                                        var val = this.refs.dCom.value();
                                        var old = this.state.selectedOrder;
                                        old['delivererComplaint'] = val;
                                        this.setState({selectedOrder:old});
                                        firebase.database().ref(`Orders/${this.state.selectedOrder.oid}`).set(this.state.selectedOrder).then(()=>{
                                            Snackbar.show({
                                                title:"We'll let the shop know what went wrong.",
                                                duration: Snackbar.LENGTH_SHORT
                                            })
                                        })
                                    }}
                                />:null
                        }
                        {
                            Object.keys(this.state.selectedOrder.pizzaRatings).map((key, index)=>{
                                var _pizza = this.state.selectedOrder.pizzaRatings[key];
                                return(
                                    <View key={`sOrderpizz${index}`}>
                                        <Divider style={{container:{paddingTop:5,marginTop:5,marginBottom:5}}}/>
                                        <Text style={{fontSize:15, color: 'black'}}>About {_pizza.name}</Text>
                                        <Picker
                                            onValueChange={(pVal,pInd)=>{
                                                var old = this.state.selectedOrder;
                                                old.pizzaRatings[key].rating = pVal;
                                                this.setState({
                                                    selectedOrder:old
                                                })
                                            }}
                                            mode='dropdown'
                                            selectedValue={_pizza.rating}
                                            enabled={_pizza.rating===0}
                                        >
                                            <Picker.Item value={0} label="None"/>
                                            <Picker.Item value={1} label="⭐"/>
                                            <Picker.Item value={2} label="⭐⭐"/>
                                            <Picker.Item value={3} label="⭐⭐⭐"/>
                                            <Picker.Item value={4} label="⭐⭐⭐⭐"/>
                                            <Picker.Item value={5} label="⭐⭐⭐⭐⭐"/>
                                        </Picker>
                                    </View>
                                );
                            })
                        }
                    </ScrollView>
                    :null
                }

                </PopupDialog>

                <SlidingUpPanel
                    draggableRange={{top:Dimensions.get('window').height/heightDivider, bottom: 100}}
                    visible={true}
                    onDrag={(pos)=>{
                        this.setState({
                            pulled: pos
                        })
                    }}
                    showBackdrop={false}
                    ref="slideUp"
                >
                <View style={{backgroundColor:'white', paddingTop:20}}>
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                        <Icon name="receipt" style={{paddingLeft: 20}}/>
                        <Text style={[styles.pullUpCardTitle,{paddingLeft: 5,flex:1}]}>Your Past Orders</Text>
                    </View>
                    <Divider style={{container:{marginTop:5, marginBottom: 10}}}/>
                        <ScrollView contentContainerStyle={{paddingTop:10, paddingBottom:20, flexGrow:1}} style={{height:(Dimensions.get('window').height/heightDivider)-89}}>
                            {
                                this.state.userData.orderData?
                                this.state.userData.orderData.map((data, index)=>{
                                    var order = data;
                                    return(
                                        <Card key={`order${index}`} style={{container:styles.pullUpCard}}>
                                            <Text style={{fontSize:10}}>#{index+1}/{this.state.userData.orderData.length}</Text>
                                            <Text style={styles.pullUpCardTitle}>{data.shopName}</Text>
                                            <Text style={styles.pullUpCardSubTitle}>Order ID: {data.oid}</Text>
                                            <Text style={styles.pullUpCardSubTitle}>Total: ${data.total}</Text>
                                            <Text style={{fontSize:10}}>See details to rate and leave comments</Text>
                                            <Button 
                                                text="📝 See details"
                                                accent
                                                raised
                                                style={{container:{borderRadius:10,marginTop:10}}}
                                                onPress={()=>{
                                                    this.setState({
                                                        selectedOrder: order
                                                    })
                                                    this.refs.orderPopup.show(()=>{});
                                                }}
                                            />
                                        </Card>
                                    );
                                }):
                                <ActivityIndicator size="large" color="#00f0ff"/>
                            }
                        </ScrollView>
                    </View>
                </SlidingUpPanel>
            </ScrollView>
        );
    }
}