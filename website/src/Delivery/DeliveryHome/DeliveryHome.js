import React, {Component} from 'react';
import './DeliveryHome.css';

import * as firebase from 'firebase'
import {Avatar,
        Button,
        Card,
        CardActions,
        CardContent,
        CardHeader,
        Divider,
        Dialog,
        DialogTitle,
        DialogContent,
        DialogContentText,
        IconButton, 
        MenuItem, 
        TextField, 
        Typography } from 'material-ui';
import Logout from 'material-ui-icons/ExitToApp';
import User from 'material-ui-icons/Face';
import Details from 'material-ui-icons/LibraryBooks';
import axios from 'axios';
import Close from 'material-ui-icons/Close';

class DeliveryHome extends Component{
  constructor(props) {
        super(props);
        this.state = {
            deliverer:{
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
            processing: false,
            notify: false,
            notifyMessage: '',
            step1complete: false,
            selectedShop: null,
            orderID: [],
            customerRating:''
            
        };
        this.fireBaseListener = null;
        this.authListener = this.authListener.bind(this);
        this.showDetails = this.showDetails.bind(this);
        this.hideDetails = this.hideDetails.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
       
        this.addRating = this.addRating.bind(this);
        this.updateCustomer2=this.updateCustomer2.bind(this);
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
   
  addRating(){
        var previousOrderID = this.state.orderID;
      firebase.database().ref().child(`Users`).on('value', (snap)=>{
        const delivererID = snap.child(`${this.state.user.cuid}/orders`).val();
        previousOrderID.push(delivererID);
        this.setState ({
            orderID: previousOrderID
        })
        console.log(this.state.orderID);

      });
  }

    componentDidMount() {
       this.authListener();
       this.addRating();

    }
    
    componentWillUnmount(){
     this.fireBaseListener && this.fireBaseListener();
     this.authListener = undefined;
    }
    
    authListener(){
        this.fireBaseListener = firebase.auth().onAuthStateChanged((user) =>{
           if(user){
               firebase.database().ref(`Users/${user.uid}/`).once('value', 
                    (snap)=>{
                        this.setState({
                            user: {
                                displayName: user.displayName,
                                profilePicture: user.photoURL,
                                cuid: user.uid
                            },
                            userData : {
                                variant: snap.val().type,
                                orderList: snap.val().orders
                                
                            }
                        })
               
              
               
                    if (snap.val()){
                            axios.post('https://us-central1-pos-tagmhaxt.cloudfunctions.net/getUserOrderData',{orders: snap.val().orders})
                            .then((result)=>{
                                if (result.data.orderData.length >= 1){
                                    const old = this.state.userData;
                                    old['orders'] = result.data.orderData;
                                    old['ordersMessage'] = '';
                                    old['ordersLoading'] = false;
                                    this.setState({
                                        userData : old
                                    });
                                } else {
                                    const old = this.state.userData;
                                    old['ordersLoading'] = false;
                                    old['ordersMessage'] = "You don't have any orders yet.";
                                    this.setState({
                                        userData: old
                                    })
                                }
                            }).catch((error)=>{
                                var old = this.state.userData;
                                old['ordersLoading'] = false;
                                old['ordersMesage'] = "Couldn't get your orders 😟";
                                this.setState({
                                    userData: old                               
                                })
                            })
                        }
                   
               })
            }
        });
    }


    
    // updateCustomer(index){      
    //     const uid = this.state.userData.orders[index].uid;
    //     firebase.database().ref(`Users/${uid}`).once('value').then ((snap) =>{
    //         if(snap.val()){
    //             var customerData = snap.val();
    //             var a = customerData.averageRating * customerData.ratingCount;
    //             var b = a + this.state.userData.orders[index].customerRating;
    //             var c = b / (customerData.ratingCount +1);
    //             customerData.averageRating = c;
    //             customerData.ratingCount +=1;
    //             firebase.database().ref(`Users/$(uid)`).set(customerData).then (()=>{firebase.database().ref(`Orders/${this.state.userData.orderList[index]}`).set(this.state.userData.orders[index]).then(()=>{
    //                     this.setState({
    //                         processing:false                
    //                     })
    //                 })
    //             })
    //         }                                                         
    //     })
    // }

    updateCustomer2(index, rating){
        this.setState({processing:true})
        const object = {
            cuid: this.state.userData.orders[index].cuid,
            oid: this.state.userData.orderList[index],
            rating: Number(rating),
        };
        console.log('update', object);
        firebase.database().ref(`Users/${object.cuid}`).once('value').then((usersnap)=>{
            console.log('got');
            if (usersnap.val()) {
                var userData = usersnap.val();
                if (userData.averageRating) {
                    var a = userData.averageRating * userData.totalRatings;
                    var b = a + object.rating;
                    userData.totalRatings += 1;
                    userData.averageRating = b / userData.totalRatings;
                    firebase.database().ref(`Users/${object.cuid}`).set(userData).then(()=>{
                        firebase.database().ref(`Orders/${object.oid}/customerRating`).set(object.rating).then(()=>{
                            this.setState({
                                processing: false
                            })
                            window.location.reload();
                        })
                    })
                } else {
                    userData.averageRating = rating;
                    userData.totalRatings = 1;
                    firebase.database().ref(`Users/${object.cuid}`).set(userData).then(()=>{
                        firebase.database().ref(`Orders/${object.oid}/customerRating`).set(object.rating).then(()=>{
                            this.setState({
                                processing: false
                            })
                            window.location.reload();
                        })
                    })
                }
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
                         {/*=============DELIVERER HOME PAGE=============*/}
        return ( 
            // Welcome Title
            <div style={{padding:'50px 100px'}}>
                <div className="signup-page"> 
                    <div className="customer-header" data-aos = "fade-up">
                        <Avatar 
                            alt={this.state.user.displayName}
                            src={this.state.user.profilePicture}
                            className="user-avatar"/>
                        
                        <Typography variant="display2">
                            Welcome, {this.state.user.displayName}  
                        </Typography>
                        <Button size="small"><User style={{marginRight:'5px'}} />Account</Button>
                        <Button onClick={()=>{firebase.auth().signOut();}} size="small"><Logout style={{marginRight:'5px'}}/>signout</Button>
                    <Divider />
                    </div>
                </div>

          
            {/* Past Orders */}

                <div style={{marginTop:'25px',textAlign:'center'}}>
                        <Typography variant="display1" className="push-down" color ="inherit" data-aos ="fade-up">
                            Your Past Orders 
                        </Typography>  

                        <Typography variant="subheading" className="push-down">
                            Check details, rate and leave comments for your past orders.
                        </Typography>
                    <Divider style ={{marginTop:'10px'}}/>
                </div>

                            {/*=============PAST ORDERS=============*/}

            <div className="past-orders" data-aos="fade-up">
                {
                    this.state.userData.orders?
                        this.state.userData.orders.map((data,index)=>{
                            
                            if(this.state.userData.orders[index].status === 'delivered'){
                            console.log(this.state.userData.orders[index].status);
                            return(
                                <Card key={index} data-aos="fade-left" className="order-card">
                                    <CardHeader 
                                        title={data.shopName}
                                        style={{paddingBottom: 0}}/>
                                           
                                        <CardContent style={{paddingBottom:0, paddingTop: 0}}>
                                            {
                                          
                                                data.customerRating === 0 ? 
                                                    <Typography variant="subheading" style={{color:'red'}}>
                                                        <i> Customer not rated yet</i>
                                                    
                                                    </Typography>:

      
                                                    <Typography variant="subheading">
                                                        Customer Rating: <strong>{data.customerRating} <span role="img" aria-label="star">⭐</span></strong>
                                                    </Typography>
                                            }
                                                    <Typography variant="subheading" style={{fontSize:'10.5px'}}>
                                                        <i>See details to rate customers.</i>
                                                    </Typography>

                                                    <Divider />
                                                            
                                        </CardContent>

                                                <CardActions>
                                                    <Button 
                                                        fullWidth
                                                        onClick={()=>{this.showDetails(index)}} 
                                                        color="primary" 
                                                        size="small">
                                                        <Details style={{marginRight:'10px'}} />
                                                        See details
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                );
                          }
                         else if(this.state.userData.orders[index].status === 'accepted'){
                            console.log(this.state.userData.orders[index].status);
                            return(
                                <div className="signup-page" style={{marginTop:'25px',textAlign:'center'}}> 
                                
                                <Card key={index} data-aos="fade-left" className="order-card">
                                    <CardHeader 
                                        title={data.shopName}
                                        style={{paddingBottom: 0}}/>
                                           
                                        <CardContent style={{paddingBottom:0, paddingTop: 0}}>
                                            {
                                          
                                                data.customerRating === 0 ? 
                                                    <Typography variant="subheading" style={{color:'red'}}>
                                                        <i> Customer not rated yet</i>
                                                    
                                                    </Typography>:

      
                                                    <Typography variant="subheading">
                                                        Customer Rating: <strong>{data.customerRating} <span role="img" aria-label="star">⭐</span></strong>
                                                    </Typography>
                                            }
                                                    <Typography variant="subheading" style={{fontSize:'10.5px'}}>
                                                        <i>See details to rate customers.</i>
                                                    </Typography>

                                                    <Divider />
                                                            
                                        </CardContent>

                                                <CardActions>
                                                    <Button 
                                                        fullWidth
                                                        onClick={()=>{this.showDetails(index)}} 
                                                        color="primary" 
                                                        size="small">
                                                        <Details style={{marginRight:'10px'}} />
                                                        See details
                                                    </Button>
                                                </CardActions>
                                            </Card>


                                </div>

                            )

                         }
                         else return null;  
                    })
                        
                    :
                     <Typography variant="subheading" className="no-orders">{this.state.userData.ordersMesage}
                     </Typography>
                }
      
                
            </div>

            <Divider />
            
            {/* View Past Order Details */}

            <Dialog 
                    onClose={()=>{this.hideDetails(false)}} 
                    open={this.state.showDetails} 
                    disableBackdropClick={true} 
                    disableEscapeKeyDown={true}
                >
                {
                    this.state.showDetails ?
                    <div>                        
                    {
                        //this.state.processing?
                        //<LinearProgress />:null
                    }
                        <DialogTitle
                            children={
                                <span>
                                    <span style={{paddingRight:'200px'}}>{`Order from ${this.state.userData.orders[this.state.selectedIndex].shopName}`}</span>
                                    {this.state.processing===false?<IconButton onClick={()=>{this.hideDetails()}}><Close /></IconButton>:null}
                                </span>
                            }
                        ></DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Order# {this.state.userData.orderList[this.state.selectedIndex]}
                                <br />
                                Total: ${this.state.userData.orders[this.state.selectedIndex].total}
                                <br />
                                Rate your customer below!
                                <br />
                            </DialogContentText>
                            {
                                this.state.userData.orders[this.state.selectedIndex].customerRating === 0?
                                <TextField
                                    disabled={this.state.processing}
                                    className="push-down"
                                    select
                                    label="Customer Rating"
                                    fullWidth
                                    value={this.state.userData.orders[this.state.selectedIndex].customerRating}
                                    onChange={(e)=>{
                                        const old = this.state.userData;
                                        old.orders[this.state.selectedIndex].customerRating = e.target.value;
                                        this.setState({
                                            userData: old,
                                            processing: true
                                        })
                                        if (Number(e.target.value) !== 0) this.updateCustomer2(this.state.selectedIndex, e.target.value);
                                        else this.setState({processing:false});
                                    }}
                                >   
                                    <MenuItem value={0}><i>Choose a rating</i></MenuItem>
                                    <MenuItem value={5}><span role="img" aria-label="star">⭐⭐⭐⭐⭐(5) </span></MenuItem>
                                    <MenuItem value={4}><span role="img" aria-label="star">⭐⭐⭐⭐(4) </span></MenuItem>
                                    <MenuItem value={3}><span role="img" aria-label="star">⭐⭐⭐(3) </span></MenuItem>
                                    <MenuItem value={2}><span role="img" aria-label="star">⭐⭐(2) </span></MenuItem>
                                    <MenuItem value={1}><span role="img" aria-label="star">⭐(1) </span></MenuItem>
                                </TextField>:
                                <Typography variant="subheading" className="push-down">
                                    Customer Rating:&nbsp; 
                                    <strong>
                                    {this.state.userData.orders[this.state.selectedIndex].customerRating} <span role="img" aria-label="star">⭐</span>
                                    </strong>
                                </Typography>

                            }                           
                            {
                                this.state.userData.orders[this.state.selectedIndex].status !== 'delivered'?
                                <Button variant="raised" color="secondary"
                                    onClick={()=>{
                                        firebase.database().ref(`Orders/${this.state.userData.orders[this.state.selectedIndex].oid}/status`).set('delivered').then(()=>{
                                            window.location.reload();
                                        })
                                    }}
                                > 
                                    Mark as delivered
                                </Button>
                                :null
                            }


                         
                        </DialogContent>
                    </div>:
                    <div></div> 
                }
                </Dialog>   

                 {/*=============CURRENT ORDERS=============*/}

                <div className="signup-page" style={{marginLeft:'200px'}}> 
                    <div className="customer-header" data-aos = "fade-up">
                        <Typography variant="display2">
                            Your Current Orders  
                        </Typography>
                        
                    <Divider />
                    </div>
                </div>

                <div>
                    
                </div>





                {/* <div className="column" data-aos ="flip-up"> 
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
                </div> */}
        </div>

        );
    }
};

export default DeliveryHome;