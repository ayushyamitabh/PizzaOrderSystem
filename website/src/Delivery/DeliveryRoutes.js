import React, { Component } from 'react';
import { BrowserRouter as Router,Redirect, Route} from 'react-router-dom';
import DeliveryHome from './DeliveryHome/DeliveryHome.js';

class DeliveryRoutes extends Component{
    constructor(props){
        super(props);
    }
    render() {
        return (
            <div style={{width:'100%',height:'100%'}}>
                <Route exact path={this.props.match.path} render={()=>{<Redirect to="/deliverer/home" />}} />
                <Route path={`${this.props.match.path}/home`} component={DeliveryHome} />
            </div>
        );
    } 
}
export default DeliveryRoutes;
