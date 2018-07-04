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
import {UserAvatar} from "../../../../components/avatar/avatar"
import {Avatar, List, Radio, Tabs, Steps, Button, InputNumber, Divider, Input, Modal, message} from 'antd'
import {DatePicker} from 'antd';
import {money} from 'react-icons-kit/fa/money'
import './style.css'
import {clockO} from 'react-icons-kit/fa/clockO'
import {data} from '../../../users/users'
import emptyStateImage from '../../../../images/empty_state_construction.png'

const TabPane = Tabs.TabPane;
const Step = Steps.Step;
const ButtonGroup = Button.Group;

export class DriverRemittancePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 0,
        };
    }

    render() {
        return (
            <div className="remittance-page-body">
                <div className="driver-remittance-header">
                    <div className="header-text">
                        <Icon className="page-icon" icon={money} size={42}/>
                        <div className="page-title"> Remittances</div>
                        <div className="rem-page-description"> Create Remittance Forms</div>
                    </div>
                    <UserAvatar/>
                </div>
                <div className="driver-rem-content">
                    <div className="dv-transactions">
                        <Divider orientation="left">Create Remittance Form</Divider>
                    </div>
                    <div className="dv-pending-requests">
                        <Divider orientation="left">Pending Requests</Divider>
                        <img className="empty-image" src={emptyStateImage}/>
                        <p>Under Construction</p>
                    </div>
                    <div className="dv-history">
                        <Divider orientation="left">My Remittances</Divider>
                        <img className="empty-image" src={emptyStateImage}/>
                        <p>Under Construction</p>
                    </div>
                </div>
            </div>
        );
    }
}
