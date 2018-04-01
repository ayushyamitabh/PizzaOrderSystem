import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import 'typeface-roboto';
import * as firebase from 'firebase';
import AOS from 'aos';
import "../node_modules/aos/dist/aos.css";
AOS.init();
var config = {
    apiKey: "AIzaSyCKGQ8GCl0H3AD4BMpHP_VysNJJxW--np8",
    authDomain: "pos-tagmhaxt.firebaseapp.com",
    databaseURL: "https://pos-tagmhaxt.firebaseio.com",
    projectId: "pos-tagmhaxt",
    storageBucket: "pos-tagmhaxt.appspot.com",
    messagingSenderId: "455987530569"
};
firebase.initializeApp(config);
ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
