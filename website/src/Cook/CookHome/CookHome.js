import React, {Component} from 'react';
import './CookHome.css';
import * as firebase from 'firebase';
import {Avatar,
        AppBar,
        Typography,
        Toolbar,
        Divider,
        Button} from 'material-ui';
import Logout from 'material-ui-icons/ExitToApp'

class CookHome extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cook: {
                cookUID: '',
                cookName: null,
                profilePicture: null,
                shopUID: '',
                pizzaID: '',
                averageRating: '',
                DroppedPizzas: '',
                WarnedCount: '',
                warned: false,
            },
            pizzas: []
        };
        this.fireBaseListener = null;
        this.authListener = this.authListener.bind(this);

    }

    componentDidMount() {
        this.authListener();
    }

    authListener() {
        this.fireBaseListener = firebase.auth().onAuthStateChanged((cook) => {
            if(cook) {
                console.log(cook);
                this.setState({
                    cook: {
                        cookName: cook.displayName,
                        profilePicture: cook.photoURL
                    }
                })
            }
        });
        const rootRef = firebase.database().ref().child('Pizzas');
        var pizzaRef = rootRef.child('pizzaID3').set({
            name: 'Pepperoni Pizza',
            cost: 12.99
        });
        pizzaRef = rootRef.child('pizzaID4').set({
            name:'Bacon Pizza',
            cost: 14.99
        });
        pizzaRef = rootRef.child('pizzaID5').set({
            name:'Mushrooms and Onions Pizza',
            cost: 10.99
        });
        pizzaRef = rootRef.child('pizzaID6').set({
            name:'Sausage Pizza',
            cost: 13.99
        });
        pizzaRef = rootRef.child('pizzaID7').set({
            name:'Black Olives Pizza',
            cost: 10.99
        });
    }

    componentWillUnmount() {
        this.fireBaseListener && this.fireBaseListener();
        this.authListener = undefined;
    }

    render() {
        return (
            <div style={{padding:'50px 100px'}}>
                <div className="cook-header">
                    <Avatar className="cook-avatar"
                        src={this.state.cook.profilePicture} />
                        <Typography variant="display2" style={{flex:1}}>
                            Welcome, {this.state.cook.cookName}
                            <Button style={{float:'right'}} onClick={()=>{firebase.auth().signOut()}}>
                            <Logout style ={{marginRight: '5px'}}/> Logout
                            </Button>
                        </Typography>
                </div>
                <Divider />
                <div>


                </div>
            </div>
        );
    }
};

export default CookHome;
