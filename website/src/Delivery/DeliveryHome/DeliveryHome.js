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
            cook: {
                delivererID: '',
                name: '',
                shopID: '',
                orderID: '',
                averageRating: '',
                warning: '',
                warned: false,
                comment:'',
                
            }
        
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
  }
    handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }
    
     handleSubmit(e) {
     e.preventDefault();
     console.log(this.state.cook.comment.value);
  }
    
    
   
    
    componentDidMount(){
       /* var delivererRef =
       */
    }
   
    render() {
        
        const cardDescription = {
        maxWidth: 345,
        border: '5px solid pink',     
        
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
            
                <div  style={{marginTop:'100px'}}>
                        <Typography variant="display2" align="center" color ="inherit">
                            Your Overview
                        </Typography>       
                    <Divider />
                </div>
    



                <div className="column" data-aos ="flip-up"> 
                    <Card  data-aos ="flip-up" style ={cardDescription} >
                
                <CardContent>
                    <Typography gutterBottom variant="headline" component="h2">
                    Rater Name 
                    </Typography>

                <Typography component="p">
                <section>
                    <form>
                        <input type="text" name="username" placeholder="What's your name?" onChange={this.handleChange} value = {this.state.cook.comment}/>
                        
                    </form>
                </section>
                </Typography>
                <Button style={{marginTop:'10px'}}variant ="raised" color ="secondary">Add Item</Button>
                </CardContent>
                </Card>

             

                
            </div>
        </div>

        );
    }
};

export default DeliveryHome;