import React, {Component} from 'react';
import './App.css';
import {UsersPage} from '../pages/users/users.js'
import {SignInPage} from '../pages/sign_in/sign_in'
import {RemittancePage} from '../pages/remittances/remittances'
import {NavBar} from "../components/navbar/navbar"
import {InventoryPage} from '../pages/inventory/inventory'
import {BrowserRouter, Redirect, Route, Router, Switch} from "react-router-dom";
import 'antd/dist/antd.css';
import '../utilities/colorsFonts.css'
import {getPageFromPath} from "./paths";
import {postData} from "../network_requests/general";
import {PAGES} from "./paths"
// const PAGES = [<UsersPage />, <RemittancePage />, <InventoryPage/>];
export default class App extends Component {
    state = {
        user: localStorage.user,
        currentPage: <SignInPage/>,
    };


    //componentDidMount is a part of react component lifecycle it is immediately called after render()
    componentDidMount() {
        console.log(PAGES);
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
        console.log("this is called");
        if (this.state.user) {
            return <Redirect to={getPageFromPath('inventory')}/>;
        } else {
            return <Redirect to={getPageFromPath('inventory')}/>;
        }
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
                this.state.user = localStorage.user
            })
            .catch(error => console.log('error is', error));
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
                    {this.state.user &&
                    <NavBar/>}
                    {!this.state.user &&
                    <SignInPage attemptSignIn={this.attemptSignIn}/>}
                </div>
            </BrowserRouter>
        );
    }
}


