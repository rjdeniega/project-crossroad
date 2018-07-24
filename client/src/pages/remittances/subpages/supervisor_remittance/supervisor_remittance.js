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
import userDefault from '../../../../images/default.png'
import { UserAvatar } from "../../../../components/avatar/avatar"
import {
    Select,
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
import { RemittanceForm } from '../../components/remittance_form/remittance_form'

const Option = Select.Option;
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
                    message.success("A shift already exists");
                    this.props.next()
                }
                else {
                    message.success(data["shift_type"] + "shift  " + data["date"]);
                    this.props.next()
                }
            })
            .catch(error => console.log(error));
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
        void_tickets_10_first: [],
        void_tickets_10_second: [],
        void_tickets_12_first: [],
        void_tickets_12_second: [],
        void_tickets_15_first: [],
        void_tickets_15_second: [],
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
        driver_selected: null,
        route: null,
    };

    componentDidMount() {
        this.fetchDrivers()
    }

    fetchDrivers() {
        const { id } = JSON.parse(localStorage.user_staff);
        return getData('remittances/shifts/pending_drivers/' + id).then(data => {
            if (!data.error) {
                //for each entry in drivers data, append data as a dictionary in tableData
                //ant tables accept values {"key": value, "column_name" : "value" } format
                //I cant just pass the raw array since its a collection of objects
                console.log(data);
                const drivers = data.non_deployed_drivers.map(tuple =>
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
    showAddVoid10_first = () => {
        this.setState({
            void_visible: true,
            add_void_type: "10_first",
            add_void_label: "Magdagdag ng void 10 peso tickets sa unang range"
        });
    };
    showAddVoid10_second = () => {
        this.setState({
            void_visible: true,
            add_void_type: "10_second",
            add_void_label: "Magdagdag ng void 10 peso tickets sa ikalawang range"
        });
    };
    showAddVoid12_first = () => {
        this.setState({
            void_visible: true,
            add_void_type: "12_first",
            add_void_label: "Magdagdag ng void 12 peso tickets sa unang range"
        });
    };
    showAddVoid12_second = () => {
        this.setState({
            void_visible: true,
            add_void_type: "12_second",
            add_void_label: "Magdagdag ng void 12 peso tickets sa ikalawang range"
        });
    };
    showAddVoid15_first = () => {
        this.setState({
            void_visible: true,
            add_void_type: "15_first",
            add_void_label: "Magdagdag ng void 15 peso tickets sa unang range"
        });
    };
    showAddVoid15_second = () => {
        this.setState({
            void_visible: true,
            add_void_type: "15_second",
            add_void_label: "Magdagdag ng void 15 peso tickets sa ikalawang range"
        });
    };
    transformToTicketDict = (tickets) => {
        const array = [];
        tickets.map(item => array.push({
            "ticket_number": item
        }));
        return array
    };
    createDeploymentForm = () => {
        const { id } = JSON.parse(localStorage.user_staff);

        const data = {
            "supervisor": id,
            "driver": this.state.driver_selected,
            "route": this.state.route,
            "assigned_ticket": [
                {
                    "range_from": this.state.ten_from_first,
                    "range_to": this.state.ten_to_first,
                    "type": "A",
                    "void_ticket": this.transformToTicketDict(this.state.void_tickets_10_first)
                },
                {
                    "range_from": this.state.ten_from_second,
                    "range_to": this.state.ten_to_second,
                    "type": "A",
                    "void_ticket": this.transformToTicketDict(this.state.void_tickets_10_second)
                },
                {
                    "range_from": this.state.twelve_from_first,
                    "range_to": this.state.twelve_to_first,
                    "type": "B",
                    "void_ticket": this.transformToTicketDict(this.state.void_tickets_12_first)
                },
                {
                    "range_from": this.state.twelve_from_second,
                    "range_to": this.state.twelve_to_second,
                    "type": "B",
                    "void_ticket": this.transformToTicketDict(this.state.void_tickets_12_second)
                },
                {
                    "range_from": this.state.fifteen_from_first,
                    "range_to": this.state.fifteen_to_first,
                    "type": "C",
                    "void_ticket": this.transformToTicketDict(this.state.void_tickets_15_first)
                },
                {
                    "range_from": this.state.fifteen_from_second,
                    "range_to": this.state.fifteen_to_second,
                    "type": "C",
                    "void_ticket": this.transformToTicketDict(this.state.void_tickets_15_second)
                },
            ]
        };
        console.log(data);
        return data;
    };
    handleDeploy = (e) => {
        const data = this.createDeploymentForm();
        postData('/remittances/deployments/', data).then(data => {
            console.log(data);
            if (!data.errors) {
                //for each entry in drivers data, append data as a dictionary in tableData
                //ant tables accept values {"key": value, "column_name" : "value" } format
                //I cant just pass the raw array since its a collection of objects
                this.fetchDrivers();
                this.props.updateDrivers();
            }
            else {
                console.log(data.errors);
            }
        });
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
        if (this.state.add_void_type == "10_first") {
            this.setState({
                void_tickets_10_first: [...this.state.void_tickets_10_first, this.state.add_void_value]
            }, () => console.log(this.state.void_tickets_10_first));
        }
        if (this.state.add_void_type == "10_second") {
            this.setState({
                void_tickets_10_second: [...this.state.void_tickets_10_second, this.state.add_void_value]
            }, () => console.log(this.state.void_tickets_10_second));
        }
        if (this.state.add_void_type == "12_first") {
            this.setState({
                void_tickets_12_first: [...this.state.void_tickets_12_first, this.state.add_void_value]
            }, () => console.log(this.state.void_tickets_12_first))
        }
        if (this.state.add_void_type == "12_second") {
            this.setState({
                void_tickets_12_second: [...this.state.void_tickets_12_second, this.state.add_void_value]
            }, () => console.log(this.state.void_tickets_12_second))
        }
        if (this.state.add_void_type == "15_first") {
            this.setState({
                void_tickets_15_first: [...this.state.void_tickets_15_first, this.state.add_void_value]
            }, () => console.log(this.state.void_tickets_15_first))
        }
        if (this.state.add_void_type == "15_second") {
            this.setState({
                void_tickets_15_second: [...this.state.void_tickets_15_second, this.state.add_void_value]
            }, () => console.log(this.state.void_tickets_15_second))
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
    handleFormUpdatesListener = fieldName => event => {
        return this.handleFormChange(fieldName)(event);
        //this is asynchronous, it does not execute in order
        //if console.log is not in callback, it might execute before state is updated
    };
    handleFormChange = fieldName => value => {
        // this function is to handle drop-downs
        const state = { ...this.state };
        state[fieldName] = value;
        console.log(state[fieldName]);
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
                        src={userDefault}/>}
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
                    <div className="route-div">
                        <p><b>Route: </b></p>
                        <Select onChange={this.handleFormUpdatesListener("route")} className="route-input"
                                defaultValue="Pumili ng ruta">
                            <Option value="M">Main Road</Option>
                            <Option value="R">Kanan</Option>
                            <Option value="L">Kaliwa</Option>
                        </Select>
                    </div>
                    <p><b>10 Peso Tickets</b></p>
                    <div className="ticket-range-div">
                        <InputNumber className="first-range-from" size="large"
                                     onChange={this.handleFormUpdatesListener("ten_from_first")}
                                     placeholder="simula ng ticket una"/>
                        <InputNumber className="first-range-to" size="large"
                                     onChange={this.handleFormUpdatesListener("ten_to_first")}
                                     placeholder="dulo ng ticket una"/>
                        <Button size="small" className="first-add-void-button"
                                onClick={this.showAddVoid10_first}><AntIcon
                            className="plus-icon" type="plus-circle-o"/>Add
                            Void</Button>

                        <InputNumber className="second-range-from" size="large"
                                     onChange={this.handleFormUpdatesListener("ten_from_second")}
                                     placeholder="simula ng ticket"/>
                        <InputNumber className="second-range-to" size="large"
                                     onChange={this.handleFormUpdatesListener("ten_to_second")}
                                     placeholder="dulo ng ticket"/>
                        <Button size="small" className="second-add-void-button"
                                onClick={this.showAddVoid10_second}><AntIcon
                            className="plus-icon" type="plus-circle-o"/>Add
                            Void</Button>

                    </div>
                </div>
                <div className="driver-deploy-input">
                    <p><b>12 Peso Tickets</b></p>
                    <div className="ticket-range-div">
                        <InputNumber className="first-range-from" size="large"
                                     onChange={this.handleFormUpdatesListener("twelve_from_first")}
                                     placeholder="simula ng ticket"/>
                        <InputNumber className="first-range-to" size="large"
                                     onChange={this.handleFormUpdatesListener("twelve_to_first")}
                                     placeholder="dulo ng ticket"/>
                        <Button size="small" className="first-add-void-button"
                                onClick={this.showAddVoid12_first}><AntIcon
                            className="plus-icon" type="plus-circle-o"/> Add
                            Void</Button>
                        <InputNumber className="second-range-from" size="large"
                                     onChange={this.handleFormUpdatesListener("twelve_from_second")}
                                     placeholder="simula ng ticket"/>
                        <InputNumber className="second-range-to" size="large"
                                     onChange={this.handleFormUpdatesListener("twelve_to_second")}
                                     placeholder="dulo ng ticket"/>
                        <Button size="small" className="second-add-void-button"
                                onClick={this.showAddVoid12_second}><AntIcon
                            className="plus-icon" type="plus-circle-o"/> Add
                            Void</Button>

                    </div>
                </div>
                <div className="driver-deploy-input">
                    <p><b>15 Peso Tickets</b></p>
                    <div className="ticket-range-div">
                        <InputNumber className="first-range-from" size="large"
                                     onChange={this.handleFormUpdatesListener("fifteen_from_first")}
                                     placeholder="simula ng ticket"/>
                        <InputNumber className="first-range-to" size="large"
                                     onChange={this.handleFormUpdatesListener("fifteen_to_first")}
                                     placeholder="dulo ng ticket"/>
                        <Button size="small" className="first-add-void-button"
                                onClick={this.showAddVoid15_first}><AntIcon
                            className="plus-icon" type="plus-circle-o"/> Add
                            Void</Button>
                        <InputNumber className="second-range-from" size="large"
                                     onChange={this.handleFormUpdatesListener("fifteen_from_second")}
                                     placeholder="simula ng ticket"/>
                        <InputNumber className="second-range-to" size="large"
                                     onChange={this.handleFormUpdatesListener("fifteen_to_second")}
                                     placeholder="dulo ng ticket"/>
                        <Button size="small" className="second-add-void-button"
                                onClick={this.showAddVoid15_second}><AntIcon
                            className="plus-icon" type="plus-circle-o"/> Add
                            Void</Button>

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
                    {/*<img className="void-empty-img" src={emptyStateImage}/>*/}
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
        remittances: null,
        visible: false,
        ten_peso_start_first: 0,
        ten_peso_start_second: 0,
        twelve_peso_start_first: 0,
        twelve_peso_start_second: 0,
        fifteen_peso_start_first: 0,
        fifteen_peso_start_second: 0,
        ten_peso_end_first: 0,
        ten_peso_end_second: 0,
        twelve_peso_end_first: 0,
        twelve_peso_end_second: 0,
        fifteen_peso_end_first: 0,
        fifteen_peso_end_second: 0,
    };

    componentDidMount() {
        this.fetchDrivers()
    }

    fetchDrivers() {
        const { id } = JSON.parse(localStorage.user_staff);
        return getData('remittances/remittance_form/pending/' + id).then(data => {
            if (!data.error) {
                console.log(data);
                const remittances = data.unconfirmed_remittances.map(item =>
                    item
                );
                console.log(remittances);
                this.setState({ remittances });
            }
            else {
                console.log(data.error);
            }
        });
    }

    showModal = item => event => {
        console.log(item);

        this.setState({
            visible: true,
            ten_peso_start_first: item.assigned_tickets[0]["10_peso_start_first"],
            ten_peso_start_second: item.assigned_tickets[1]["10_peso_start_second"],
            twelve_peso_start_first: item.assigned_tickets[2]["12_peso_start_first"],
            twelve_peso_start_second: item.assigned_tickets[3]["12_peso_start_second"],
            fifteen_peso_start_first: item.assigned_tickets[4]["15_peso_start_first"],
            fifteen_peso_start_second: item.assigned_tickets[5]["15_peso_start_firstfirst"],
            ten_peso_end_first: item.assigned_tickets[0]["10_peso_end_first"],
            ten_peso_end_second: item.assigned_tickets[1]["10_peso_end_second"],
            twelve_peso_end_first: item.assigned_tickets[2]["12_peso_end_first"],
            twelve_peso_end_second: item.assigned_tickets[3]["12_peso_end_second"],
            fifteen_peso_end_first: item.assigned_tickets[4]["15_peso_end_first"],
            fifteen_peso_end_second: item.assigned_tickets[5]["15_peso_end_firstfirst"],
            km_start: parseInt(item.remittance_details.km_from),
            km_end: parseInt(item.remittance_details.km_to),
            fuel: parseInt(item.remittance_details.fuel_cost),
            others: parseInt(item.remittance_details.other_cost)
        });
    };

    handleConfirm = (e) => {
        console.log(e);
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

    renderDriversList = () => ( <List
        className="driver-list"
        itemLayout="horizontal"
        dataSource={this.state.remittances}
        renderItem={item => (
            <List.Item onClick={this.showModal(item)} className="driver-item">
                <List.Item.Meta
                    avatar={<Avatar
                        src={userDefault}/>}
                    title={<a href="https://ant.design">{item.driver_name}</a>}
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
        const { remittances } = this.state;
        const isLoading = remittances === null;
        return (
            <div className="rem-second-content">
                <div className="content-label">
                    <Icon icon={clockO} size={30}/>
                    <p> I-confirm ang mga remittances </p>
                </div>
                <Modal
                    className="remittance-modal"
                    title="I-kumpirma ang remittance form"
                    visible={this.state.visible}
                    onOk={this.handleConfirm}
                    onCancel={this.handleCancel}
                >
                    <RemittanceForm {...this.state}/>
                </Modal>
                <div className="driver-list-wrapper">
                    {remittances && this.renderDriversList()}
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

    componentDidMount() {
        //persist the page
        // if (localStorage.remittance_page) {
        //     this.setState({
        //         current: parseInt(localStorage.remittance_page)
        //     })
        // }
        this.getDeployedDrivers()
    }


    getDeployedDrivers = () => {
        const { id } = JSON.parse(localStorage.user_staff);
        const data = {
            "supervisor_id": id
        };
        getData('remittances/deployments/deployed_drivers/'+ id).then(data => {
            console.log(data);
            if (!data.error) {
                console.log(data);
                this.setState({
                    deployed_drivers: data.deployed_drivers
                })
            }
            else {
                console.log(data)
            }
        }).catch(error => console.log(error))
    };
    updateDeployedDrivers = () => {
        this.getDeployedDrivers()
    };

    next = () => {
        // makes the page persist on refresh
        const current = this.state.current + 1;
        // console.log(localStorage.remittance_page);
        // !localStorage.remittance_page ? localStorage.remittance_page = 1 :
        //     localStorage.remittance_page = parseInt(localStorage.remittance_page) + 1;
        // console.log(localStorage.remittance_page);
        this.setState({ current });
    };
    endShift = () => {
        // localStorage.remittance_page = 0;
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
            content: <SupervisorSecondContent next={this.next} updateDrivers={this.updateDeployedDrivers}/>,
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
                                            src={users}/>}
                                        title={<p className="deployed-drivers-list-title">{item.driver_name}</p>}
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
