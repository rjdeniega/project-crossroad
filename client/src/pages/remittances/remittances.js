/**
 * Created by JasonDeniega on 27/06/2018.
 */

import React, {Component} from 'react';
import logo from '../../images/crossroad_logo.png'
import colors from '../../utilities/colorsFonts.css'
import {Icon} from 'react-icons-kit'
import {UsersPage, Page2} from '../../pages/users/users'
import {groupOutline} from 'react-icons-kit/typicons/groupOutline'
import {users} from 'react-icons-kit/feather/'
import {Avatar, List, Tag, Tabs} from 'antd'
import './style.css'
import {ClerkRemittancePage} from './subpages/clerk_remittance/clerk_remittance'
import {SupervisorRemittancePage} from './subpages/supervisor_remittance/supervisor_remittance'
import {DriverRemittancePage} from './subpages/driver_remittance/driver_remittance'
import {OMRemittancePage} from './subpages/om_remittance/om_remittance'


const TabPane = Tabs.TabPane;

export class RemittancePage extends Component {
    renderPage = () => {
        const user_type = JSON.parse(localStorage.user_type);
        if (user_type === "driver") {
            return <DriverRemittancePage/>
        }
        if (user_type === "supervisor") {
            return <SupervisorRemittancePage/>
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