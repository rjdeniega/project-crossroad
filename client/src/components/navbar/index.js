/**
 * Created by JasonDeniega on 29/05/2018.
 */
import React, {Component} from 'react';
import './style.css'
import logo from '../../images/logo.png'
import userIcon from '../../images/users.png'
import {Page1, Page2} from '../../pages/Home/home.js'

const TABS = [
    {
        name: "Page 1",
        component: <Page1 />,
        image: userIcon
    },
    {
        name: "Page 2",
        component: <Page2 />,
    },
];
export class NavBar extends Component {
    // function to append all NavBar items
    renderNavbarItems = () => TABS.map(tab =>
        <NavBarItems name={tab.name} onClick={() => {
            this.props.onCurrentPageChange(tab.component);
        }}/>,
    );

    render() {
        return (
            //render logo and all items
            <div className="nav-container">
                <img id='logo' src={logo}/>
                <div className="logo-container">
                    <div className="nav-item-container">
                        {this.renderNavbarItems()}
                    </div>
                </div>
            </div>

        );
    }
}
class NavBarItems extends Component {
    render() {
        return (
            <div className="navbar-items" onClick={this.props.onClick}>{this.props.name}
                <img className="navbar-item" src={this.props.image}/>
            </div>
        );
    }
}