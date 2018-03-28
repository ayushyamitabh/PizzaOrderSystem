import React, { Component } from 'react';
import logo from './logo.svg';
import './Home.css';
import {
    AppBar,
    Button,
    IconButton,
    Typography
} from 'material-ui';
import LoginDialog from './LoginDialog';
import AccountIcon from 'material-ui-icons/AccountCircle';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loginDialog: false
        };
    }
    render() {
        return (
            <div style={{height:'100%'}}>
                <LoginDialog openUp={this.state.loginDialog} closeDialog={()=>{this.setState({loginDialog:false})}}/>
                <AppBar className="title-bar">
                    <Typography variant="title" className="title">WEIRDOUGHS</Typography>
                    <IconButton color="inherit" onClick={()=>{this.setState({ loginDialog: true })}}><AccountIcon /></IconButton>
                </AppBar>
            </div>
        );
    }
}

export default Home;