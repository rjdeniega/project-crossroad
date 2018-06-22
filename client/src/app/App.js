import React, { Component } from 'react';
import logo from '../logo.svg';
import './App.css';
import {Page1,Page2} from '../pages/home/home.js'
import {NavBar} from "../components/navbar"
import {UserAvatar} from "../components/avatar"
import {TopBar} from "../components/topbar"
import 'antd/dist/antd.css';


const  PAGES = [<Page1 />, <Page2 />];
export default class App extends Component {

    state = {
        currentPage: PAGES[0],
    };
    onCurrentPageChange = newPage => this.setState({
        currentPage: newPage,
    });

    render() {
        return (
            <div className="page-container">
                <NavBar onCurrentPageChange={this.onCurrentPageChange}/>
                <TopBar/>
                {this.state.currentPage}
            </div>
        );
    }
}
