import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './app/App.js';
import Test from "./pages/users/users";
import { BrowserRouter, Redirect, Route, Router, Switch } from "react-router-dom";
import createHistory from "history/createBrowserHistory"
import { TimePicker } from 'antd'
import registerServiceWorker from './registerServiceWorker';
import history from "./utilities/history"

// this takes care of tracking our browser history for redirecting and pathing
const app = (
    <Router history={history}>
        <Route path="/:currentPage?" component={App}/>
    </Router>
);

ReactDOM.render(app, document.getElementById('root'));
registerServiceWorker();
