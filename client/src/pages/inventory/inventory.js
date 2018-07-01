/**
 * Created by Jason Deniega on 01/07/2018.
 */
import React, {Component} from 'react';
import {Header} from "./components/header/header"
import '../../utilities/colorsFonts.css'

export class InventoryPage extends Component{
    // go to app.js and switch to PAGES[index of this page in the array] to
    // make inventory initial page. Navbar inventory button works tho so up to u gl
    render(){
        return(
            <div className="body-wrapper">
                <Header/>
            </div>
        )
    }
}