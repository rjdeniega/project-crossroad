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
const TabPane = Tabs.TabPane;
const OM_TABS = [
    {
        "tab_name": "Overview",
        "key" : 1,
        "component" : <OverviewPane/>
    },
    {
        "tab_name": "Ticketing",
        "key" : 2,
        "component" : <TicketingPane/>
    },
    {
        "tab_name": "Ticketing",
        "key" : 3,
        "component" : <BeepPane/>
    },
    {
        "tab_name": "Shift Management",
        "key" : 4,
        "component" : <ShiftManagementPane/>
    },
];
export class OMRemittancePage extends Component {
    state = {
        currentTab: <ShiftManagementPane/>,
    };
    // change pages on navbar item click
    invokeChangeTab = newPage => this.setState({
        currentTab: newPage,
    });
    callback = (key) => {
        const newPage = OM_TABS.key == key;
        this.invokeChangeTab(newPage.component);
    };

    renderTabs = () => OM_TABS.map(tab =>
            <TabPane className="tab-item" tab={tab.name} key={tab.key}></TabPane>
    );

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
                            <Tabs className="user-tabs" defaultActiveKey="2" onChange={this.callback}>
                                {this.renderTabs}
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