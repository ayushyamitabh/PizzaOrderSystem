import React, { Component } from 'react';
import { Redirect, Route} from 'react-router-dom';
import CookHome from './CookHome/CookHome.js';

class CookRoutes extends Component{
    render() {
        return (
            <div style={{width:'100%',height:'100%'}}>
                <Route exact path={this.props.match.path} render={()=>{return <Redirect to="/cook/home" />;}} />
                <Route exact path={`${this.props.match.path}/home`} component={CookHome} />
            </div>
        );
    }
}
export default CookRoutes;
