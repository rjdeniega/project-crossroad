//noinspection JSUnresolvedVariable
import React, { Component, Fragment } from "react";
import "./App.css";
import { UsersPage } from "../pages/users/users.js";
import { SignInPage } from "../pages/sign_in/sign_in";
import { RemittancePage } from "../pages/remittances/remittances";
import { MembersPage } from "../pages/members/members";
import { NavBar } from "../components/navbar/navbar";
import { InventoryPage } from "../pages/inventory/inventory";
import { MaintenancePage } from "../pages/maintenance/maintenance";
import { ReportsPage } from "../pages/reports/reports";
import { TicketsPage } from "../pages/tickets/tickets";
import { ProfilePage } from "../pages/profile/profile";
import { HistoryPage } from "../pages/driver_history/driver_history";

import {
    BrowserRouter,
    Redirect,
    Route,
    Router,
    Switch,
    withRouter
} from "react-router-dom";
import "antd/dist/antd.css";
import "../utilities/colorsFonts.css";
import { getPageFromPath, SIGN_IN_PAGE, REMITTANCE_PAGE } from "./paths";
import { message, TimePicker } from "antd";
import { postData } from "../network_requests/general";
import history from "../utilities/history";

// Get the current location.
export default class App extends Component {
    constructor(props) {
        super(props);
        // Don't call this.setState() here!
        //set user for any children page of App (which is everything)
        this.state = {
            user: localStorage.user,
            user_type: localStorage.user_type,
            user_staff: localStorage.user_staff,
            token: localStorage.token
        };
    }

    componentWillMount() {
        this.setState({
            token: localStorage.token,
            user: localStorage.user,
            user_type: localStorage.user_type,
            user_staff: localStorage.user_staff
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
            username: username,
            password: password
        };
        //equivalent to an ajax request (ajax needs jquery; fetch is built in)
        // this uses a shortcut from general.js from network_requests
        //.then = onSuccess .catch= onError
        postData("sign-in", data)
            .then(({ user, token, error, user_type, user_staff }) => {
                console.log(user, token, user_type, user_staff);
                if (error) {
                    message.error(error);
                }
                else {
                    localStorage.user = JSON.stringify(user);
                    localStorage.token = JSON.stringify(token);
                    localStorage.user_type = JSON.stringify(user_type);
                    localStorage.user_staff = JSON.stringify(user_staff);
                    this.setState({
                        user: localStorage.user,
                        token: localStorage.token,
                        user_type: localStorage.user_type,
                        user_staff: localStorage.user_staff
                    });
                }
            })
            .catch(error => message.error(error));
    };

    // change pages on navbar item click

    handleChange = () => {
        //always update user state
        const { match } = this.props;
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
            history.replace("/sign-in");
            return;
        }

        if (this.state.user && userIsSigningIn) {
            history.replace("/remittances");
            return;
        }
        if (
            (this.state.user && currentPath === undefined) ||
            (this.state.user && currentPath === "/")
        ) {
            //if there is a user and hes trying to go to localhost:3000 or localhost:3000/
            history.replace("/remittances");
            return;
        }

        // We want to ensure the next conditions have a non-null user
    };

    // renderRoutes = () => (
    //     <Fragment>
    //         {this.state.user_type === "system_admin" &&
    //         <Fragment>
    //             <Route path="/inventory" render={() => <InventoryPage/>}/>
    //             <Route path="/remittances" render={() => <RemittancePage/>}/>
    //             <Route path="/members" render={() => <RemittancePage/>}/>
    //             <Route path="/users" render={() => <UsersPage/>}/>
    //         </Fragment>
    //         }
    //         {this.state.user_type === "driver" &&
    //         <Fragment>
    //             <Route path="/remittances" render={() => <RemittancePage/>}/>
    //         </Fragment>
    //         }
    //         {this.state.user_type === "operations_manager" &&
    //         <Fragment>
    //             <Route path="/inventory" render={() => <InventoryPage/>}/>
    //             <Route path="/remittances" render={() => <RemittancePage/>}/>
    //             <Route path="/members" render={() => <RemittancePage/>}/>
    //         </Fragment>
    //         }
    //         {this.state.user_type === "supervisor" &&
    //         <Fragment>
    //             <Route path="/inventory" render={() => <InventoryPage/>}/>
    //             <Route path="/remittances" render={() => <RemittancePage/>}/>
    //         </Fragment>
    //         }
    //         {this.state.user_type === "clerk" &&
    //         <Fragment>
    //             <Route path="/inventory" render={() => <InventoryPage/>}/>
    //             <Route path="/remittances" render={() => <RemittancePage/>}/>
    //             <Route path="/members" render={() => <RemittancePage/>}/>
    //         </Fragment>
    //         }
    //     </Fragment>
    // );

    render() {
        //this is our initial page
        //same as user = localStorage.user and user_type = localStorage.user_type
        const { user, user_type } = localStorage;
        const { match, history } = this.props;
        const currentPath = match.params.currentPage;
        return (
            <div className="page-container">
                {/*define routes*/}
                {/*routes are the pages, we no longer change states to change the page*/}
                <Switch>
                    {/*note: important to pass functions as lambdas if its render*/}
                    <Route
                        path="/sign-in"
                        render={() => <SignInPage attemptSignIn={this.attemptSignIn}/>}
                    />
                    <Route path="/inventory" render={() => <InventoryPage />}/>
                    <Route path="/remittances" render={() => <RemittancePage />}/>
                    <Route path="/members" render={() => <MembersPage />}/>
                    <Route path="/users" render={() => <UsersPage />}/>
                    <Route path="/maintenance" render={() => <MaintenancePage />}/>
                    <Route path="/reports" render={() => <ReportsPage />}/>
                    <Route path="/tickets" render={() => <TicketsPage />}/>
                    <Route path="/profile" render={() => <ProfilePage />}/>
                    <Route path="/history" render={() => <HistoryPage />}/>


                </Switch>
                {/*render navbar if there is a user and path is not sign-in*/}
                {user && currentPath !== "sign-in" && <NavBar />}
            </div>
        );
    }
}
