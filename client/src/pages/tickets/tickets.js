/**
 * Created by JasonDeniega on 11/10/2018.
 */

import React, { Component } from 'react';
import logo from '../../images/crossroad_logo.png'
import colors from '../../utilities/colorsFonts.css'
import { Icon } from 'react-icons-kit'
import { groupOutline } from 'react-icons-kit/typicons/groupOutline'
import { users } from 'react-icons-kit/feather/'
import { Avatar, List, Tag, Tabs, TimePicker } from 'antd'
import './style.css'
import { money } from 'react-icons-kit/fa/money'
import { UserAvatar } from "../../components/avatar/avatar"
import {ic_receipt} from 'react-icons-kit/md/ic_receipt'



export class TicketsPage extends Component {
    render() {
        return (
            <div className="body-wrapper">
                <div className="tickets-page-wrapper">
                    <div className="driver-remittance-header">
                        <div className="header-text">
                            <Icon className="page-icon" icon={ic_receipt} size={42}/>
                            <div className="page-title"> Tickets</div>
                            <div className="rem-page-description"> Assign and Monitor Tickets</div>
                        </div>
                        <UserAvatar/>
                    </div>
                </div>
            </div>
        );
    }
}