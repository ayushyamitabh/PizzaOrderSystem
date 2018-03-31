import React, {Component} from 'react';
import './Signup.css';
import {Button,
        Card,
        CardContent,
        CardHeader,
        Divider, 
        FormControl,
        InputLabel,
        IconButton, 
        InputAdornment,
        LinearProgress, 
        MenuItem,
        Select, 
        Snackbar,
        TextField,
        Typography} from 'material-ui';
import Visible from 'material-ui-icons/Visibility';
import Hidden from 'material-ui-icons/VisibilityOff';
import Next from 'material-ui-icons/PlayCircleFilled';
import FileUpload from 'material-ui-icons/CloudUpload';
import Done from 'material-ui-icons/CheckCircle';
import * as firebase from 'firebase';

export default class Signup extends Component{
    constructor(props){
        super(props);
        this.state = {
            userType: '',
            name: '',
            email: '',
            password: '',
            showPassword: false,
            customerVariant: '',
            step1complete: false,
            step2complete: false,
            processing: false,
            profilePic: '',
            notify: false,
            notifyMsg: ''
        };
        this.handleChange = this.handleChange.bind(this);
        this.createUser = this.createUser.bind(this);
    }
    componentDidMount(){
        this.props.history.listen((location, action)=>{
            if (location.pathname !== '/sign-up'){
                this.props.sanitizer();
            }
        })
    }
    handleChange = name => event => {
        this.setState({
            [name]: event.target.value
        });
    }
    validate(type){
        if (type === 'createUser') {
            if (this.state.name === '') {
                return false;
            }
            if (this.state.email === '') {
                return false;
            }
            if (this.state.password === ''){
                return false;
            }
            if (this.state.profilePic === ''){
                return false;
            }
            return true;
        }
    }
    createUser(){
        if (this.validate('createUser') === true) {
            this.setState({
                processing: true
            })
            firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password).then(
                (resp)=>{
                    firebase.auth().currentUser.updateProfile({
                        displayName: this.state.name,
                        photoURL: this.state.profilePic
                    }).then(
                        (updateResp)=>{
                            this.setState({
                                processing: false,
                                step1complete: true
                            })
                        },
                        (updateErr)=>{
                            this.setState({
                                notify: true,
                                notifyMsg: updateErr.message,
                                processing: false
                            })
                        }
                    )
                },
                (err)=>{
                    this.setState({
                        notify: true,
                        notifyMsg: err.message,
                        processing: false
                    })
                }
            )
        } else {
            this.setState({
                notify: true,
                notifyMsg: "Looks like you're missing stuff."
            })
        }
    }
    render() {
        return(
            <div className="signup-page">
                <Snackbar 
                    onClose={()=>{this.setState({notify:false, notifyMsg: ''})}}
                    open={this.state.notify}
                    autoHideDuration={3000}
                    message={this.state.notifyMsg}
                />     
                <div className="signup-title-bar">
                    <Typography variant="display2">
                       Weirdoughs | Sign-Up
                    </Typography>
                    <Typography variant="subheading" style={{marginTop:'10px'}}>
                        Fill out the form below to sign-up for an account.
                    </Typography>
                </div>                
                <Divider />
                {
                    this.state.processing ?
                    <LinearProgress data-aos="fade" />:
                    null
                }
                <FormControl fullWidth style={{marginTop:'10px'}}>
                    <InputLabel htmlFor="user-type">User Type</InputLabel>
                    <Select 
                        value={this.state.userType}             
                        inputProps={{
                            id: 'user-type',
                        }}
                        onChange={this.handleChange('userType')}
                        disabled={this.state.step1complete || this.state.processing}
                    >
                        <MenuItem value=''>None</MenuItem>
                        <MenuItem value='customer'>Customer</MenuItem>
                        <MenuItem value='cook'>Cook</MenuItem>
                        <MenuItem value='deliverer'>Deliverer</MenuItem>
                        <MenuItem value='manager'>Manager</MenuItem>                        
                    </Select>
                </FormControl>
                {
                    this.state.userType === '' ?
                    <Typography style={{marginTop:'10px'}} variant="subheading"> Select A User Type To Get Started</Typography>:
                    <div className="signup-page-content">
                        <Card style={{marginTop:'10px'}} data-aos="slide-up">
                            <CardHeader title="Essentials" subheader="What we need to get started"/>
                            <CardContent>
                                <TextField
                                    onChange={this.handleChange('name')}
                                    id="name"
                                    label="Full Name"
                                    required
                                    value={this.state.name}
                                    fullWidth
                                    className="push-down"
                                    disabled={this.state.step1complete || this.state.processing}
                                />
                                <TextField
                                    onChange={this.handleChange('email')}
                                    label="E-Mail"
                                    type="email"
                                    id="email"
                                    required
                                    value={this.state.email}
                                    fullWidth
                                    className="push-down"
                                    disabled={this.state.step1complete || this.state.processing}
                                />
                                <TextField
                                    disabled={this.state.step1complete || this.state.processing}
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
                                    className="push-down"
                                />
                                <Button 
                                    disabled={this.state.step1complete || this.state.processing}
                                    className="push-down" 
                                    fullWidth 
                                    variant="raised" 
                                    color="secondary">
                                    <FileUpload style={{marginRight:'10px'}}/>
                                    Upload Profile Picture *
                                </Button>
                                <Button 
                                    fullWidth 
                                    variant="raised" 
                                    color="primary" 
                                    className="push-down"
                                    disabled={this.state.step1complete || this.state.processing}
                                >
                                    <Next style={{marginRight:'10px'}} />
                                    Continue
                                </Button>
                            </CardContent>
                        </Card>
                        {
                            this.state.step1complete ? 
                            <div>
                                {
                                    this.state.userType === 'customer' ?
                                    <Card className="push-down" data-aos="slide-up">
                                        <CardHeader title="Extras" subheader="Almost done...just a few more details"/>
                                        <CardContent>
                                            <FormControl fullWidth>
                                                <InputLabel htmlFor="customer-type">Customer Type</InputLabel>
                                                <Select 
                                                    disabled={this.state.step2complete || this.state.processing}
                                                    value={this.state.customerVariant}
                                                    onChange={this.handleChange('customerVariant')}
                                                    inputProps={{
                                                        id: 'customer-type',
                                                    }}
                                                >
                                                    <MenuItem value=''>None</MenuItem>
                                                    <MenuItem value='customer'>Visitor</MenuItem>
                                                    <MenuItem value='cook'>Registered (Needs Verification)</MenuItem>
                                                </Select>
                                            </FormControl>
                                            <Button 
                                                disabled={this.state.step2complete || this.state.processing}
                                                className="push-down" 
                                                fullWidth 
                                                variant="raised" 
                                                color="secondary">
                                                <FileUpload style={{marginRight:'10px'}}/>
                                                Upload ID
                                            </Button>
                                        </CardContent>
                                    </Card>:
                                    null
                                }
                            </div>:
                            null
                        }
                        {
                            this.state.step1complete && this.state.step2complete ?
                            <Button 
                                data-aos="slide-up"
                                disabled={this.state.processing}
                                variant="raised" 
                                className="push-down" 
                                color="primary" 
                                fullWidth>
                                <Done style={{marginRight:'10px'}}/>
                                Complete Sign-Up
                            </Button>:
                            null
                        }
                    </div>
                }
            </div>
        );
    }
}