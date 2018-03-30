import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Deliverer from './Delivery/Deliverer.js';
import Home from './Home.js';

class App extends Component {
    render() {
        return (
            <Router>
            <div>
                <Route exact path="/" component={Home} />
                <Route path="/Deliverer" component={Deliverer} />
            </div>
            </Router>
        );
    }
}

export default App;
