import React, { Component } from 'react';
import { Redirect, Route} from 'react-router-dom';
import GuestOrder from './GuestOrder/GuestOrder.js';
import GuestView from './GuestView/GuestView.js';
class GuestRoutes extends Component{
    render() {
        return (
            <div style={{width:'100%',height:'100%'}}>
                <Route exact path={this.props.match.path} render={()=>{return <Redirect to='/guest/order'/>;}} />
                <Route exact path={`${this.props.match.path}/order`} component={GuestOrder} />
                <Route exact path={`${this.props.match.path}/view/:orderID`} component={GuestView} />
            </div>
        );
    } 
}
export default GuestRoutes;