/**
 * Created by JasonDeniega on 04/07/2018.
 */
/**
 * Created by JasonDeniega on 27/06/2018.
 */

import React, { Component, Fragment } from 'react';
import { Icon } from 'react-icons-kit'
import { groupOutline } from 'react-icons-kit/typicons/groupOutline'
import { users } from 'react-icons-kit/feather/'
import { u1F46E } from 'react-icons-kit/noto_emoji_regular/u1F46E'
import { driversLicenseO } from 'react-icons-kit/fa/driversLicenseO'
import { cube } from 'react-icons-kit/fa/cube'
import { UserAvatar } from "../../../../components/avatar/avatar"
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
import { DatePicker } from 'antd';
import { money } from 'react-icons-kit/fa/money'
import './style.css'
import { clockO } from 'react-icons-kit/fa/clockO'
import { data } from '../../../users/users'
import { getDrivers } from '../../../../network_requests/drivers'
import emptyStateImage from '../../../../images/empty_state_construction.png'
import { postData, getData } from "../../../../network_requests/general";

const TabPane = Tabs.TabPane;
const Step = Steps.Step;
const ButtonGroup = Button.Group;
const FormItem = Form.Item;
const antIcon = <AntIcon type="loading" style={{ fontSize: 70, color: 'var(--darkgreen)' }} icon="spin"/>;


function onChange(value, dateString) {
    console.log('Selected Time: ', value);
    console.log('Formatted Selected Time: ', dateString);
}

function onOk(value) {
    console.log('onOk: ', value);
}

export class SupervisorFirstContent extends Component {
    createShiftIteration = () => {
        const { id } = JSON.parse(localStorage.user_staff);
        const data = {
            "supervisor": id
        };
        postData('remittances/shift_iteration/', data)
            .then((data) => {
                console.log(data);
                console.log(data["error"]);
                if (data['errors']) {
                    message.error(data['error'])
                }
                else {
                    message.success(data["shift_type"] + "shift  " + data["date"]);
                    this.props.next()
                }
            })
            .catch(error => message.error("Server overloaded"));
    };

    render() {
        return (
            <div className="rem-first-content">
                <div className="content-label">
                    <Icon icon={clockO} size={30}/>
                    <p> Start Shift </p>
                </div>
                <Button type="primary" onClick={() => this.createShiftIteration()}>Simulan ang Shift</Button>
            </div>
        );
    }
}
export class SupervisorSecondContent extends Component {
    state = {
        visible: false,
        drivers: null,
        add_void_type: null,
        void_visible: false,
        void_tickets: [],
        void_tickets_10: [],
        void_tickets_12: [],
        void_tickets_15: [],
        add_void_label: null,
        add_void_value: null,
        ten_from_first: null,
        ten_to_first: null,
        ten_from_second: null,
        ten_to_second: null,
        twelve_from_first: null,
        twelve_to_first: null,
        twelve_from_second: null,
        twelve_to_second: null,
        fifteen_from_first: null,
        fifteen_to_first: null,
        fifteen_from_second: null,
        fifteen_to_second: null,
        driver_selected: null
    };

    componentDidMount() {
        this.fetchDrivers()
    }

