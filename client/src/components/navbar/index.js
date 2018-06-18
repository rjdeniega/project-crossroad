/**
 * Created by JasonDeniega on 29/05/2018.
 */
import React, {Component} from 'react';
import './style.css'
import logo from '../../images/logo.png'


export class NavBar extends Component {
    render() {
        return (
            <div className="container">
               <img id='logo' src={logo}/>
            </div>
        );
    }
}