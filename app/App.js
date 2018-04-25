import React, {Component} from 'react';
import { StackNavigator, SwitchNavigator } from 'react-navigation';
import { COLOR, ThemeProvider } from 'react-native-material-ui';
import Signin from './Components/Signin.js';
import Signup from './Components/Signup.js';
import AddShop from './Components/AddShop.js';
import UserHome from './Components/UserHome.js';
import AuthLoading from './Components/AuthLoading.js';

const UserStack = StackNavigator({
  Home: UserHome
});

const SigninStack = StackNavigator({
  SignIn: {
    screen: Signin,
    navigationOptions: {
      title: `Weirdoughs | Sign In`,
      headerStyle: {
        backgroundColor: '#c13f3f'
      },
      headerTintColor: '#ffffff'
    }
  },
  SignUp: {
    screen: Signup,
    navigationOptions: {
      title: `Weirdoughs | Sign Up`
    }
  },
  AddShop: AddShop
},
{
  initialRouteName: 'SignIn'
})

const Navigation = SwitchNavigator(
  {
    AuthLoading: AuthLoading,
    Auth: SigninStack,
    App: UserStack
  },{
    initialRouteName: 'AuthLoading'
  }
);

const uiTheme = {
  palette: {
      primaryColor: COLOR.red500,
      accentColor: COLOR.blue500
  },
  toolbar: {
      container: {
          height: 50,
      },
  },
};

export default class App extends Component {
  constructor(props){
    super(props);
  }
  render(){
    return(
      <ThemeProvider uiTheme={uiTheme}>
      <Navigation />
      </ThemeProvider>
    );
  }
}