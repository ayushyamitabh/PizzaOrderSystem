import React, {Component} from 'react';
import {Avatar, Button, Typography} from 'material-ui';
import {Link} from 'react-router-dom';
import Back from 'material-ui-icons/Backspace';
import './NotFound.css';

export default class NotFound extends Component{
    render() {
        return(
            <div className="not-found-page">
                <Avatar className="question-mark">?</Avatar>
                <Typography variant="display3" className="page-not-found">
                    Page Not Found
                </Typography>
                <Typography variant="subheading" className="page-not-found">
                    Hmm.. that doesn't seem like a real page.
                </Typography>
                <Button component={Link} to="/" style={{marginTop:'20px'}}>
                    <Back style={{marginRight:'20px'}} />
                    Go Back Home
                </Button>
            </div>
        );
    }
}