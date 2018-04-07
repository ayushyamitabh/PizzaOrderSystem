import React, { Component } from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';
import DeliveryRoutes from './Delivery/DeliveryRoutes.js';
import Home from './Home/Home.js';
import Signup from './Home/Signup/Signup.js';
import AddShop from './Home/AddShop/AddShop.js';
import NotFound from './Home/NotFound/NotFound.js';
import * as firebase from 'firebase';

class App extends Component {
    constructor(props){
        super(props);
        this.authListener = this.authListener.bind(this);
        this.firebaseListener = null;
        this.history = createHistory();
        this.state = {
            loggedIn: false,
            userType: null,
            lastLocation: ''
        };
    }
    componentDidMount() {
        this.authListener();
        this.history.listen((loc, act)=>{
            if (this.state.lastLocation === '/sign-up'){
                if (firebase.auth().currentUser) {
                    firebase.database().ref(`Users/${firebase.auth().currentUser.uid}/type`).once('value',
                    (snap)=>{
                        if (!snap.val()){
                            firebase.auth().currentUser.delete();
                        }
                    })
                }
            }
            this.setState({
                lastLocation: loc.pathname
            })
        })
    }
    authListener() {
        this.fireBaseListener = firebase.auth().onAuthStateChanged((user)=>{
            if (user) {
                this.setState({
                    loggedIn: true
                })
                /*
                    User is logged in, check type and redirect here
                    How to redirect -- this.history.push('/sign-up');

                */
               firebase.database().ref(`Users/${user.uid}/type`).once('value', 
                    (snap)=>{
                        if (snap.val()) {
                            const userType = snap.val();
                            if (userType === 'customer') {
                                this.history.push(`/customer/home`);
                            } else if (userType === 'cook'){                                
                                this.history.push(`/cook/home`);
                            } else if (userType === 'deliverer'){                                
                                this.history.push(`/deliverer/home`);
                            } else if (userType === 'manager'){                                
                                this.history.push(`/manager/home`);
                            } else if (userType === 'super') {

                            }
                            this.setState({
                                userType: userType
                            })
                        }
                    }
                )
            } else {
                this.setState({
                    loggedIn: false,
                    userType: null
                })
                this.history.push("/");
            }
        })
    }
    componentWillUnmount() {
        this.fireBaseListener && this.fireBaseListener();
        this.authListener = undefined;
    }
    render() {
        return (
            <Router history={this.history}>
                <div style={{width:'100%',height:'100%'}}>
                <Switch>
                    <Route exact path="/" render={(props)=>{return <Home {...props} userType={this.state.userType} loggedIn={this.state.loggedIn} />;}} />
                    <Route path="/sign-up" component={Signup} />
                    <Route path="/add-shop" component={AddShop} />
                    <Route path="/deliverer" component={DeliveryRoutes} />
                    <Route component={NotFound} />
                </Switch>
                </div>
            </Router>
        );
    }
}

export default App;
