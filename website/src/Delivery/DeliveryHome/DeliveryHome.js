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
  constructor(props) {
        super(props);
        this.state = {
            name: '',
        };
  }
   
    render() {
        const centerCard = {
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
            <div><Button color ="secondary" variant = "raised" 
                                component={Link} to="" onClick={()=>{firebase.auth().signOut()}}> Logout
                                 </Button>
            <div className="signup-page"> 
               <div className="delivererSection">
                 <Typography variant="display2">
                       Weirdoughs | Welcome Deliverer 
                    </Typography>
                    
            </div>
</div>
          <Divider />
            
                <div className ="color1" style={{marginTop:'100px'}}>
                        <Typography variant="display2" align="center" color ="inherit">
                            Your Overview
                        </Typography>       
                    <Divider />
                </div>
    
                <div style ={centerCard} data-aos ="flip-up"> 
                    <Card  data-aos ="flip-up" style ={cardDescription} >
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
            <div style ={centerCard} data-aos ="flip-up">
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
            <div style ={centerCard} data-aos ="flip-up">
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