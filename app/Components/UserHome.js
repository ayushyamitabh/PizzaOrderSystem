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
import {Button, Card, Divider, IconToggle} from 'react-native-material-ui';
import {Dimensions, Image, Picker, StyleSheet, ScrollView, Text, View} from 'react-native';

const heightDivider = 2.85;
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
        backgroundColor:'#E5E4E2',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 5,
        width: Dimensions.get('window').width - ((Dimensions.get('window').width/100)*4)
    },
    pullUpCardTitle: {
        fontSize: 20
    },
    pullUpCardSubTitle:{
        fontSize: 15
    }
});
const topPos = Dimensions.get('window').height/heightDivider;
export default class UserHome extends Component{
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
            showMoreUser: false,
            pulled: Dimensions.get('window').height/heightDivider,
            region: {
                latitude: 0,
                longitude: 0,
                latitudeDelta: 0.0122,
                longitudeDelta: 0.01,
            },
            onCenter: true,
            selectedOrder: null
        }
    }
    componentDidMount(){
        firebase.database().ref(`Users/${firebase.auth().currentUser.uid}`).once('value').then((snap)=>{
            if (snap.val()) {
                this.setState({
                    user: {
                        displayName: firebase.auth().currentUser.displayName,
                        email: firebase.auth().currentUser.email,
                        photo: firebase.auth().currentUser.photoURL
                    },
                    userData: snap.val()
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
                    />
                </MapView>

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
                            <View>
                            <Button 
                                text="Sign Out"
                                raised
                                accent
                                style={{container:{marginTop:10}}}
                                onPress={()=>{
                                    firebase.auth().signOut();
                                    Snackbar.show({
                                        title: 'Signing out...',
                                        duration: Snackbar.LENGTH_SHORT
                                    })
                                }}
                            />
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
                    <Text style={[styles.pullUpCardTitle,{paddingLeft: 20}]}>Your Past Orders</Text>
                    <Divider style={{container:{marginTop:5, marginBottom: 10}}}/>
                        <ScrollView horizontal pagingEnabled={true} contentContainerStyle={{paddingTop:10, paddingBottom:20}}>
                            {
                                this.state.userData.orderData?
                                this.state.userData.orderData.map((data, index)=>{
                                    var order = data;
                                    return(
                                        <Card key={`order${index}`} style={{container:styles.pullUpCard}}>
                                            <Text style={styles.pullUpCardTitle}>{data.shopName}</Text>
                                            <Text style={styles.pullUpCardSubTitle}>Order ID: {data.oid}</Text>
                                            <Text style={styles.pullUpCardSubTitle}>Total: ${data.total}</Text>
                                            <Text style={{fontSize:10}}>See details to rate and leave comments</Text>
                                            <Button 
                                                text="See details"
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
                                null
                            }
                        </ScrollView>
                    </View>
                </SlidingUpPanel>
            </ScrollView>
        );
    }
}