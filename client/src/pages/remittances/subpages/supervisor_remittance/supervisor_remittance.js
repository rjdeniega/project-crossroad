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
import {Avatar, List, Radio, Tabs, Steps, Button, InputNumber,Divider, Input, Modal, message} from 'antd'
import {DatePicker} from 'antd';
import {money} from 'react-icons-kit/fa/money'
import './style.css'
import {clockO} from 'react-icons-kit/fa/clockO'
import {data} from '../../../users/users'
import emptyStateImage from '../../../../images/empty_state_construction.png'

const TabPane = Tabs.TabPane;
const Step = Steps.Step;
const ButtonGroup = Button.Group;

function onChange(value, dateString) {
    console.log('Selected Time: ', value);
    console.log('Formatted Selected Time: ', dateString);
}

function onOk(value) {
    console.log('onOk: ', value);
}


export class SupervisorFirstContent extends Component {
    render() {
        return (
            <div className="rem-first-content">
                <div className="content-label">
                    <Icon icon={clockO} size={30}/>
                    <p> Create Shift </p>
                </div>
                <div>
                    <DatePicker
                        format="YYYY-MM-DD"
                        placeholder="Date Today"
                        disabled
                    />
                    <br />
                </div>
                <p> Select Shift Type </p>
                <Radio.Group>
                    <Radio.Button className="shift-type" value="large">AM</Radio.Button>
                    <Radio.Button className="shift-type" value="default">PM</Radio.Button>
                    <Radio.Button className="shift-type" value="small">Midnight</Radio.Button>
                </Radio.Group>
            </div>
        );
    }
}
export class SupervisorSecondContent extends Component {
    state = {visible: false};

    showModal = () => {
        this.setState({
            visible: true,
        });
    };
    handleOk = (e) => {
        this.setState({
            visible: false,
        });
    };
    handleCancel = (e) => {
        console.log(e);
        this.setState({
            visible: false,
        });
    };

    render() {
        return (
            <div className="rem-second-content">
                <Modal
                    className="driver-deploy-modal"
                    title="Deploy Driver"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >
                    <div className="driver-deploy-input">
                        <p><b>9 Peso Ticket Start</b></p>
                        <InputNumber size="large" placeholder="###"/>
                    </div>
                    <div className="driver-deploy-input">
                        <p><b>11 Peso Ticket Start</b></p>
                        <InputNumber size="large" placeholder="###"/>
                    </div>
                    <div className="driver-deploy-input">
                        <p><b>11 Peso Ticket Start</b></p>
                        <InputNumber size="large" placeholder="###"/>
                    </div>
                </Modal>
                <div className="content-label">
                    <Icon icon={clockO} size={30}/>
                    <p> Deploy Drivers </p>
                </div>
                <div className="driver-list-wrapper">
                    <List
                        className="driver-list"
                        itemLayout="horizontal"
                        dataSource={data}
                        renderItem={item => (
                            <List.Item className="driver-item">
                                <List.Item.Meta
                                    avatar={<Avatar
                                        src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"/>}
                                    title={<a href="https://ant.design">{item.title}</a>}
                                />
                                <div>
                                    <Button className="deploy-button" type="ghost"
                                            onClick={this.showModal}>Deploy</Button>
                                </div>
                            </List.Item>
                        )}
                    />
                </div>
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

const confirm = Modal.confirm;
export class SupervisorRemittancePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 0,
        };
        this.showConfirm.bind(this);
    }

    shift_create_next() {
        const current = this.state.current + 1;
        this.setState({current});
    }

    next() {
        const current = this.state.current + 1;
        this.setState({current});
    }

    prev() {
        const current = this.state.current - 1;
        this.setState({current});
    }
    showConfirm = () => {
        confirm({
            title: 'Finalize Shift Creation?',
            content: 'this shift will be added to your history',
            onOk: () => {
                message.success('Shift creation successful');
                this.setState({
                    current: 0
                })
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };
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
                            <Steps current={current} className="rem-step">
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
                                <Button type="primary" onClick={() => {
                                    this.showConfirm();
                                }}>End Shift</Button>
                            }
                            {/*{*/}
                            {/*this.state.current > 0*/}
                            {/*&&*/}
                            {/*<Button style={{marginLeft: 8}} onClick={() => this.prev()}>*/}
                            {/*Previous*/}
                            {/*</Button>*/}
                            {/*}*/}
                        </div>
                    </div>
                    <div className="sv-deployed-drivers">
                        <Divider orientation="left">Deployed Drivers</Divider>
                        <img className="empty-image" src={emptyStateImage}/>
                        <p>Under Construction</p>
                    </div>
                    <div className="sv-history">
                        <Divider orientation="left">My Past Transactions</Divider>
                        <img className="empty-image" src={emptyStateImage}/>
                        <p>Under Construction</p>
                    </div>
                </div>
            </div>

        );
    }
}
