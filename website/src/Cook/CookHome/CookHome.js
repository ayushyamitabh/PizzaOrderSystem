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
        Snackbar,
        Button} from 'material-ui';
import GridList, { GridListTile, GridListTileBar } from 'material-ui/GridList';
import Subheader from 'material-ui/List/ListSubheader';
import Logout from 'material-ui-icons/ExitToApp';
import Next from 'material-ui-icons/PlayCircleFilled';
import FileUpload from 'material-ui-icons/CloudUpload';


class CookHome extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cook: {
                cookUID: '',
                cookName: '',
                profilePicture: '',
                shopUID: '',
                pizzaID: '',
                averageRating: '',
                DroppedPizzas: '',
                WarnedCount: '',
                warned: false,
            },
            pizzaImg: '',
            pizza: '',
            cost: '',
            pizzas: [],
            notifyMsg: '',
            notify: false,
            processing: false

        };
        this.fireBaseListener = null;
        this.handlePizzaInput = this.handlePizzaInput.bind(this);
        this.handleCostInput = this.handleCostInput.bind(this);
        this.authListener = this.authListener.bind(this);
        this.createPizzaType = this.createPizzaType.bind(this);
        this.handleFileSelect = this.handleFileSelect.bind(this);
        this.retrievePizza = this.retrievePizza.bind(this);
    }

    handlePizzaInput(event) {
        this.setState({
            pizza: event.target.value
        });
    }

    handleCostInput(event) {
        const number = /^[0-9\.\-\/]+$/;
        if(event.target.value === '' || number.test(event.target.value)) {
            this.setState({
                cost: event.target.value
            });
        }
    }

    handleFileSelect(event) {
        this.setState({
            pizzaImg: event.target.files[0]
        })
    }

    createPizzaType() {
        if (this.state.pizza === '' && this.state.cost === '' && this.state.pizzaImg === '') {
            this.setState({
                notify: true,
                notifyMsg: "Please enter the 🍕 topping, price and upload a picture of the 🍕."
            })
        }
        else if (this.state.cost === '') {
            this.setState({
                notify: true,
                notifyMsg: "You didn't set the price of the 🍕 yet."
            })
        }
        else if (this.state.pizza === '') {
            this.setState({
                notify: true,
                notifyMsg: "You didn't enter in the 🍕 topping yet."
            })
        }
        else if(this.state.pizzaImg === '') {
            this.setState({
                notify: true,
                notifyMsg: "You didn't upload a picture of your 🍕 topping yet."
            })
        }
        else {
            var pizzaPicture = document.getElementById("pizzaPicture").files[0];
            firebase.storage().ref().child('Pizzas/' + pizzaPicture.name).put(pizzaPicture).then(() =>{
                firebase.storage().ref().child('Pizzas/' + pizzaPicture.name).getDownloadURL().then((url) => {
                    this.setState({
                        pizzaImg: url
                    })
                    firebase.database().ref().child('Pizzas/total').once('value').then((snap)=> {
                        var current = snap.val();
                        var newID ='pizzaID' + current;
                        firebase.database().ref(`Pizzas/${newID}`).set({
                            cook: this.state.cook.cookUID,
                            name: this.state.pizza,
                            cost: this.state.cost,
                            image: url,
                            averageRating: 0,
                            totalOrders: 0
                        }).then(()=>{
                            firebase.database().ref('Pizzas/total').set(current+1);
                            this.setState({
                                pizza: '',
                                cost: ''
                            })
                        });
                    });
                    this.setState({
                        notify: true,
                        notifyMsg: "Your 🍕 type has been added to the menu!"
                    })
                });
            })
        }

    }

    retrievePizza() {
        const previousPizza = this.state.pizzas;
        firebase.database().ref().child('Pizzas').on("child_added", (snapshot) =>{
            if(snapshot.val().name === undefined)
            {
                return false;
            }
            else {
                previousPizza.push({
                    name: snapshot.val().name,
                    image: snapshot.val().image,
                    cost: snapshot.val().cost,
                    averageRating: snapshot.val().averageRating
                })
                this.setState({
                    pizzas: previousPizza
                })
            }
        });
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
        this.retrievePizza();
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
                            <CardHeader title="Create Your Pizzas" subheader="Enter the pizza topping and price to add to the menu"/>
                            <CardContent>
                                <TextField
                                    onChange={this.handlePizzaInput}
                                    id="pizza"
                                    label="Pizza Topping"
                                    required
                                    value={this.state.pizza}
                                    fullWidth
                                    className="push-down"
                                />
                                <TextField
                                    onChange={this.handleCostInput}
                                    id="price"
                                    label="Price"
                                    required
                                    value={this.state.cost}
                                    fullWidth
                                    className="push-down"
                                />
                                <input id="pizzaPicture" type="file" accept="image/*" onChange={this.handleFileSelect} style={{display:'none'}} />
                                <Button
                                    onClick={()=>{document.getElementById("pizzaPicture").click()}}
                                    fullWidth
                                    variant="raised"
                                    className="push-down"
                                    color="secondary" >
                                    <FileUpload style={{marginRight:'10px'}} />
                                    Upload Pizza Picture
                                </Button>
                                <Button
                                    onClick={this.createPizzaType}
                                    fullWidth
                                    variant="raised"
                                    color="primary"
                                >
                                <Next style={{marginRight: '10px'}} />
                                Add to Menu
                                </Button>
                            </CardContent>
                            </Card>
                    </div>
                </Typography>
                <Divider />
                    <div style={{marginTop: '10px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', overflow: 'hidden', backgroundColor: '#FFFFFF'}}>
                        <Subheader style={{fontSize: "20px", color: 'black'}}>Pizza Toppings</Subheader>
                            <GridList style={{flexWrap: 'nowrap'}} cols={3} cellHeight={180} data-aos ="fade-up">
                                {
                                    this.state.pizzas.map((data,index) =>{
                                        return (
                                        <GridListTile key={index}>
                                            <img src={data.image} alt={data.name} />
                                            <GridListTileBar
                                                title={data.name}
                                                subtitle={`${data.averageRating} ⭐ | $${data.cost}`}
                                                />
                                        </GridListTile>
                                    );
                                })
                            }
                        </GridList>
                    </div>
                    <Snackbar
                    onClose={() => {this.setState({notify:false, notifyMsg: ''})}}
                    open={this.state.notify}
                    message={this.state.notifyMsg}
                    autoHideDuration={2000}
                />
            {console.log(this.state.pizzas)}
            </div>
        );
    }
};

export default CookHome;
