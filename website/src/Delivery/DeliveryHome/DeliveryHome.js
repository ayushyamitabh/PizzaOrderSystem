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
        Dialog,
        DialogTitle,
        DialogContent,
        DialogContentText,
        IconButton, 
        InputAdornment,
        LinearProgress, 
        List,
        ListItem,
        ListItemText,
        MenuItem,
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
            cook:{
                delivererID: '',
                name: '',
                shopID: '',
                orderID: '',
                avgRating:'',
                rating:'',
                warning: '',
                comment:'',  
                warned: false
            },
            
            user:{
                displayName:'',
                profilePic:null,
                cuid: null
            },
            
            userData:{
              orderList: null,
              orders:null,
              ordersLoading:true,
              ordersMessage: 'Getting Your Orders ...'
            },
            showDetails:false,
            selectedIndex: null,
            process: false
            
        };
        this.fireBaseListener = null;
        this.authListener = this.authListener.bind(this);
        this.showDetails = this.showDetails.bind(this);
        this.hideDetails = this.hideDetails.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.updateCustomer = this.updateCustomer.bind(this);
  }
    
    handleChange(e) {
        this.setState({
        [e.target.name]: e.target.value
      });
    }
    
     handleSubmit(e) {
      e.preventDefault();
  /*    const itemsRef = firebase.database().ref('TestByMelvin');
      const item = {
      comment: this.state.comment
  }
      itemsRef.push(item);
      this.setState({
      comment:''
  });
 
*/
         
  }
   
    componentDidMount(){
       this.authListener();
    }
    
    componentWillUnmount(){
     this.fireBaseListener && this.fireBaseListener();
     this.authListener = undefined;
    }
    
    authListener(){
        this.fireBaseListener = firebase.auth().onAuthStateChanged((user) =>{
           if(user){
               console.log(user);
               this.setState({
                   user: {
                       displayName: user.displayName
                   }
               })
            } 
        });
    }
    
    updateCustomer(index){
        
        const cuid = this.state.userData.orders[index].cuid;
        firebase.database().ref('Users/${cuid}').once('value').then ((snap) =>{
            if(snap.val()){
                var customerData = snap.val();
                var a = customerData.averageRating * customerData.ratingCount;
                var b = a + this.state.userData.orders[index].customerRating;
                var c = b / (customerData.ratingCount +1);
                customerData.averageRating = c;
                customerData.ratingCount +=1;
                firebase.database().ref('Users/$(cuid)').set(customerData).then (()=>{
                    firebase.database().ref('Orders/${this.state.userData.orderList[index]}').set(this.state.userData.orders[index]).then(()=>{
                        this.setState({
                            processing:false                
                        })
                    })
                })
            }                                                         
        })
    }
    
    showDetails(index){
        this.setState({
            selectedIndex: index,
            showDetails:true
        })
    }
    
    hideDetails(){
        this.setState({
            selectedIndex:null,
            showDetails: false
        })
    }
   
    render() {
        const cardDescription = {
        maxWidth: 345,
        border: '5px solid black',      
};
        console.log(this.state.user.displayName);
        return ( 
            <div>
                <div className="signup-page"> 
                    <div className="delivererSection">
                        <Typography variant="display2">
                            Welcome, {this.state.user.displayName}
                            
                        </Typography>
            
                    <Divider />
                    </div>
                </div>

          
            
                <div style={{marginTop:'25px'}}>
                        <Typography  variant="display2" color ="inherit">
                            Your Ratings will be displayed here. 
                        </Typography>     
                    
                </div>
            <Divider />
                <div className="column" data-aos ="flip-up"> 
                    <Card  data-aos ="flip-up" style ={cardDescription} >
                        <CardContent>
                            <Typography gutterBottom variant="headline" component= "h2">
                                Rater Name
                            </Typography>
                                <form onSubmit={this.handleSubmit}>
                                    <input name="comment" value = {this.state.comment} onChange={this.handleChange} placeholder ="Write A Comment" />
                                        <Button type ="submit" style={{marginLeft:'10px'}}variant ="raised" color ="secondary" >Add Rating</Button>
                                </form>
                        </CardContent>
                    </Card>  
                </div>
        </div>

        );
    }
};

export default DeliveryHome;