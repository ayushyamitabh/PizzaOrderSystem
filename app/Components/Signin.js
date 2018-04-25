import React, {Component} from 'react';
import {Dimensions,
        Image,
        ScrollView,
        StyleSheet,
        Text,
        View} from 'react-native';
import Logo from '../Resources/logo.png';
import {Button, Card, Divider} from 'react-native-material-ui';
import * as Animatable from 'react-native-animatable';
import { TextField } from 'react-native-material-textfield';
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
            password:''
        }
    }
    render() {
        return (
            <ScrollView style={{flex:1}} contentContainerStyle={styles.container} scrollEnabled={true}>
                <Animatable.View animation="fadeInUp">
                    <Image resizeMode="contain" style={styles.logo} source={Logo} />
                    <Text style={styles.title}>Weirdoughs Pizza</Text>
                    <Text style={[styles.cardSubheader, {paddingTop: 2,paddingBottom: 5, textAlign: 'center', fontSize: 14}]}>
                        Pizza - quick and easy.
                    </Text>
                </Animatable.View>
                <Animatable.View animation="fadeInUp" style={styles.cardContainer}>
                    <Card style={{container:styles.card}}>
                        <Text style={styles.cardTitle}>Sign In</Text>
                        <Text style={styles.cardSubheader}>Customers, Cooks, Deliverers & Managers</Text>
                        <Divider />
                        <TextField 
                            label="Username"
                            value={this.state.username}
                            onChangeText = { (changedText)=>{this.setState({username:changedText})}}
                        />
                        <TextField
                            label="Password"
                            value={this.state.password}
                            onChangeText = { (changedText)=>{this.setState({password:changedText})}}
                            secureTextEntry={true}
                        />
                        <Button 
                            raised
                            primary
                            text="Sign In"
                        />
                        <Text style={[styles.cardSubheader, {paddingTop: 10,paddingBottom: 10}]}>Don't have an account? Sign Up!</Text>
                        <Button 
                            raised
                            accent
                            text="Sign Up"
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