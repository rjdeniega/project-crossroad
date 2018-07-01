import React, {Component} from 'react';
import './App.css';
import {UsersPage} from '../pages/users/users.js'
import {SignInPage} from '../pages/sign_in/sign_in'
import {RemittancePage} from '../pages/remittances/remittances'
import {NavBar} from "../components/navbar/navbar"
import {InventoryPage} from '../pages/inventory/inventory'
import 'antd/dist/antd.css';
import '../utilities/colorsFonts.css'


const PAGES = [<SignInPage/>,<UsersPage />, <RemittancePage />,<InventoryPage/>];
export default class App extends Component {

    state = {
        currentPage: PAGES[3],
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
