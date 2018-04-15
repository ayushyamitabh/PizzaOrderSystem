import React, {Component} from 'react';
import {Divider,Typography} from 'material-ui';
import * as firebase from 'firebase';

export default class CustomerHome extends Component{
    constructor(props){
        super(props);
        this.state = {
            user: {
                displayName: ''
            },
            userData: null
        }
        this.fireBaseListener = null;
        this.authListener = this.authListener.bind(this);
    }
    componentDidMount() {
        this.authListener();
    }
    authListener() {
        firebase.database().ref('test').on('value', (snap)=>{
            console.log(snap.val());
        })
        this.fireBaseListener = firebase.auth().onAuthStateChanged((user)=>{
            if (user) {
               firebase.database().ref(`Users/${user.uid}/`).once('value', 
                    (snap)=>{
                        this.setState({
                            user: {
                                displayName: user.displayName
                            },
                            userData: snap.val()
                        })
                    }
                )
            }
        })
    }
    componentWillUnmount() {
        this.fireBaseListener && this.fireBaseListener();
        this.authListener = undefined;
    }
    render() {
        return(
            <div style={{padding:'50px 100px'}}>
                <Typography variant="display2" data-aos="fade">
                    Welcome, {this.state.user.displayName}
                </Typography>
                <Divider className="push-down" />
                <Typography variant="headline" className="push-down">
                    Your Orders
                </Typography>
            </div>
        );
    }
};