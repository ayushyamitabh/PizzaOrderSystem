import React, { Component } from 'react';
import { Link } from 'react-router-dom';
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
import Next from 'material-ui-icons/CheckCircle';
import Signout from 'material-ui-icons/Cancel';
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
            processing: this.props.loggedIn
        };
        this.handleChange = this.handleChange.bind(this);
        this.login = this.login.bind(this);
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
    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.loggedIn !== this.state.processing) {
            nextState.processing = nextProps.loggedIn;
        }
        return true;
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
                        {
                            this.props.loggedIn === true ? 
                            <CardContent className="login-form-content">
                                <Typography 
                                    className="push-down"
                                    variant="subheading"
                                >
                                    Welcome, {firebase.auth().currentUser.displayName}!
                                </Typography>
                                <Button 
                                    fullWidth
                                    color="primary"
                                    variant="raised"
                                    className="push-down"
                                    onClick={()=>{
                                        if (this.props.userType === 'customer') {
                                            this.props.history.push(`/customer/home`);
                                        } else if (this.props.userType === 'cook'){                                
                                            this.props.history.push(`/cook/home`);
                                        } else if (this.props.userType === 'deliverer'){                                
                                            this.props.history.push(`/deliverer/home`);
                                        } else if (this.props.userType === 'manager'){                                
                                            this.props.history.push(`/manager/home`);
                                        }
                                    }}
                                >
                                    <Next style={{marginRight:'10px'}} />
                                    CONTINUE TO YOUR PORTAL
                                </Button>
                                <Button
                                    fullWidth
                                    color="secondary"
                                    variant="raised"
                                    className="push-down"
                                    onClick={()=>{
                                        firebase.auth().signOut();
                                    }}
                                >
                                    <Signout style={{marginRight:'10px'}} />
                                    SIGN OUT
                                </Button>
                            </CardContent>:
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
                                    style={{marginTop:5, marginBottom: 5}}
                                    disabled={this.state.processing}
                                    variant="raised" 
                                    color="primary" 
                                    fullWidth 
                                    onClick={()=>{this.login()}}
                                    className="login">
                                    Sign-In
                                </Button>
                                <Typography 
                                    style={{marginTop:5, marginBottom: 5}}
                                    variant="subheading" 
                                    className="signup-line">
                                    Don't have an account? Signup now!
                                </Typography>
                                <Button 
                                    style={{marginTop:5, marginBottom: 5}}
                                    disabled={this.state.processing}
                                    variant="raised" 
                                    color="secondary" 
                                    fullWidth 
                                    className="login"
                                    component={Link} to="/sign-up">
                                    Sign-Up
                                </Button>
                                <Button 
                                    style={{marginTop:5, marginBottom: 5}}
                                    color="primary"
                                    disabled={this.state.processing}
                                    fullWidth 
                                    className="login"
                                    component={Link} to="/guest"
                                >
                                   Continue as guest
                                </Button>
                                <Divider style={{marginTop:5, marginBottom: 5}}/>
                                <Button 
                                    disabled={this.state.processing}
                                    fullWidth 
                                    className="login"
                                    component={Link} to="/add-shop"
                                >
                                    I WANT TO ADD A SHOP
                                </Button>
                            </CardContent>
                        }

                    </Card>
                    <Card className="login-form" data-aos="fade-left" >
                        <CardHeader className="login-form-header" title="About Us" />
                        <CardContent className="login-form-content">
                            <Typography variant="subheading">
                                We've been making pizza for the last century. From Rome, Italy - we've perfected the pizza formula.
                                We don't cut corners, we cut slices. We don't compromise in quality but we let our prices slack.
                            </Typography>
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