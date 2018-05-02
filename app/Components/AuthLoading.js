import React, {Component} from 'react';
import {ActivityIndicator, Dimensions, Image, StyleSheet, Text, View} from 'react-native';
import Logo from '../Resources/logo.png';
import * as firebase from 'firebase';
import Snackbar from 'react-native-snackbar';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: Dimensions.get('window').height
    },
    logo: {
        width: Dimensions.get('window').width - ((Dimensions.get('window').width/100) * 20),
        height: Dimensions.get('window').height / 2
    },
    title: {
        fontSize: 40,
        marginBottom: 40
    }
})

export default class AuthLoading extends Component {
    constructor(props){
        super(props);
        this.firebaseListener = null;
        this.authListener = this.authListener.bind(this);
    }
    componentDidMount(){
        this.authListener();
    }
    authListener(){
        this.firebaseListener = firebase.auth().onAuthStateChanged((user)=>{
            if(user){
                firebase.database().ref(`Users/${user.uid}/type`).once('value').then((snap)=>{
                    if (snap.val() === 'customer'){
                        Snackbar.show({
                            title: 'Welcome back!',
                            duration: Snackbar.LENGTH_SHORT
                        })
                        this.props.navigation.navigate('App');
                    } else {
                        firebase.auth().signOut();
                    }
                })
            } else {
                this.props.navigation.navigate('Auth');
            }
        })
    }
    componentWillUnmount(){
        this.fireBaseListener && this.fireBaseListener();
        this.authListener = undefined;
    }
    render(){
        return(
            <View style={styles.container}>
                <Image resizeMode="contain" style={styles.logo} source={Logo} />
                <Text style={styles.title}>Weirdoughs Pizza</Text>
                <ActivityIndicator size="large" color="#00f0ff"/>
            </View>
        );
    }
}