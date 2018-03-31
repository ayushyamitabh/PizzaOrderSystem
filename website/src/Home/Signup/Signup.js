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
import { Link } from 'react-router-dom';
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
            idPic: '',
            notify: false,
            notifyMsg: '',
            shopList: '',
            selectedShop: ''
        };
        this.handleChange = this.handleChange.bind(this);
        this.createUser = this.createUser.bind(this);
        this.finalizeUser = this.finalizeUser.bind(this);
        this.finalizeUserUpdate = this.finalizeUserUpdate.bind(this);
        this.validate = this.validate.bind(this);
    }
    componentDidMount(){
        firebase.database().ref("Shops").once('value', (snap)=>{
            if (snap.val()){
                console.log(snap.val())
                this.setState({
                    shopList: snap.val()
                })
            }
        });
        this.props.history.listen((location, action)=>{
            if (location.pathname !== '/sign-up'){
                this.props.sanitizer();
            }
        });
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
            return true;
        }
        if (type === 'finalizeUser') {
            if (this.state.profilePic === null || this.state.profilePic === '') {
                return false;
            }
            if (this.state.userType === 'customer') {
                if (this.state.customerVariant === '' || this.state.customerVariant === null){
                    return false;
                }
            } else if (this.state.userType === 'cook' || this.state.userType === 'manager' || this.state.userType === 'deliverer') {
                if (this.state.selectedShop === '' || this.state.selectedShop === null){
                    return false;
                }
            }
            if (this.state.idPic === null || this.state.idPic === '') {
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
                        displayName: this.state.name
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
    finalizeUser(){
        if (this.state.customerVariant === '' && this.state.selectedShop === ''){
            this.setState({
                notify: true,
                notifyMsg: "Looks like you're missing stuff."
            })
        } else {
            if (document.getElementById("profilePictureInput").files[0]){
                var profilePictureFile = document.getElementById("profilePictureInput").files[0];
                if (document.getElementById("idPictureInput").files[0]){
                    var idPictureFile = document.getElementById("profilePictureInput").files[0];            
                    this.setState({
                        notify: true,
                        notifyMsg: "🔃 Profile Picture | ⏳ ID Verification Picture",
                        processing: true
                    })
                    var profileUploadTask = firebase.storage().ref(`Users/${firebase.auth().currentUser.uid}/profile.${profilePictureFile.name.split('.').pop()}`).put(profilePictureFile);
                    profileUploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, 
                        null, 
                        (err)=>{
                            this.setState({
                                notify: true,
                                notifyMsg: err.message,
                                processing: false
                            })
                        },
                        (resp)=>{
                            this.setState({
                                notify: true,
                                notifyMsg: "✅ Profile Picture | 🔃 ID Verification Picture",
                            });
                            var idUploadTask = firebase.storage().ref(`Users/${firebase.auth().currentUser.uid}/id_pic.${idPictureFile.name.split('.').pop()}`).put(idPictureFile);
                            idUploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
                            null,
                            (err)=>{
                                this.setState({
                                    notify: true,
                                    notifyMsg: err.message,
                                    processing: false
                                })
                            },
                            (resp)=>{
                                this.setState({
                                    notify: true,
                                    notifyMsg: "✅ Profile Picture | ✅ ID Verification Picture"
                                });
                                this.setState({
                                    notify: true,
                                    notifyMsg: 'Just finalizing things...almost there!'
                                })
                                firebase.storage().ref(`Users/${firebase.auth().currentUser.uid}/id_pic.${idPictureFile.name.split('.').pop()}`).getDownloadURL().then( (url)=>{
                                    this.setState({
                                        idPic: url
                                    })
                                    firebase.storage().ref(`Users/${firebase.auth().currentUser.uid}/profile.${profilePictureFile.name.split('.').pop()}`).getDownloadURL().then( (secondurl)=>{
                                        this.setState({
                                            profilePic: secondurl
                                        })
                                        this.finalizeUserUpdate();
                                    })
                                } )
                            })
                        })
                } else {
                    this.setState({
                        notify: true,
                        notifyMsg: "You're missing your ID verification picture 📸"
                    })
                }
            } else {
                this.setState({
                    notify: true,
                    notifyMsg: "You're missing your profile picture 📸"
                })
            }
        }
    }
    finalizeUserUpdate(){
        if (this.validate('finalizeUser') === true) {
            this.setState({
                processing: true
            })
            firebase.auth().currentUser.updateProfile({
                photoURL: this.state.profilePic
            }).then(null, (err)=>{
                this.setState({
                    notify: true,
                    notifyMsg: err.message,
                    processing: false
                })
                return;
            })
            var setData = {
                id_pic: this.state.idPic,
                type: this.state.userType
            };
            if (this.state.userType === 'customer'){
                setData.variant = this.state.customerVariant;
            } else {
                setData.shop = this.state.selectedShop;
            }
            console.log(setData);
            firebase.database().ref(`Users/${firebase.auth().currentUser.uid}/`).set(setData).then(()=>{
                    this.setState({
                        processing: false,
                        step2complete: true
                    })
                },
                (err)=>{
                this.setState({
                    notify: true,
                    notifyMsg: err.message,
                    processing: false
                })
                return;
            })
            if (this.state.userType !== 'customer') {
                this.setState({
                    processing: true,
                    step2complete: false
                })
                firebase.database().ref(`Shops/${this.state.selectedShop}/${this.state.userType}`).once('value', (snap)=>{
                    if(snap.val()) {
                        if (this.state.userType !== 'manager') {
                            var exists = snap.val();
                            exists.push(firebase.auth().currentUser.uid);
                            firebase.database().ref(`Shops/${this.state.selectedShop}/${this.state.userType}`).set(exists).then(null, (err)=>{
                                this.setState({
                                    notify: true,
                                    notifyMsg: err.message,
                                    processing: false
                                })
                                return;
                            })
                        }
                    } else {
                        if (this.state.userType !== 'manager') {
                            firebase.database().ref(`Shops/${this.state.selectedShop}/${this.state.userType}`).set([firebase.auth().currentUser.uid]).then(null, (err)=>{
                                this.setState({
                                    notify: true,
                                    notifyMsg: err.message,
                                    processing: false
                                })
                                return;
                            })
                        } else {
                            firebase.database().ref(`Shops/${this.state.selectedShop}/${this.state.userType}`).set(firebase.auth().currentUser.uid).then(null, (err)=>{
                                this.setState({
                                    notify: true,
                                    notifyMsg: err.message,
                                    processing: false
                                })
                                return;
                            })
                        }
                    }                    
                    this.setState({
                        processing: false,
                        step2complete: true
                    })
                })
            }
        } else {
            this.setState({
                notify: true,
                notifyMsg: "Looks like you're missing stuff.",
                processing: false
            })
        }
    }
    render() {
        return(
            <div className="signup-page">
                <input id="profilePictureInput" type="file" accept="image/*" style={{display:'none'}} />
                <input id="idPictureInput" type="file" accept="image/*" style={{display:'none'}} />
                
                <Snackbar 
                    onClose={()=>{this.setState({notify:false, notifyMsg: ''})}}
                    open={this.state.notify}
                    autoHideDuration={6000}
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
                                    onClick={()=>{this.createUser()}}
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
                            <Card className="push-down" data-aos="slide-up">
                                <CardHeader title="Extras" subheader="Almost done...just a few more details"/>
                                <CardContent>                                            
                                    <Button 
                                        onClick={()=>{document.getElementById("profilePictureInput").click()}}
                                        disabled={this.state.step2complete || this.state.processing}
                                        className="push-down" 
                                        fullWidth 
                                        variant="raised" 
                                        color="secondary">
                                        <FileUpload style={{marginRight:'10px'}}/>
                                        Upload Profile Picture *
                                    </Button>
                                    {
                                        this.state.userType === 'customer' ?
                                        <FormControl fullWidth className="push-down">
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
                                                <MenuItem value='visitor'>Visitor</MenuItem>
                                                <MenuItem value='registered'>Registered (Needs Verification)</MenuItem>
                                            </Select>
                                        </FormControl>:
                                        <FormControl fullWidth className="push-down">                                                
                                            <InputLabel htmlFor="selected-shop">Select Shop</InputLabel>
                                            <Select 
                                                disabled={this.state.step2complete || this.state.processing}
                                                value={this.state.selectedShop}
                                                onChange={this.handleChange('selectedShop')}
                                                inputProps={{
                                                    id: 'selected-shop',
                                                }}
                                            >
                                                <MenuItem value=''>None</MenuItem>
                                                {
                                                    Object.keys(this.state.shopList).map( (key, index)=>{
                                                        return(
                                                            <MenuItem key={`shop${index}`} value={key}>{this.state.shopList[key].name}</MenuItem>
                                                        );
                                                    })
                                                }
                                            </Select>
                                        </FormControl>
                                    }
                                    <Button 
                                        onClick={()=>{document.getElementById("idPictureInput").click()}}
                                        disabled={this.state.step2complete || this.state.processing}
                                        className="push-down" 
                                        fullWidth 
                                        variant="raised" 
                                        color="secondary">
                                        <FileUpload style={{marginRight:'10px'}}/>
                                        Upload ID Verification *
                                    </Button>
                                    <Button 
                                        onClick={()=>{this.finalizeUser()}}
                                        fullWidth 
                                        variant="raised" 
                                        color="primary" 
                                        className="push-down"
                                        disabled={this.state.step2complete || this.state.processing}
                                    >
                                        <Next style={{marginRight:'10px'}} />
                                        Continue
                                    </Button>
                                </CardContent>
                            </Card>:
                            null
                        }
                        {
                            this.state.step1complete && this.state.step2complete ?
                            <Button 
                                style={{marginBottom:'30px'}}
                                data-aos="slide-up"
                                disabled={this.state.processing}
                                variant="raised" 
                                className="push-down" 
                                color="primary" 
                                component={Link} to="/"
                                fullWidth>
                                <Done style={{marginRight:'10px'}}/>
                                Go Get 🍕
                            </Button>:
                            null
                        }
                    </div>
                }
            </div>
        );
    }
}