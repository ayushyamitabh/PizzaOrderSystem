import React, {Component} from 'react';
import './ManagerHome.css';
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
import Logout from 'material-ui-icons/ExitToApp';
import User from 'material-ui-icons/Face';

class ManagerHome extends Component{
  constructor(props) {
        super(props);
        this.setState({
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
            

        })
        this.fireBaseListener = null;
        this.authListener = this.authListener.bind(this);
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
                firebase.database().ref(`Users/${user.uid}/`).once('value', 
                     (snap)=>{
                         this.setState({
                             user: {
                                 displayName: user.displayName,
                                 profilePicture: user.photoURL,
                                 uid: user.uid
                             },
                             userData : {
                                 variant: snap.val().type,
                                 orderList: snap.val().orders
                                 
                             }
                         })
                })
             }
         });
     }



        render() {
            return(   
                <div style={{padding:'50px 100px'}}>
                <div className="signup-page"> 
                    <div className="customer-header" data-aos = "fade-up">
                


                        <Button size="small"><User style={{marginRight:'5px'}} />Account</Button>
                        <Button onClick={()=>{firebase.auth().signOut();}} size="small"><Logout style={{marginRight:'5px'}}/>signout</Button>
                    <Divider />

                    </div>
                </div>

          
            
                
            </div>

            )
  }
}
export default ManagerHome;