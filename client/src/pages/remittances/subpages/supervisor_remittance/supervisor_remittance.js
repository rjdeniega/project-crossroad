/**
 * Created by JasonDeniega on 04/07/2018.
 */
/**
 * Created by JasonDeniega on 27/06/2018.
 */

import React, {Component,Fragment} from 'react';
import {Icon} from 'react-icons-kit'
import {groupOutline} from 'react-icons-kit/typicons/groupOutline'
import {users} from 'react-icons-kit/feather/'
import {u1F46E} from 'react-icons-kit/noto_emoji_regular/u1F46E'
import {driversLicenseO} from 'react-icons-kit/fa/driversLicenseO'
import {cube} from 'react-icons-kit/fa/cube'
import {UserAvatar} from "../../../../components/avatar/avatar"
import {
    Avatar,
    List,
    Radio,
    Tabs,
    Steps,
    Button,
    InputNumber,
    Divider,
    Input,
    Modal,
    message,
    Spin,
    Form,
    Icon as AntIcon
} from 'antd'
import {DatePicker} from 'antd';
import {money} from 'react-icons-kit/fa/money'
import './style.css'
import {clockO} from 'react-icons-kit/fa/clockO'
import {data} from '../../../users/users'
import {getDrivers} from '../../../../network_requests/drivers'
import emptyStateImage from '../../../../images/empty_state_construction.png'

const TabPane = Tabs.TabPane;
const Step = Steps.Step;
const ButtonGroup = Button.Group;
const FormItem = Form.Item;
const antIcon = <AntIcon type="loading" style={{fontSize: 70, color: 'var(--darkgreen)'}} icon="spin"/>;


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
                    <p> Start Shift </p>
                </div>
                <Button type="primary" onClick={() => this.props.next()}>Simulan ang Shift</Button>
            </div>
        );
    }
}
export class SupervisorSecondContent extends Component {
    state = {
        visible: false,
        drivers: null,
    };

    componentDidMount() {
        this.fetchDrivers()
    }

    fetchDrivers() {
        return fetch('/members/drivers').then(response => response.json()).then(data => {
            if (!data["error"]) {
                //for each entry in drivers data, append data as a dictionary in tableData
                //ant tables accept values {"key": value, "column_name" : "value" } format
                //I cant just pass the raw array since its a collection of objects
                this.setState({drivers: data["drivers"]});
            } else {
                console.log(data["error"]);
            }
        });
    }

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
    renderList = () => ( <List
        className="driver-list"
        itemLayout="horizontal"
        dataSource={this.state.drivers}
        renderItem={driver => (
            <List.Item className="driver-item">
                <List.Item.Meta
                    avatar={<Avatar
                        src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"/>}
                    title={<a href="https://ant.design">{driver.name}</a>}
                />
                <div>
                    <Button className="deploy-button" type="ghost"
                            onClick={this.showModal}>Deploy</Button>
                </div>
            </List.Item>
        )}
    />);

    render() {
        const {drivers} = this.state;
        const isLoading = drivers === null;
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
                        <p><b>9 Peso Tickets</b></p>
                        <div className="ticket-range-div">
                        <InputNumber className="first-range-from" size="large" placeholder="simula ng ticket"/>
                        <InputNumber className="first-range-to" size="large" placeholder="dulo ng ticket"/>
                        <InputNumber className="second-range-from"size="large" placeholder="simula ng ticket"/>
                        <InputNumber className="second-range-to"size="large" placeholder="dulo ng ticket"/>
                        </div>
                    </div>
                    <div className="driver-deploy-input">
                        <p><b>11 Peso Tickets</b></p>
                        <div className="ticket-range-div">
                        <InputNumber className="first-range-from" size="large" placeholder="simula ng ticket"/>
                        <InputNumber className="first-range-to" size="large" placeholder="dulo ng ticket"/>
                        <InputNumber className="second-range-from"size="large" placeholder="simula ng ticket"/>
                        <InputNumber className="second-range-to"size="large" placeholder="dulo ng ticket"/>
                        </div>
                    </div>
                    <div className="driver-deploy-input">
                        <p><b>14 Peso Tickets</b></p>
                        <div className="ticket-range-div">
                        <InputNumber className="first-range-from" size="large" placeholder="simula ng ticket"/>
                        <InputNumber className="first-range-to" size="large" placeholder="dulo ng ticket"/>
                        <InputNumber className="second-range-from"size="large" placeholder="simula ng ticket"/>
                        <InputNumber className="second-range-to"size="large" placeholder="dulo ng ticket"/>
                        </div>
                    </div>
                </Modal>
                <div className="content-label">
                    <Icon icon={clockO} size={30}/>
                    <p> Mag-Deploy ng Drivers </p>
                </div>
                <div className="driver-list-wrapper">
                    {drivers && this.renderList()}
                    {isLoading &&
                    <Spin className="user-spinner" indicator={antIcon} size="large"/>
                    }
                </div>
                <Button type="primary" onClick={() => this.props.next()}>Sunod</Button>
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
const confirm = Modal.confirm;
export class SupervisorRemittancePage extends Component {
    state = {
        current: 0,
    };

    next = () => {
        const current = this.state.current + 1;
        this.setState({current});
    };

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
        const remSteps = [{
            title: 'Start Shift',
            content: <SupervisorFirstContent next={this.next}/>,
        }, {
            title: 'Deploy Drivers',
            content: <SupervisorSecondContent next={this.next}/>,
        }, {
            title: 'Confirm',
            content: <SupervisorLastContent/>,
        }];
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
                        <div className="sv-steps-content">
                            {remSteps[this.state.current].content}
                        </div>
                        <div className="steps-action">
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
                        <List
                            className="deployed-list"
                            itemLayout="horizontal"
                            dataSource={data}
                            renderItem={item => (
                                <List.Item key={item.key} className="deploy-list-item">
                                    <List.Item.Meta
                                        avatar={<Avatar
                                            src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"/>}
                                        title={<p className="deployed-drivers-list-title">{item.title}</p>}
                                    />
                                    <Button size="small" className="undeploy-button" icon="close">Undeploy</Button>
                                </List.Item>
                            )}
                        />
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
