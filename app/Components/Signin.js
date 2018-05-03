import React, {Component} from 'react';
import {ActivityIndicator,
        Dimensions,
        Image,
        ScrollView,
        StyleSheet,
        Text,
        View} from 'react-native';
import * as firebase from 'firebase';
import Logo from '../Resources/logo.png';
import Snackbar from 'react-native-snackbar';
import * as Animatable from 'react-native-animatable';
import { TextField } from 'react-native-material-textfield';
import {Button, Card, Divider} from 'react-native-material-ui';
const styles = StyleSheet.create({
    container :{
        flexGrow:1,
        padding: 20,
        alignItems:'center',
        flexDirection:'column',
    },
    logo: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height / 4
    },
    title: {
        fontSize: 40,
        textAlign:'center'
    },
    cardContainer: {
        width: Dimensions.get('window').width - ((Dimensions.get('window').width/100)*10)
    },
    card:{
        padding: 20
    },
    cardTitle : {
        fontSize: 20,
    },
    cardSubheader: {
        fontSize: 12,
    }
})

export default class Signin extends Component{
    constructor(props){
        super(props);
        this.state={
            username:'',
            password:'',
            loading: false,
        }
        this.login = this.login.bind(this);
    }
    login(){
        this.setState({
            loading:true,
        })
        Snackbar.show({
            title: 'Signing in...',
            duration: Snackbar.LENGTH_SHORT
        })
        firebase.auth().signInWithEmailAndPassword(this.state.username, this.state.password).then(()=>{
            this.setState({
                loading:false
            })
        }).catch((err)=>{
            Snackbar.show({
                title: err.message,
                duration: Snackbar.LENGTH_LONG
            })
            this.setState({
                loading:false
            })
        })
    }
    render() {
        return (
            <ScrollView style={{height:Dimensions.get('window').height}} contentContainerStyle={styles.container} scrollEnabled={true}>
                <Animatable.View animation="fadeInUp">
                    <Image resizeMode="contain" style={styles.logo} source={Logo} />
                    <Text style={styles.title}>Weirdoughs Pizza</Text>
                    <Text style={[styles.cardSubheader, {paddingTop: 2,paddingBottom: 5, textAlign: 'center', fontSize: 14}]}>
                        Pizza - quick and easy.
                    </Text>
                </Animatable.View>
                {
                    this.state.loading?
                    <Animatable.View animation="fadeIn">
                        <ActivityIndicator size="large" color="#00f0ff"/>
                    </Animatable.View>:
                    null
                }
                <Animatable.View animation="fadeInUp" style={styles.cardContainer}>
                    <Card style={{container:styles.card}}>
                        <Text style={styles.cardTitle}>Sign In</Text>
                        <Text style={styles.cardSubheader}>Customers, Cooks, Deliverers & Managers</Text>
                        <Divider />
                        <TextField 
                            ref="username"
                            label="Username"
                            value={this.state.username}
                            onChangeText = { (changedText)=>{this.setState({username:changedText})}}
                            editable={!this.state.loading}
                            onBlur={()=>{this.refs.password.focus();}}                            
                        />
                        <TextField
                            ref="password"
                            label="Password"
                            value={this.state.password}
                            onChangeText = { (changedText)=>{this.setState({password:changedText})}}
                            secureTextEntry={true}
                            editable={!this.state.loading}
                        />
                        <Button 
                            onPress={this.login}
                            raised
                            primary
                            text="Sign In"
                            disabled={this.state.loading}
                        />
                        <Text style={[styles.cardSubheader, {paddingTop: 10,paddingBottom: 10}]}>Don't have an account? Sign Up!</Text>
                        <Button 
                            raised
                            accent
                            text="Sign Up"
                            disabled={this.state.loading}
                        />
                    </Card>
                </Animatable.View>
                <Animatable.View animation="fadeInUp" style={styles.cardContainer}>
                    <Card style={{container:styles.card}}>
                        <Text style={styles.cardTitle}>About Us</Text>
                        <Divider />
                        <Text style={[styles.cardSubheader,{paddingTop:10, textAlign:'justify'}]}>
                            We've been making pizza for the last century. From Italy - we've perfected the pizza formula. We don't cut corners, we cut slices. We don't compromise in quality but we let our prices slack.
                        </Text>
                    </Card>
                </Animatable.View>
            </ScrollView>
        );
    }
}