import React, {Component} from 'react';
import './App.css';
import {Page1, Page2} from '../pages/users/index.js'
import {NavBar} from "../components/navbar"
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
                    {this.state.currentPage}
            </div>
        );
    }
}
