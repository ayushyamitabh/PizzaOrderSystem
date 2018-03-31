import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, withRouter } from 'react-router-dom';
import Deliverer from './Delivery/Deliverer.js';
import Home from './Home/Home.js';
import Signup from './Home/Signup/Signup.js';
import AddShop from './Home/AddShop/AddShop.js';
import NotFound from './Home/NotFound/NotFound.js';
import * as firebase from 'firebase';

class App extends Component {
    constructor(props){
        super(props);
        this.cleanUpUser = this.cleanUpUser.bind(this);
    }
    cleanUpUser(){
        console.log("cleaning user");
        var user = firebase.auth().currentUser;
        if (user) {
            console.log(user.uid);
        }
    }
    render() {
        return (
            <Router>
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route path="/sign-up" render={(props)=>(<Signup {...props} sanitizer={this.cleanUpUser} />)} />
                    <Route path="/add-shop" component={AddShop} />
                    <Route path="/deliverer" component={Deliverer} />
                    <Route component={NotFound} />
                </Switch>
            </Router>
        );
    }
}

export default App;
