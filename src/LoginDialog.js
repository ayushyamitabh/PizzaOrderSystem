import React, {Component} from 'react';
import {
    Button,    
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    TextField,
} from 'material-ui';
import Close from 'material-ui-icons/Clear';
import './LoginDialog.css';

class LoginDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: ''
        };
    }
    render () {
        return (
            <Dialog className="login-dialog" open={this.props.openUp} data-aos="fade">
                <DialogTitle className="login-dialog-title">
                    <span style={{flex:'1 1 auto'}}>Sign-In</span>
                    <IconButton onClick={this.props.closeDialog} ><Close /></IconButton>                    
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Login to your Weirdough account.
                    </DialogContentText>
                    <TextField 
                        style={{marginTop:'10px'}}
                        id="email"
                        autoFocus={true}
                        label="E-Mail"
                        type="email"
                        fullWidth
                        value={this.state.email}
                    />
                    <TextField 
                        style={{marginTop:'10px'}}
                        id="password"
                        label="Password"
                        type="password"
                        fullWidth
                        value={this.state.password}
                    />
                    <Button 
                        style={{marginTop:'10px'}}
                        variant="raised"
                        color="primary"
                        fullWidth>
                        SIGN IN
                    </Button>
                    <Button 
                        style={{marginTop:'10px'}}
                        variant="raised"
                        color="secondary"
                        fullWidth>
                        SIGN UP
                    </Button>
                </DialogContent>
            </Dialog>
        );
    }
}

export default LoginDialog;