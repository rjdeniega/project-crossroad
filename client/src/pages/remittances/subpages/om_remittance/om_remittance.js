/**
 * Created by JasonDeniega on 05/07/2018.
 */
/**
 * Created by JasonDeniega on 04/07/2018.
 */
/**
 * Created by JasonDeniega on 04/07/2018.
 */
/**
 * Created by JasonDeniega on 27/06/2018.
 */

import React, {Component} from 'react';
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
import {ShiftManagementPane} from '../../tabs/shift_management/shift_management'
import {ShiftHistoryPane} from '../../tabs/shift_history/shift_history'

const TabPane = Tabs.TabPane;

export class OMRemittancePage extends Component {
    state = {
        currentTab: <ShiftManagementPane/>,
    };
    // change pages on navbar item click
    invokeChangeTab = newPage => this.setState({
        currentTab: newPage,
    });
    callback = (key) => {
        if (key == "1") {
            this.invokeChangeTab(<ShiftManagementPane/>)
        } else if (key == "2") {
            this.invokeChangeTab(<ShiftHistoryPane/>)
        } else if (key == "3")  {
            this.invokeChangeTab(<TicketingPane/>)
        }else {
            this.invokeChangeTab(<BeepPane/>)
        }
    };

    render() {
        return (
            <div className="remittance-page-body">
                <div className="remittance-header">
                    <div className="header-text">
                        <Icon className="page-icon" icon={money} size={42}/>
                        <div className="page-title"> Remittances</div>
                        <div className="rem-page-description"> Manage Beep™ and ticketing remittances</div>
                    </div>
                    <UserAvatar/>
                    <div className="header-bottom">
                        <div className="user-tabs-wrapper">
                            <Tabs className="user-tabs" defaultActiveKey="1" onChange={this.callback}>
                                <TabPane className="tab-item" tab="Create Schedule" key="1"></TabPane>
                                <TabPane className="tab-item" tab="Schedule History" key="2"></TabPane>
                                <TabPane className="tab-item" tab="Ticketing" key="3"></TabPane>
                                <TabPane className="tab-item" tab="Beep™" key="4"></TabPane>
                            </Tabs>
                        </div>
                    </div>
                </div>
                <div className="remittance-content-body">
                    {this.state.currentTab}
                </div>
            </div>
        );

    }
}