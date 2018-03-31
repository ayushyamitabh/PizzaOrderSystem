import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import './Home.css';
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
import logo from '../Resources/logo.png';
import Visible from 'material-ui-icons/Visibility';
import Hidden from 'material-ui-icons/VisibilityOff';
import Code from 'material-ui-icons/Code';
import App from 'material-ui-icons/GetApp';
import Email from 'material-ui-icons/Email';
import * as firebase from 'firebase';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            showPassword: false,
            notify: false,
            notifyMsg: '',
            processing: true
        };
        this.handleChange = this.handleChange.bind(this);
        this.login = this.login.bind(this);
    }
    componentDidMount() {
        firebase.auth().onAuthStateChanged((user)=>{
            if (user) {
                console.log("Signed in.", user.uid);
                /*
                    User is logged in, check type and redirect here
                    How to redirect -- this.props.history.push('/sign-up');

                */
               firebase.database().ref(`Users/${user.uid}/type`).once('value', 
                    (snap)=>{
                        if (snap.val()) {
                            const userType = snap.val();
                            if (userType === 'customer') {
                                this.props.history.push(`/customer/home`);
                            }
                        } else {
                            this.setState({
                                notify: true,
                                notifyMsg: 'Oops... something went wrong fetching your data 😟',
                                processing: false
                            });
                            firebase.auth().signOut();
                        }
                    }
                )
            } else {
                console.log("Signed out.");
                this.setState({
                    processing: false
                })
            }
        })
    }
    login() {
        this.setState({
            processing: true
        });
        firebase.auth().signInWithEmailAndPassword(this.state.username, this.state.password).then(
            (resp)=>{
                // wait for AuthStateChange
            },
            (err)=>{
                this.setState({
                    notify: true,
                    notifyMsg: err.message,
                    processing: false
                });
            }
        )
    }
    handleChange = name => event =>{
        this.setState({
            [name]:event.target.value
        })
    }
    render() {
        return (
            <div className="home-page">
                <Snackbar 
                    onClose={()=>{this.setState({notify:false, notifyMsg: ''})}}
                    open={this.state.notify}
                    autoHideDuration={3000}
                    message={this.state.notifyMsg}
                />         

                <div className="title-bar" data-aos="fade-up" >
                    <Typography variant="display4" className="title">
                        <strong>Weirdoughs</strong>
                    </Typography>
                    <img src={logo} data-aos="fade-left" alt="Weirdoughs' Logo"/>
                    <Typography 
                        variant="display2" 
                        className="tag-line" 
                        data-aos="fade-up">
                        Pizza - quick and easy.
                    </Typography>
                </div>
                <div className="home-page-content">
                    <Card className="login-form" data-aos="slide-right" >
                        {
                            this.state.processing ?
                            <LinearProgress className="loading" />:
                            null
                        }
                        <CardHeader 
                            className="login-form-header"
                            title="Sign In"
                            subheader="Customers, Cooks, Deliverers & Managers"
                        />
                        <CardContent className="login-form-content">
                            <TextField
                                disabled={this.state.processing}
                                className="username"
                                id="username"
                                label="Username"
                                value={this.state.username}
                                onChange={this.handleChange('username')}
                                fullWidth
                                required
                                type="email"
                            />
                            <TextField
                                disabled={this.state.processing}
                                className="password"
                                id="password"
                                label="Password"
                                value={this.state.password}
                                onChange={this.handleChange('password')}
                                fullWidth
                                required
                                type={this.state.showPassword? "text" : "password"}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">
                                                    <IconButton onClick={()=>{this.setState({showPassword: !this.state.showPassword})}}>
                                                        {this.state.showPassword ? <Visible /> : <Hidden />}
                                                    </IconButton>
                                                </InputAdornment>,
                                }}
                            />
                            <Button 
                                disabled={this.state.processing}
                                variant="raised" 
                                color="primary" 
                                fullWidth 
                                onClick={()=>{this.login()}}
                                className="login">
                                Sign-In
                            </Button>
                            <Typography 
                                variant="subheading" 
                                className="signup-line">
                                Don't have an account? Signup now!
                            </Typography>
                            <Button 
                                disabled={this.state.processing}
                                variant="raised" 
                                color="secondary" 
                                fullWidth 
                                className="login"
                                component={Link} to="/sign-up">
                                Sign-Up
                            </Button>
                            <Divider
                                style={{marginTop:'10px'}}/>
                            <Button 
                                disabled={this.state.processing}
                                fullWidth 
                                className="login"
                                component={Link} to="/add-shop"
                            >
                                I WANT TO ADD A SHOP
                            </Button>
                        </CardContent>
                    </Card>
                    <Card className="login-form" style={{padding:'20px'}} data-aos="slide-left" >
                        <CardHeader title="About Us" />
                        <CardContent>
                            <List>
                                <ListItem button component='a' href="https://github.com/ayushyamitabh/PizzaOrderSystem">
                                    <Avatar>
                                        <Code />
                                    </Avatar>
                                    <ListItemText primary="Our GitHub Repository"/>
                                </ListItem>
                                <ListItem button>
                                    <Avatar>
                                        <App />
                                    </Avatar>
                                    <ListItemText primary="Get Our App"/>
                                </ListItem>
                                <Divider />
                                <ListItem button component='a' href="mailto:tagmhaxt@gmail.com">
                                    <Avatar>
                                        <Email />
                                    </Avatar>
                                    <ListItemText primary="Contact Us"/>
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }
}

export default Home;