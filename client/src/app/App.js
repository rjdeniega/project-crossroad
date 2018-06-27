import React, {Component} from 'react';
import './App.css';
import {UsersPage, Page2} from '../pages/users/users.js'
import {SignInPage} from '../pages/sign_in/sign_in'
import {NavBar} from "../components/navbar/navbar"
import 'antd/dist/antd.css';
import '../utilities/colorsFonts.css'


const PAGES = [<SignInPage/>,<UsersPage />, <Page2 />];
export default class App extends Component {

    state = {
        currentPage: PAGES[1],
    };

    // change pages on navbar item click
    onCurrentPageChange = newPage => this.setState({
        currentPage: newPage,
    });

    render() {
        //this is our initial page
        return (
            <div className="page-container">
                <NavBar onCurrentPageChange={this.onCurrentPageChange}/>
                {this.state.currentPage}
            </div>
        );
    }
}
