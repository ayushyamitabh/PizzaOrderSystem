import React, { Component } from 'react';
import { BrowserRouter as Router,Redirect, Route, Switch,Link} from 'react-router-dom';
import DeliveryHome from './DeliveryHome/DeliveryHome.js';
import * as firebase from 'firebase'
import {Avatar,
        AppBar,
        Button,
        Card,
        CardContent,
        CardHeader,
        Divider, 
        IconButton, 
        InputAdornment,
        LinearProgress, 
        List,
        ListItem,
        ListItemText,
        Snackbar, 
        TextField, 
        Typography } from 'material-ui';

class DeliveryRoutes extends Component{
    constructor(props){
        super(props);
        this.state = {
            redirect: false
        }
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