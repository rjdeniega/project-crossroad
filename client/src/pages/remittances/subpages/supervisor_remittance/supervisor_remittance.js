/**
 * Created by JasonDeniega on 04/07/2018.
 */
/**
 * Created by JasonDeniega on 27/06/2018.
 */

import React, {Component} from 'react';
import logo from '../../images/crossroad_logo.png'
import colors from '../../utilities/colorsFonts.css'
import {Icon} from 'react-icons-kit'
import {groupOutline} from 'react-icons-kit/typicons/groupOutline'
import {users} from 'react-icons-kit/feather/'
import {u1F46E} from 'react-icons-kit/noto_emoji_regular/u1F46E'
import {driversLicenseO} from 'react-icons-kit/fa/driversLicenseO'
import {cube} from 'react-icons-kit/fa/cube'
import {Avatar, List, Tag, Tabs} from 'antd'
import {userCircleO} from 'react-icons-kit/fa/userCircleO'
import {UserAvatar} from "../../../../components/avatar/avatar"
import {money} from 'react-icons-kit/fa/money'
import './style.css'
import {TicketingPane} from '../../tabs/ticketing/ticketing'
import {BeepPane} from '../../tabs/beep/beep'
import {OverviewPane} from '../../tabs/overview/overview'
const TabPane = Tabs.TabPane;

export class SupervisorRemittancePage extends Component {
    state = {
        currentTab: <TicketingPane/>,
    };

    render() {
        return (
            <div className="body-wrapper">
                <div className="remittance-page-wrapper">
                    <div className="remittance-page-body">
                        <div className="supervisor-remittance-header">
                            <div className="header-text">
                                <Icon className="page-icon" icon={money} size={42}/>
                                <div className="page-title"> Remittances</div>
                                <div className="rem-page-description"> Manage Driver Deployment</div>
                            </div>
                            <UserAvatar/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}