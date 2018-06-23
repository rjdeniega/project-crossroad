/**
 * Created by JasonDeniega on 29/05/2018.
 */

import React, {Component} from 'react';
import './style.css'
import {Page1, Page2} from '../../pages/home/home.js'
import {UserAvatar} from '../../components/avatar'

console.log(Page1, Page2);

export class Header extends Component {
    render() {
        return (
            //render logo and all items
            <div className="header">
                <div className="header-text">
                    <div className="page-title"> Users </div>
                    <div className="current-date"> Feb 16 2018 </div>
                </div>
                <UserAvatar/>
            </div>
        );
    }
}