import React, {Component} from 'react';
import './App.css';
import {UsersPage} from '../pages/users/users.js'
import {SignInPage} from '../pages/sign_in/sign_in'
import {RemittancePage} from '../pages/remittances/remittances'
import {NavBar} from "../components/navbar/navbar"
import {InventoryPage} from '../pages/inventory/inventory'
import {BrowserRouter, Redirect, Route, Router, Switch} from "react-router-dom";
import 'antd/dist/antd.css';
import createHistory from "history/createBrowserHistory"
import '../utilities/colorsFonts.css'
import {getPageFromPath, SIGN_IN_PAGE,REMITTANCE_PAGE} from "./paths";
import {message} from 'antd'
import {postData} from "../network_requests/general";
import {PAGES} from "./paths"
// const PAGES = [<UsersPage />, <RemittancePage />, <InventoryPage/>];

const history = createHistory();
// Get the current location.
const location = history.location;
export default class App extends Component {
    state = {
        user: localStorage.user,
        currentPage: <SignInPage/>,
    };

    //componentDidMount is a part of react component lifecycle it is immediately called after render()
    componentDidMount() {
        this.handleStart();
    }

    componentDidUpdate() {
        //always check if theres a user
        console.log("something updated");
        this.handleStart();
    }

    renderRoutes = () => {
        const {user} = this.props;
        const pageToRoute = ({identifier, path, component}) => (
            <Route key={identifier} path={"/" + path} component={component}/>
        );

        // If we have a user, add the pages for the user type in the pages
        const pages = [
            ...PAGES
        ];
        return pages.map(pageToRoute);
    };

    // change pages on navbar item click

    handleStart = () => {
        // const currentPath = match.params.currentPage;
        const currentPath = history.location.pathname ;
        console.log(this.state.user);
        console.log(currentPath == SIGN_IN_PAGE.path);
        const userIsSigningIn = currentPath === "/" + SIGN_IN_PAGE.path;

        if (!userIsSigningIn && !this.state.user) {
            // Force them to sign in
            // The slash is to specify that it's the root
            console.log("entered here");
            history.replace("/"+ SIGN_IN_PAGE.path)
        }
        // We want to ensure the next conditions have a non-null user
    };
    attemptSignIn = (username, password) => {
        const data = {
            'username': username,
            'password': password
        };
        //equivalent to an ajax request (ajax needs jquery; fetch is built in)
        // this uses a shortcut from general.js from network_requests
        //.then = onSuccess .catch= onError
        postData('sign-in', data)
            .then(data => {
                localStorage.user = data.username;
                localStorage.token = data.token;
                this.state.user = localStorage.user;
            })
            .catch(error => message("invalid credentials"));
    };


    render() {
        //this is our initial page
        return (
            <BrowserRouter>
                <div className="page-container">
                    {/*define routes*/}
                    {/*routes are the pages, we no longer change states to change the page*/}
                    <Switch>
                        {this.renderRoutes()}
                    </Switch>
                    {/*render navbar if there is a user*/}
                    {this.state.user&&
                    <NavBar/>}
                    {!this.state.user &&
                    <SignInPage attemptSignIn={this.attemptSignIn}/>}
                </div>
            </BrowserRouter>
        );
    }
}


