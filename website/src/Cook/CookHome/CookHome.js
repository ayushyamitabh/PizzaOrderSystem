import React, {Component} from 'react';
import './CookHome.css';
import * as firebase from 'firebase';
import {AppBar,
        Typography,
        Toolbar,
        Button} from 'material-ui';
import { Link } from 'react-router-dom';

class CookHome extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cook: {
                cookUID: '',
                name: '',
                shopUID: '',
                pizzaID: '',
                averageRating: '',
                DroppedPizzas: '',
                WarnedCount: '',
                warned: false,
            }
        };
    }

    render() {
        return (
            <div>
                <AppBar >
                        <Toolbar>
                            <Typography variant="title" color="inherit">
                                <Button color ="secondary" variant = "raised"
                                    component={Link} to="/" onClick={()=>{firebase.auth().signOut()}}> Logout
                                </Button>
                            </Typography>
                        </Toolbar>
                </AppBar>
            </div>
        );
    }
};

export default CookHome;
