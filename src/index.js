import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import 'typeface-roboto';
import * as firebase from 'firebase';
var config = {
    apiKey: "AIzaSyASMSS6bIKWx14lFB23k0WCJr4_Ek06vAI",
    authDomain: "pos-tmag.firebaseapp.com",
    databaseURL: "https://pos-tmag.firebaseio.com",
    projectId: "pos-tmag",
    storageBucket: "pos-tmag.appspot.com",
    messagingSenderId: "626586569919"
};
firebase.initializeApp(config);
ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
