import { AppRegistry } from 'react-native';
import * as firebase from 'firebase';
import App from './App';

var config = {
    apiKey: "AIzaSyCKGQ8GCl0H3AD4BMpHP_VysNJJxW--np8",
    authDomain: "pos-tagmhaxt.firebaseapp.com",
    databaseURL: "https://pos-tagmhaxt.firebaseio.com",
    projectId: "pos-tagmhaxt",
    storageBucket: "pos-tagmhaxt.appspot.com",
    messagingSenderId: "455987530569"
  };
  firebase.initializeApp(config);

AppRegistry.registerComponent('app', () => App);