import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Deliverer from './Delivery/DeliveryRoutes.js';
import Home from './Home/Home.js';
import Signup from './Home/Signup/Signup.js';
import AddShop from './Home/AddShop/AddShop.js';
import NotFound from './Home/NotFound/NotFound.js';

class App extends Component {
    render() {
        return (
            <Router>
                <div style={{width:'100%',height:'100%'}}>
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route path="/sign-up" component={Signup} />
                    <Route path="/add-shop" component={AddShop} />
                    <Route path="/deliverer" component={Deliverer} />
                    <Route component={NotFound} />
                </Switch>
                </div>
            </Router>
        );
    }
}

export default App;
