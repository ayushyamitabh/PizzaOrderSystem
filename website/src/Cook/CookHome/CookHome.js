import React, {Component} from 'react';
import './CookHome.css';
import * as firebase from 'firebase';
import {Avatar,
        Typography,
        Card,
        CardContent,
        CardHeader,
        Divider,
        TextField,
        Button} from 'material-ui';
import Logout from 'material-ui-icons/ExitToApp'
import GridList, {GridListTile, GridListTileBar} from 'material-ui/GridList';
import Next from 'material-ui-icons/PlayCircleFilled';


class CookHome extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cook: {
                cookUID: '',
                cookName: '',
                profilePicture: null,
                shopUID: '',
                pizzaID: '',
                averageRating: '',
                DroppedPizzas: '',
                WarnedCount: '',
                warned: false,
            },
            pizza: '',
            cost: '',
            pizzas: []

        };
        this.fireBaseListener = null;
        this.handlePizzaInput = this.handlePizzaInput.bind(this);
        this.handleCostInput = this.handleCostInput.bind(this);
        this.authListener = this.authListener.bind(this);
        this.createPizzaType = this.createPizzaType.bind(this);

    }

    handlePizzaInput(event) {
        this.setState({
            pizza: event.target.value
        });
    }

    handleCostInput(event) {
        const number = /^[0-9\.\-\/]+$/;
        if(event.target.value == '' || number.test(event.target.value)) {
            this.setState({
                cost: event.target.value
            });
        }
    }


    createPizzaType() {
        const pizzasRef = firebase.database().ref().child('Pizzas');
        pizzasRef.push().set({
            cook: this.state.cook.cookUID,
            name: this.state.pizza,
            cost: this.state.cost,
            averageRating: 0
        });
        this.setState({
            pizza: '',
            cost: ''
        })
    }

    componentDidMount() {
        this.authListener();
    }

    authListener() {
        this.fireBaseListener = firebase.auth().onAuthStateChanged((cook) => {
            if(cook) {
                this.setState({
                    cook: {
                        cookName: cook.displayName,
                        profilePicture: cook.photoURL,
                        cookUID: cook.uid
                    }
                })
            }
        });
    }

    componentWillUnmount() {
        this.fireBaseListener && this.fireBaseListener();
        this.authListener = undefined;
    }

    render() {
        return (
            <div style={{padding:'50px 200px'}}>
                <div className="cook-header">
                    <Avatar className="cook-avatar"
                        src={this.state.cook.profilePicture} />
                        <Typography variant="display2" style={{flex:1}}>
                            Welcome, {this.state.cook.cookName}
                            <Button style={{float:'right'}} onClick={()=>{firebase.auth().signOut()}}>
                            <Logout style ={{marginRight: '5px'}}/> Signout
                            </Button>
                        </Typography>
                </div>
                <Divider />
                <Typography variant="subheading" style={{margin: '10px'}}>
                    <div className="Pizza-creation-content">
                        <Card style={{marginTop: '10px'}} data-aos="slide-up">
                            <CardHeader title="Pizzas" subheader="Enter the pizza to add into the menu"/>
                            <CardContent>
                                <TextField
                                    onChange={this.handlePizzaInput}
                                    id="pizza"
                                    label="Pizza Type"
                                    required
                                    value={this.state.pizza}
                                    vullwidth
                                    className="push-down"
                                />
                                <TextField
                                    onChange={this.handleCostInput}
                                    id="cost"
                                    label="Cost"
                                    required
                                    value={this.state.cost}
                                    fullwidth
                                    className="push-down"
                                />
                                <Button
                                    onClick={this.createPizzaType}
                                    fullwidth
                                    variant="raised"
                                    color="primary"
                                    className="push-down"
                                >
                                <Next style={{marginRight: '10px'}} />
                                Add to Menu
                                </Button>
                            </CardContent>
                            </Card>
                    </div>
                </Typography>

            </div>
        );
    }
};

export default CookHome;
