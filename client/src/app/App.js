import React, {Component} from 'react';
import './App.css';
import {UsersPage} from '../pages/users/users.js'
import {SignInPage} from '../pages/sign_in/sign_in'
import {RemittancePage} from '../pages/remittances/remittances'
import {NavBar} from "../components/navbar/navbar"
import {InventoryPage} from '../pages/inventory/inventory'
import {BrowserRouter, Redirect, Route, Router, Switch, withRouter} from "react-router-dom";
import 'antd/dist/antd.css';
import '../utilities/colorsFonts.css'
import {getPageFromPath, SIGN_IN_PAGE, REMITTANCE_PAGE} from "./paths";
import {message} from 'antd'
import {postData} from "../network_requests/general";
import {PAGES} from "./paths"
import history from '../utilities/history'
// const PAGES = [<UsersPage />, <RemittancePage />, <InventoryPage/>];


// Get the current location.
export default class App extends Component {
    constructor(props) {
        super(props);
        // Don't call this.setState() here!
        //set user for any children page of App (which is everything)
        this.state = {
            user: localStorage.user,
        }
    }

    componentWillMount() {
        this.setState({
            user: localStorage.user
        });
    }

    // componentDidMount is a part of react component lifecycle it is immediately called after render()
    componentDidMount() {
        this.handleChange();
        // always set user when going to any page
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
            .then(({user, token, error}) => {
                if (error) {
                    message.error(error)
                } else {
                    localStorage.user = JSON.stringify(user);
                    localStorage.token = JSON.stringify(token);
                    this.setState({
                        user: localStorage.user,
                    });
                }
            })
            .catch(error => message(error));
    };

    // change pages on navbar item click

    handleChange = () => {
        //always update user state
        const {match} = this.props;
        const currentPath = match.params.currentPage;
        //be careful not to use .setState here it will cause an infinite loop
        this.state.user = localStorage.user;


        //check if our current path is '/sign-in'
        const userIsSigningIn = currentPath === SIGN_IN_PAGE.path;

        if (!this.state.user && !userIsSigningIn) {
            // check if user is accessing other pages without signing in
            // history comes with withRouter() check end of this file
            console.log(this.state.user);
            console.log("enters here");
            history.replace('/sign-in');
            return;
        }

        if (this.state.user && userIsSigningIn) {
            history.replace('/remittances');
            return;
        }
        console.log(currentPath === undefined);
        if (this.state.user && currentPath === undefined || this.state.user && currentPath === '/') {
            //if there is a user and hes trying to go to localhost:3000 or localhost:3000/
            history.replace('/remittances');
            return;
        }

        // We want to ensure the next conditions have a non-null user
    };

    render() {
        //this is our initial page
        const user = localStorage.user;
        const {match, history} = this.props;
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
                {user && currentPath !== "sign-in" &&
                <NavBar/>
                }
            </div>
        );
    }
}


