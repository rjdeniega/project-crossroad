import React, {Component} from 'react';
import './App.css';
import {Page1, Page2} from '../pages/home/home.js'
import {NavBar} from "../components/navbar"
import {Header} from "../components/header"
import 'antd/dist/antd.css';
import '../utilities/colorsFonts.css'


const PAGES = [<Page1 />, <Page2 />];
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
                <div className="body-wrapper">
                    <Header/>
                    {this.state.currentPage}
                </div>
            </div>
        );
    }
}
