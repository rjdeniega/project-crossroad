/**
 * Created by JasonDeniega on 27/06/2018.
 */

import React, {Component} from 'react';
import logo from '../../images/crossroad_logo.png'
import colors from '../../utilities/colorsFonts.css'
import {Icon} from 'react-icons-kit'
import {groupOutline} from 'react-icons-kit/typicons/groupOutline'
import {users} from 'react-icons-kit/feather/'
import {Avatar, List, Tag, Tabs, TimePicker} from 'antd'
import './style.css'
import {ClerkRemittancePage} from './subpages/clerk_remittance/clerk_remittance'
import {SupervisorRemittancePage} from './subpages/supervisor_remittance/supervisor_remittance'
import {DriverRemittancePage} from './subpages/driver_remittance/driver_remittance'
import {OMRemittancePage} from './subpages/om_remittance/om_remittance'
import {SupervisorRemittance} from './subpages/supervisor_remittance/revised_supervisor_remittance'


const TabPane = Tabs.TabPane;

export class RemittancePage extends Component {
    renderPage = () => {
        const {photo} = JSON.parse(localStorage.user_staff);
        const user_type = JSON.parse(localStorage.user_type);
        if (user_type === "driver") {
            return <DriverRemittancePage/>
        }
        if (user_type === "supervisor") {
            //return <SupervisorRemittancePage/>
            return <SupervisorRemittance />
        }
        if (user_type === "clerk") {
            return <ClerkRemittancePage/>
        }
        if (user_type === "operations_manager" || user_type === "system_admin") {
            return <OMRemittancePage/>
        }
    };

    render() {
        return (
            <div className="body-wrapper">
                <div className="remittance-page-wrapper">
                    {this.renderPage()}
                </div>
            </div>
        );
    }
}