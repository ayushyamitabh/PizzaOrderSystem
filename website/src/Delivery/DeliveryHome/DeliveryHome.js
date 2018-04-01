import React, {Component} from 'react';
import './DeliveryHome.css';
import { BrowserRouter as Router,Redirect, Route, Switch,Link} from 'react-router-dom';
import * as firebase from 'firebase'
import {Avatar,
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
import {AppBar, Tabs, Tab} from 'material-ui'

class DeliveryHome extends Component{
 
    render() {
        return ( 
            <div>
                <AppBar> 
             
                    <Button
                    component={Link} to="" onClick={()=>{firebase.auth().signOut()}}> Logout
                    </Button>
                  
            </AppBar>
            </div>
        );
    }
};

export default DeliveryHome;