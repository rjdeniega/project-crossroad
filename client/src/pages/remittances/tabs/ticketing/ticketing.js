/**
 * Created by JasonDeniega on 02/07/2018.
 */
import React, {Component} from 'react';
import './style.css'
import emptyStateImage from '../../../../images/empty_state_construction.png'
export class TicketingPane extends Component{
    render(){
        return(
            <div className="ticketing-tab-body">
                <img className="empty-image" src={emptyStateImage}/>
                <p className="empty-message">Looks like this user has no historical records yet</p>
            </div>
        );
    }
}