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
        const card = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

};
        const cardDescription = {
        maxWidth: 345,
        border: '5px solid pink',
        marginTop:'100px',
        

};
        
        
        
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
            
                <div className ="color1" style={{marginTop:'100px'}}>
                        <Typography variant="display2" align="center" color ="inherit">
                            Your Overview
                        </Typography>       
                    <Divider />
                </div>
                
                <div style ={card} data-aos ="flip-up">
                    <Card style={cardDescription} >
                <CardHeader
                    title="Pizza Review"
                />
    
                <CardContent>
                    <Typography gutterBottom variant="headline" component="h2">
                    Lizard
                    </Typography>

                <Typography component="p">
                Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging
                across all continents except Antarctica
                </Typography>
                </CardContent>
                </Card>

            </div>
            <div style ={card} data-aos ="flip-up">
                    <Card style={cardDescription} >
                <CardHeader
                    title="Pizza Review"
                />
    
                <CardContent>
                    <Typography gutterBottom variant="headline" component="h2">
                    Lizard
                    </Typography>

                <Typography component="p">
                Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging
                across all continents except Antarctica
                </Typography>
                </CardContent>
                </Card>

            </div>
            <div style ={card} data-aos ="flip-up">
                    <Card style={cardDescription} >
                <CardHeader
                    title="Pizza Review"
                   
                />
    
                <CardContent>
                    <Typography gutterBottom variant="headline" component="h2">
                    Lizard
                    </Typography>

                <Typography component="p">
                Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging
                across all continents except Antarctica
                </Typography>
                </CardContent>
                </Card>

            </div>
        </div>
        );
    }
};

export default DeliveryHome;