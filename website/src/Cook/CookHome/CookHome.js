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
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import blue from 'material-ui/colors/blue';
import Subheader from 'material-ui/List/ListSubheader';
import Logout from 'material-ui-icons/ExitToApp';
import Pizza from 'material-ui-icons/LocalPizza';
import Store from 'material-ui-icons/Store';
import FileUpload from 'material-ui-icons/CloudUpload';


class CookHome extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cook: {
                cookUID: '',
                cookName: '',
                shopName: '',
                profilePicture: '',
                averageRating: '',
                DroppedPizzas: '',
                WarnedCount: '',
                warned: false,
            },
            pizzaImg: '',
            pizza: '',
            cost: '',
            pizzas: [],
            pizzaID: [],
            shopUID: '',
            notifyMsg: '',
            notify: false

        };
        this.fireBaseListener = null;
        this.handlePizzaInput = this.handlePizzaInput.bind(this);
        this.handleCostInput = this.handleCostInput.bind(this);
        this.authListener = this.authListener.bind(this);
        this.createPizzaType = this.createPizzaType.bind(this);
        this.handleFileSelect = this.handleFileSelect.bind(this);
        this.retrievePizza = this.retrievePizza.bind(this);
        this.addPizzaToShop = this.addPizzaToShop.bind(this);
    }

    handlePizzaInput(event) {
        this.setState({
            pizza: event.target.value
        });
    }

    handleCostInput(event) {
        const number = /^\d*\.?\d{0,2}$/;
        if(event.target.value === '' || number.test(event.target.value)) {
            this.setState({
                cost: event.target.value
            });
        }
    }

    handleFileSelect(event) {
        this.setState({
            pizzaImg: event.target.files[0],
            notify: true,
            notifyMsg:  event.target.files[0].name + " successfully uploaded!"
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
            firebase.storage().ref().child('Pizzas/' + pizzaPicture.name).put(pizzaPicture).then(() => {
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
                            cost: Number(this.state.cost),
                            image: url,
                            averageRating: 0,
                            totalOrders: 0
                        }).then(()=> {
                            firebase.database().ref('Pizzas/total').set(current+1);
                            this.setState({
                                pizza: '',
                                cost: ''
                            })
                        });
                    });
                    this.setState({
                        notify: true,
                        notifyMsg: "Your 🍕 type has been added to your list of 🍕 toppings!"
                    })
                });
            })
        }
    }

    retrievePizza() {
        const previousPizza = this.state.pizzas;
        const previousPizzaID = this.state.pizzaID;
        firebase.database().ref().child(`Pizzas/`).on("child_added", (snapshot) => {
            var cookID = snapshot.child(`cook/`).val();
            if(cookID === this.state.cook.cookUID) {
                previousPizza.push({
                    name: snapshot.val().name,
                    image: snapshot.val().image,
                    cost: snapshot.val().cost,
                    averageRating: snapshot.val().averageRating
                })
                previousPizzaID.push(snapshot.key);
                this.setState({
                    pizzas: previousPizza,
                    pizzaID: previousPizzaID
                })
            }
        });
    }
    addPizzaToShop() {
        firebase.database().ref().child(`Users/`).on('value',(snap) => {
            var shopID = snap.child(`${this.state.cook.cookUID}/shop`).val();
            this.setState({
                shopUID: shopID
            })
            firebase.database().ref(`Shops/${this.state.shopUID}/pizzas`).once('value', (snap) =>{
                if(snap.val()) {
                    var exists = snap.val();
                      for(var i = 0; i < this.state.pizzaID.length; i++){
                          var found = 0;
                          for(var j = 0; j < exists.length; j++){
                              if(exists[j] === this.state.pizzaID[i]){
                                  found = 1;
                                  break;
                              }
                          }
                          this.setState({
                              notify: true,
                              notifyMsg: "Opps, apparently your 🍕 toppings are already in the shop."
                          })
                          if(found === 0){
                              exists.push(this.state.pizzaID[i]);
                              var shopPizzaRef = firebase.database().ref(`Shops/${this.state.shopUID}/pizzas`);
                              shopPizzaRef.set(exists);
                              this.setState({
                                  notify: true,
                                  notifyMsg: "Your 🍕 toppings has been added to the shop!"
                            })
                          }
                      }
                  }
                  else {
                      firebase.database().ref(`Shops/${this.state.shopUID}/pizzas`).set(this.state.pizzaID);
                      this.setState({
                          notify: true,
                          notifyMsg: "Your 🍕 toppings has been added to the shop!"
                    })
                  }
                  this.setState({
                      pizzaID: []
                })
            })
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
            this.retrievePizza();
            firebase.database().ref(`Users/${this.state.cook.cookUID}/shop`).on('value',(snapshot) => {
                var shopID = snapshot.val();
                firebase.database().ref(`Shops/${shopID}/name`).once('value', (snap) =>{
                    this.setState({
                        shopName: snap.val()
                    })
                })
            });
        });
    }

    componentWillUnmount() {
        this.fireBaseListener && this.fireBaseListener();
        this.authListener = undefined;
    }

    render() {
        return (
            <div style={{padding:'50px 200px'}}>
                {/*=============WELCOME USER HEADER=============*/}
                <div className="cook-header">
                    <Avatar className="cook-avatar"
                        src={this.state.cook.profilePicture} />
                        <Typography variant="display2" style={{flex:1}}>
                            Welcome, {this.state.cook.cookName}
                            <Button style={{float:'right'}} onClick={()=>{firebase.auth().signOut();}}>
                            <Logout style ={{marginRight: '5px'}}/> Signout
                            </Button>
                        </Typography>
                </div>
                <Divider />
                <Typography variant="subheading" style={{margin: '10px'}}>
                    {/*=============PIZZA CREATION SECTION=============*/}
                    <div className="Pizza-creation-content">
                        <Card style={{marginTop: '10px'}} data-aos="slide-up">
                            <CardHeader title="Create Your Pizzas"
                                subheader="Enter the pizza topping, price and picture to add to your list of pizza toppings"/>
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
                                <input id="pizzaPicture" type="file" accept="image/*"
                                    onChange={this.handleFileSelect} style={{display:'none'}} />
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
                                <Pizza style={{marginRight: '10px'}} />
                                Add Pizza
                                </Button>
                            </CardContent>
                            </Card>
                    </div>
                </Typography>
                <Divider />
                    {/*=============VIEW PIZZA TOPPINGS AND DETAILS=============*/}
                    <div data-aos ="fade-up" data-aos-duration="1500" style={{marginTop: '10px', display: 'flex',
                        flexWrap: 'wrap', justifyContent: 'flex-start', overflow: 'hidden', backgroundColor: '#FFFFFF'}}>
                        <Subheader style={{fontSize: "20px", color: 'black', textIndent: '420px'}}>
                            Your Pizza Toppings
                        </Subheader>
                            <GridList style={{flexWrap: 'nowrap'}} cols={2.5} data-aos ="fade-up">
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
                            <MuiThemeProvider theme ={createMuiTheme ({palette: {primary: blue}})}>
                                <Button
                                    onClick={this.addPizzaToShop}
                                    fullWidth
                                    variant="raised"
                                    color="primary"
                                >
                                <Store style={{marginRight: '10px'}} />
                                Submit Pizza to {this.state.shopName}
                            </Button>
                            </MuiThemeProvider>
                        </div>
                        {/*=============NOTIFICATION SNACKBAR=============*/}
                        <Snackbar
                            onClose={() => {this.setState({notify:false, notifyMsg: ''})}}
                            open={this.state.notify}
                            message={this.state.notifyMsg}
                            autoHideDuration={2000}
                            />
                </div>
        );
    }
};

export default CookHome;