    fetchDrivers() {
        const { id } = JSON.parse(localStorage.user_staff);
        return getData('/remittances/shifts/assigned_drivers/' + id).then(data => {
            if (!data.error) {
                //for each entry in drivers data, append data as a dictionary in tableData
                //ant tables accept values {"key": value, "column_name" : "value" } format
                //I cant just pass the raw array since its a collection of objects
                const drivers = data.drivers_assigned.map(tuple =>
                    tuple.driver
                );
                console.log(drivers);
                this.setState({ drivers: drivers });
            }
            else {
                console.log(data.error);
            }
        });
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
    };
    showAddVoid10 = () => {
        this.setState({
            void_visible: true,
            add_void_type: "10",
            add_void_label: "Magdagdag ng 10 peso tickets"
        });
    };
    showAddVoid12 = () => {
        this.setState({
            void_visible: true,
            add_void_type: "12",
            add_void_label: "Magdagdag ng 12 peso tickets"
        });
    };
    showAddVoid15 = () => {
        this.setState({
            void_visible: true,
            add_void_type: "15",
            add_void_label: "Magdagdag ng 15 peso tickets"
        });
    };
    createDeploymentForm = () => {

    };
    handleDeploy = (e) => {
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
    handleDriverSelect = (key) => {
        this.setState({
            driver_selected: key
        })
    };
    handleVoidAdd = (e) => {
        if (this.state.add_void_type == "10") {
            this.setState({
                void_tickets_10: [...this.state.void_tickets_10, this.state.add_void_value]
            }, () => console.log(this.state.void_tickets_10));
        }
        if (this.state.add_void_type == "12") {
            this.setState({
                void_tickets_12: [...this.state.void_tickets_12, this.state.add_void_value]
            }, () => console.log(this.state.void_tickets_12))
        }
        if (this.state.add_void_type == "15") {
            this.setState({
                void_tickets_15: [...this.state.void_tickets_15, this.state.add_void_value]
            }, () => console.log(this.state.void_tickets_15))
        }
        this.setState({
            add_void_value: null,
            void_tickets: [...this.state.void_tickets, this.state.add_void_value],
            void_visible: false,
            add_void_type: null,
            add_void_label: null,
        });
    };
    handleVoidCancel = (e) => {
        console.log(e);
        this.setState({
            void_visible: false,
            add_void_type: null,
            add_void_label: null,
        });
    };
    handleAddVoidChange = (e) => {
        if (isNaN(e)) {
            message.error("Please enter numeric value");
        }
        else {
            this.setState({
                add_void_value: e
            }, () => console.log(this.state.add_void_value))
        }
    };
    handleRangeChanges = fieldName => event => {
        return this.handleFormChange(fieldName)(event);
        //this is asynchronous, it does not execute in order
        //if console.log is not in callback, it might execute before state is updated
    };
    handleFormChange = fieldName => value => {
        // this function is to handle drop-downs
        const state = { ...this.state };
        state[fieldName] = value;
        this.setState({
            ...state
        });
    };

    renderDriversList = () => ( <List
        className="driver-list"
        itemLayout="horizontal"
        dataSource={this.state.drivers}
        renderItem={driver => (
            <List.Item key={driver.id} onClick={() => this.handleDriverSelect(driver.id)} className="driver-item">
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
    renderDeploymentModal = () => (
        <Modal
            className="driver-deploy-modal"
            title="Deploy Driver"
            visible={this.state.visible}
            onOk={this.handleDeploy}
            onCancel={this.handleCancel}
        >
            <Modal
                title={this.state.add_void_label}
                visible={this.state.void_visible}
                onOk={this.handleVoidAdd}
                onCancel={this.handleVoidCancel}
            >
                <InputNumber className="add-void-input" placeholder="Ilagay ang ticket number"
                             value={this.state.add_void_value}
                             onChange={this.handleAddVoidChange}/>
            </Modal>
            <div className="ticket-div">
                <div className="driver-deploy-input">
                    <p><b>10 Peso Tickets</b><Button size="small" onClick={this.showAddVoid10}>Add Void</Button></p>
                    <div className="ticket-range-div">
                        <InputNumber className="first-range-from" size="large"
                                     onChange={this.handleRangeChanges("ten_from_first")}
                                     placeholder="simula ng ticket"/>
                        <InputNumber className="first-range-to" size="large"
                                     onChange={this.handleRangeChanges("ten_to_first")} placeholder="dulo ng ticket"/>
                        <InputNumber className="second-range-from" size="large"
                                     onChange={this.handleRangeChanges("ten_from_second")}
                                     placeholder="simula ng ticket"/>
                        <InputNumber className="second-range-to" size="large"
                                     onChange={this.handleRangeChanges("ten_to_second")} placeholder="dulo ng ticket"/>
                    </div>
                </div>
                <div className="driver-deploy-input">
                    <p><b>12 Peso Tickets</b><Button size="small" onClick={this.showAddVoid12}>Add Void</Button></p>
                    <div className="ticket-range-div">
                        <InputNumber className="first-range-from" size="large"
                                     onChange={this.handleRangeChanges("twelve_from_first")}
                                     placeholder="simula ng ticket"/>
                        <InputNumber className="first-range-to" size="large"
                                     onChange={this.handleRangeChanges("twelve_to_first")}
                                     placeholder="dulo ng ticket"/>
                        <InputNumber className="second-range-from" size="large"
                                     onChange={this.handleRangeChanges("twelve_from_second")}
                                     placeholder="simula ng ticket"/>
                        <InputNumber className="second-range-to" size="large"
                                     onChange={this.handleRangeChanges("twelve_to_second")}
                                     placeholder="dulo ng ticket"/>
                    </div>
                </div>
                <div className="driver-deploy-input">
                    <p><b>15 Peso Tickets</b><Button size="small" onClick={this.showAddVoid15}>Add Void</Button></p>
                    <div className="ticket-range-div">
                        <InputNumber className="first-range-from" size="large"
                                     onChange={this.handleRangeChanges("fifteen_from_first")}
                                     placeholder="simula ng ticket"/>
                        <InputNumber className="first-range-to" size="large"
                                     onChange={this.handleRangeChanges("fifteen_to_first")}
                                     placeholder="dulo ng ticket"/>
                        <InputNumber className="second-range-from" size="large"
                                     onChange={this.handleRangeChanges("fifteen_from_second")}
                                     placeholder="simula ng ticket"/>
                        <InputNumber className="second-range-to" size="large"
                                     onChange={this.handleRangeChanges("fifteen_to_second")}
                                     placeholder="dulo ng ticket"/>
                    </div>
                </div>
            </div>
            <div className="void-tickets">
                <p><b>Void tickets</b></p>
                {this.state.void_tickets.length != 0 && <List
                    className="void-list"
                    itemLayout="horizontal"
                    dataSource={this.state.void_tickets}
                    renderItem={item => (
                        <List.Item className="void-item">
                            <List.Item.Meta title={item}/>
                        </List.Item>
                    )}
                />}
                {this.state.void_tickets < 1 &&
                <div className="void-empty-state">
                    <img className="void-empty-img" src={emptyStateImage}/>
                    <p className="empty-label"> walang void tickets</p>
                </div>
                }
            </div>
        </Modal>
    );

    render() {
        const { drivers } = this.state;
        const isLoading = drivers === null;
        return (
            <div className="rem-second-content">
                {this.renderDeploymentModal()}
                <div className="content-label">
                    <Icon icon={clockO} size={30}/>
                    <p> Mag-Deploy ng Drivers </p>
                </div>
                <div className="driver-list-wrapper">
                    {drivers && this.renderDriversList()}
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
    state = {
        drivers: null,
    };

    componentDidMount() {
        this.fetchDrivers()
    }

    fetchDrivers() {
        const { id } = JSON.parse(localStorage.user_staff);
        return getData('/remittances/shifts/assigned_drivers/' + id).then(data => {
            if (!data.error) {
                //for each entry in drivers data, append data as a dictionary in tableData
                //ant tables accept values {"key": value, "column_name" : "value" } format
                //I cant just pass the raw array since its a collection of objects
                const drivers = data.drivers_assigned.map(tuple =>
                    tuple.driver
                );
                console.log(drivers);
                this.setState({ drivers: drivers });
            }
            else {
                console.log(data.error);
            }
        });
    }

    renderDriversList = () => ( <List
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
                    <Button className="view-button" type="ghost" icon="eye">
                        Tignan
                    </Button>
                </div>
            </List.Item>
        )}
    />);


    render() {
        const { drivers } = this.state;
        const isLoading = drivers === null;
        return (
            <div className="rem-second-content">
                <div className="content-label">
                    <Icon icon={clockO} size={30}/>
                    <p> I-confirm ang mga remittances </p>
                </div>
                <div className="driver-list-wrapper">
                    {drivers && this.renderDriversList()}
                    {isLoading &&
                    <Spin className="user-spinner" indicator={antIcon} size="large"/>
                    }
                </div>
                <Button type="primary" onClick={() => this.props.endShift()}>Tapusin ang shift</Button>
            </div>
        );
    }
}
const confirm = Modal.confirm;
export class SupervisorRemittancePage extends Component {
    state = {
        current: 0,
        deployed_drivers: [],
    };

    next = () => {
        const current = this.state.current + 1;
        this.setState({ current });
    };
    endShift = () => {
        this.setState({ current: 0 });
    };

    prev() {
        const current = this.state.current - 1;
        this.setState({ current });
    }

    showConfirm = () => {
        confirm({
            title: 'Tapusin ang shift?',
            content: 'i-kumpirma ang pagtatapos ng shift',
            onOk: () => {
                message.success('Success');
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
        const { current } = this.state;
        const remSteps = [{
            title: 'Start Shift',
            content: <SupervisorFirstContent next={this.next}/>,
        }, {
            title: 'Deploy Drivers',
            content: <SupervisorSecondContent next={this.next}/>,
        }, {
            title: 'Confirm',
            content: <SupervisorLastContent endShift={this.endShift}/>,
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
                            dataSource={this.state.deployed_drivers}
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
