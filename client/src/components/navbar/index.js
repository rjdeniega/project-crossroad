/**
 * Created by JasonDeniega on 29/05/2018.
 */
import React, {Component} from 'react';
import './style.css'
import index from '../../images/index.png'


export default class NavBar extends Component {
    render() {
        return (
            <div className="container">
               <image src={index}/>
            </div>
        );
    }
}