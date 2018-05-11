import React, {Component} from 'react';
import './CookHome.css';
import * as firebase from 'firebase';
import {
        Typography,
        
        Button} from 'material-ui';


class CookHome extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cook: {
                cookuid: '',
                name: '',
                shopUID: '',
                pizzaID: '',
                averageRating: '',
                DroppedPizzas: '',
                WarnedCount: '',
                warned: false,
            },

            user: {
                displayName:''
            }
        };
        this.authListener = this.authListener.bind(this);
    }

    componentDidMount() {
        this.authListener();
    }

    authListener() {
        this.fireBaseListener = firebase.auth().onAuthStateChanged((user) => {
            if(user) {
                this.setState({
                    user: {
                        displayName: user.displayName
                    }
                })
            }
        });
    }

    render() {
        return (
            <div>
                <Typography variant="display2">
                    Welcome, {this.state.user.displayName}
                </Typography>
                    <Typography variant="title" color="inherit">
                        <Button color ="secondary" variant = "raised" style={{float: 'right'}}
                                onClick={()=>{firebase.auth().signOut()}}> Logout
                        </Button>
                    </Typography>
            </div>
        );
    }
};

export default CookHome;
