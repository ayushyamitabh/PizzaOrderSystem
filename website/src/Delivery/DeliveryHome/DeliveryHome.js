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
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';

import MenuIcon from 'material-ui-icons/Menu';

class DeliveryHome extends Component{
 
   
    render() {
      
        return ( 
            <div> 
                <div >
                    <AppBar >
                        <Toolbar>            
                            <Typography align ="right" variant="title" color="inherit">    
                                 <Button color ="secondary" variant = "raised" 
                                component={Link} to="" onClick={()=>{firebase.auth().signOut()}}> Logout
                                 </Button>
                            </Typography>
                        </Toolbar>
                    </AppBar>
                </div>
            
                <div className="AddShop-title-bar" style={{marginTop:'100px'}}>
                        <Typography variant="display2" align ="center">
                            Your Overview
                        </Typography>       
                    <Divider />
                </div>
            
        </div>
        );
    }
};

export default DeliveryHome;