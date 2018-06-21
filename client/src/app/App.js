import React, { Component } from 'react';
import logo from '../logo.svg';
import './App.css';
import {Page1,Page2} from '../pages/home/home.js'
import {NavBar} from "../components/navbar"

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
            <div id="page-container">
                <NavBar onCurrentPageChange={this.onCurrentPageChange}/>
                {this.state.currentPage}
            </div>
        );
    }
}
