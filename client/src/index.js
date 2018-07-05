import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './app/App.js';
import Test from "./pages/users/users";
import {BrowserRouter, Redirect, Route, Router, Switch} from "react-router-dom";
import createHistory from "history/createBrowserHistory"
import registerServiceWorker from './registerServiceWorker';
import history from './utilities/history'

// this takes care of tracking our browser history for redirecting and pathing
const app = (
        <BrowserRouter>
            <Route path="/:currentPage?" component={App} />
        </BrowserRouter>
);

ReactDOM.render(app, document.getElementById('root'));
registerServiceWorker();
