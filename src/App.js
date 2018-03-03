import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {
    AppBar,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Typography
} from 'material-ui';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loginDialog: false
        };
    }
    render() {
        return (
            <div>
                <Dialog open={this.state.loginDialog} onClose={() => { this.setState({ loginDialog: false }); }}>
                    <DialogTitle>Login</DialogTitle>
                </Dialog>
                <AppBar position="static" color="primary" className="title-bar">
                    <Typography variant="title" className="title">Pizza Ordering</Typography>
                    <Button color="inherit" onClick={() => { this.setState({ loginDialog: true }) }}>Login</Button>
                </AppBar>
            </div>
        );
    }
}

export default App;
