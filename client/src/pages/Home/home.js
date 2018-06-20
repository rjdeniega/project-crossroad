/**
 * Created by JasonDeniega on 24/05/2018.
 */
import React, {Component} from "react";
import {NavBar} from "../../components/navbar"
import './style.css'


export class Page1 extends Component {
    render() {
        return (
            <div className="body-container">
                <h1>Page 1</h1>
            </div>
        );
    }
}

export class Page2 extends Component {
    render() {
        return (
            <div className="body-container">
            <h1>Page 2</h1>
            </div>
        )
    }
}
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
            <div id="page-container">
                <NavBar onCurrentPageChange={this.onCurrentPageChange}/>
                {this.state.currentPage}
            </div>
        );
    }
}