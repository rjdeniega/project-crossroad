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
import {Avatar, List, Tag, Tabs, Steps, Button, Input} from 'antd'
import {userCircleO} from 'react-icons-kit/fa/userCircleO'
import {UserAvatar} from "../../../../components/avatar/avatar"
import {money} from 'react-icons-kit/fa/money'
import './style.css'
import {TicketingPane} from '../../tabs/ticketing/ticketing'
import {BeepPane} from '../../tabs/beep/beep'
import {OverviewPane} from '../../tabs/overview/overview'
const TabPane = Tabs.TabPane;
const Step = Steps.Step;

export class SupervisorFirstContent extends Component {
    render() {
        return (
            <div>
                <p className="username-label">Please enter username</p>
                <Input className="username" type="text" placeholder="username"/>
            </div>
        );
    }
}
export class SupervisorSecondContent extends Component {
    render() {
        return (
            <div>
                <p className="name-label">Please enter name</p>
                <Input className="name" type="text" placeholder="username"/>
                <p className="name-label">Please enter address</p>
                <Input className="name" type="text" placeholder="laguna"/>
                <p className="name-label">Please enter email</p>
                <Input addonAfter=".com" placeholder="someone@belair"/>
                <p className="name-label">Please enter contact number</p>
                <Input addonBefore="+639" placeholder=""/>
            </div>
        );
    }
}
export class SupervisorLastContent extends Component {
    render() {
        return (
            <div>
                <p> User's temporary password is <b>imabelairboy</b></p>
            </div>
        );
    }
}


const remSteps = [{
    title: 'Start Shift',
    content: <SupervisorFirstContent/>,
}, {
    title: 'Deploy Drivers',
    content: <SupervisorSecondContent/>,
}, {
    title: 'Confirm',
    content: <SupervisorLastContent/>,
}];

export class SupervisorRemittancePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 0,
        };
    }

    next() {
        const current = this.state.current + 1;
        this.setState({current});
    }

    prev() {
        const current = this.state.current - 1;
        this.setState({current});
    }

    render() {
        const {current} = this.state;
        return (
            <div className="remittance-page-body">
                <div className="supervisor-remittance-header">
                    <div className="header-text">
                        <Icon className="page-icon" icon={money} size={42}/>
                        <div className="page-title"> Remittances</div>
                        <div className="rem-page-description"> Manage Driver Deployment</div>
                    </div>
                    <div className="header-steps-wrapper">
                        <div className="header-steps">
                            <Steps current={current}>
                                {remSteps.map(item => <Step key={item.title} title={item.title}/>)}
                            </Steps>
                        </div>
                    </div>
                    <UserAvatar/>
                </div>
                <div className="supervisor-rem-content">
                    <div className="sv-transactions">
                        <div className="sv-steps-content">{remSteps[this.state.current].content}</div>
                        <div className="steps-action">
                            {
                                this.state.current < remSteps.length - 1
                                &&
                                <Button type="primary" onClick={() => this.next()}>Next</Button>
                            }
                            {
                                this.state.current === remSteps.length - 1
                                &&
                                <Button type="primary" onClick={this.props.handleOk}>Done</Button>
                            }
                            {
                                this.state.current > 0
                                &&
                                <Button style={{marginLeft: 8}} onClick={() => this.prev()}>
                                    Previous
                                </Button>
                            }
                        </div>
                    </div>
                    <div className="sv-pending-requests">
                    </div>
                    <div className="sv-completed-requests">
                    </div>
                </div>
            </div>

        );
    }
}
