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
import Toolbar from 'material-ui/Toolbar';
import { withStyles } from 'material-ui/styles';



class DeliveryHome extends Component{
 
    
    
    
    render() {
        
        var style = {
         color: 'white',
         float: 'right',
        };
        
        return ( 
            <div>
                <AppBar> 
                    <Toolbar>
                        <Typography variant="title" color="inherit">
                                Deliverer
                            <Button color ="secondary" variant = "raised" style= {style}
                        
                                component={Link} to="" onClick={()=>{firebase.auth().signOut()}}> Logout
                            </Button>
                        </Typography>
                    </Toolbar>
                    
            </AppBar>
            </div>
        );
    }
};

export default DeliveryHome;