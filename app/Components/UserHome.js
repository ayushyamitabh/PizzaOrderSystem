import * as firebase from 'firebase';
import React, {Component} from 'react';
import MapView from 'react-native-maps';
import * as Animatable from 'react-native-animatable';
import {Button, Card, Divider, IconToggle} from 'react-native-material-ui';
import {Dimensions, Image, StyleSheet, Text, View} from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex:1,
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
    cardHeader:{
        height: 40,
        flexDirection: 'row',
        alignItems: 'center'
    },
    cardTitle: {
        fontSize: 20
    },
    customAvatar: {
        height: 40,
        width: 40,
        borderRadius: 40,
        marginRight: 10,
        marginLeft:10
    }
})

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
                    x: '',
                    y: ''
                },
                cart:{},
                orders:[]
            },
            showMoreUser: false
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
            }
        })
    }
    render() {
        return (
            <View style={styles.container}>
                <MapView 
                    style={styles.map}
                />
                <Animatable.View animation="fadeInDown" style={{marginTop:20}}>
                    <Card style={{container:styles.card}} ref="nameCard">
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
                        </View>
                        {
                            this.state.showMoreUser?
                            <Button 
                                text="Sign Out"
                                raised
                                accent
                                style={{container:{marginTop:10}}}
                                onPress={()=>{firebase.auth().signOut();}}
                            />:null
                        }
                    </Card>
                </Animatable.View>
            </View>
        );
    }
}