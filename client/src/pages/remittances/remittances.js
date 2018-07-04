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


const TabPane = Tabs.TabPane;

const REMITTANCE_PAGES = [<ClerkRemittancePage/>,<SupervisorRemittancePage/>];
export class RemittancePage extends Component {
    state = {
        currentPage: REMITTANCE_PAGES[1]
    };
    // change pages on navbar item click
    invokeChangePage = newPage => this.setState({
        currentTab: newPage,
    });

    render() {
        return (
            <div className="body-wrapper">
                <div className="remittance-page-wrapper">
                    {this.state.currentPage}
                </div>
            </div>
        );
    }
}