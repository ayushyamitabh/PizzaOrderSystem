import React, { Component } from 'react';
import { Redirect, Route} from 'react-router-dom';
import CustomerHome from './CustomerHome/CustomerHome.js';

class CustomerRoutes extends Component{
    render() {
        return (
            <div style={{width:'100%',height:'100%'}}>
                <Route exact path={this.props.match.path} render={()=>{return <Redirect to="/customer/home" />;}} />
                <Route exact path={`${this.props.match.path}/home`} component={CustomerHome} />
            </div>
        );
    } 
}
export default CustomerRoutes;
