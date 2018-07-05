import React, {Component} from 'react';
import './App.css';
import {UsersPage} from '../pages/users/users.js'
import {SignInPage} from '../pages/sign_in/sign_in'
import {RemittancePage} from '../pages/remittances/remittances'
import {NavBar} from "../components/navbar/navbar"
import {InventoryPage} from '../pages/inventory/inventory'
import {BrowserRouter, Redirect, Route, Router, Switch, withRouter} from "react-router-dom";
import 'antd/dist/antd.css';
import createHistory from "history/createBrowserHistory"
import '../utilities/colorsFonts.css'
import {getPageFromPath, SIGN_IN_PAGE, REMITTANCE_PAGE} from "./paths";
import {message} from 'antd'
import {postData} from "../network_requests/general";
import {PAGES} from "./paths"
// const PAGES = [<UsersPage />, <RemittancePage />, <InventoryPage/>];


// Get the current location.
export class App extends Component {
    state = {};

    // componentDidMount is a part of react component lifecycle it is immediately called after render()
    componentDidMount() {
        this.handleChange();
    }

    componentDidUpdate() {
        // //always check if theres a user
        this.handleChange();
    }

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
                console.log(data.username);
                localStorage.user = data.username;
                console.log(localStorage.user);
                localStorage.token = data.token;
                this.changeUser(localStorage.user);
            })
            .catch(error => message("invalid credentials"));
    };
    // renderRoutes = () => {
    //     const pageToRoute = ({identifier, path, component}) => (
    //         <Route key={identifier} path={"/" + path} component={component}/>
    //     );
    //
    //     // If we have a user, add the pages for the user type in the pages
    //     const pages = [
    //         ...PAGES
    //     ];
    //     return pages.map(pageToRoute);
    // };

    // change pages on navbar item click

    handleChange = () => {
        const {user, match, history} = this.props;
        const currentPath = match.params.currentPage;
        const userIsSigningIn = currentPath === SIGN_IN_PAGE.path;

        console.log(this.state.user, currentPath, userIsSigningIn);
        if (!this.state.user && !userIsSigningIn) {
            // history comes with withRouter() check end of this file
            history.replace('/sign-in');
        }
        return;
        // We want to ensure the next conditions have a non-null user
    };
    changeUser = newUser => this.setState({
        user: newUser
    });

    render() {
        //this is our initial page
        const {user, match, history} = this.props;
        const currentPath = match.params.currentPage;

        return (
            <div className="page-container">
                {/*define routes*/}
                {/*routes are the pages, we no longer change states to change the page*/}
                <Switch>
                    {/*note: important to pass functions as lambdas */}
                    <Route path="/sign-in" render={() => <SignInPage attemptSignIn={this.attemptSignIn}/>}/>
                    <Route path="/inventory" render={() => <InventoryPage/>}/>
                    <Route path="/remittances" render={() => <RemittancePage/>}/>
                    <Route path="/inventory" render={() => <RemittancePage/>}/>
                    <Route path="/users" render={() => <UsersPage/>}/>
                </Switch>

                {/*render navbar if there is a user and path is not sign-in*/}
                {!this.state.user && currentPath !== "sign-in" &&
                <NavBar/>
                }
            </div>
        );
    }
}
export default withRouter(App)


