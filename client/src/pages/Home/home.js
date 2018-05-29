/**
 * Created by JasonDeniega on 24/05/2018.
 */
import React, {Component} from "react";
import NavBar from "../../components/navbar"
import './style.css'

class Page1 extends Component {
    render() {
        return <h1>Page </h1>
    }
}

class Page2 extends Component {
    render() {
        return <h1>Page 2</h1>
    }
}

export default class App extends Component {
    render() {
        return (
            <div id="page-container">
                <NavBar/>
            </div>
        );
    }
}