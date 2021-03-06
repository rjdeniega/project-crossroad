import React, { Component } from 'react';
import { List, Avatar, Radio, Button, Modal, message, Select, Icon, Tooltip, Divider, Tag, Popover, Badge, Empty } from 'antd';
import '../revised-style.css';
import { postData } from '../../../../../network_requests/general';

import { TicketDisplay as SubTicketDisplay } from '../deployment phases/pre-deployment';

export class DuringDeployment extends React.Component {
    constructor(props) {
        super(props);
        console.log(this.props.deployedDrivers)
    }

    render() {
        return (
            <div className="phase-container">
                <Header
                    title="During Deployment"
                    description="Monitor deployed drivers"
                />
                <DeploymentList
                    deployedDrivers={this.props.deployedDrivers}
                />
            </div>
        );
    }
}

function Header(props) {
    return (
        <div className="phase-header">
            <h3 className="phase-header-title"> {props.title} </h3>
            <h5 className="phase-header-description"> {props.description} </h5>
        </div>
    );
}

function DeploymentList(props) {
    return (
        <div className="list-container">
            <List
                itemLayout="horizontal"
                dataSource={props.deployedDrivers}
                bordered={true}
                renderItem={
                    item => (
                        <div className="list-detail-container">
                            <List.Item>
                                <DeploymentListDetails
                                    deployment_id={item.id}
                                    id={item.driver.id}
                                    name={item.driver.name}
                                    shuttle={"#" + item.shuttle.shuttle_number + " - " + item.shuttle.plate_number}
                                    route={item.route}
                                    start_time={item.start_time}
                                    tickets="130pcs"
                                    photo={item.driver.photo}
                                    absent_driver={item.absent_driver}
                                    ten_tickets={item.ten_peso_tickets}
                                    twelve_tickets={item.twelve_peso_tickets}
                                    fifteen_tickets={item.fifteen_peso_tickets}
                                />
                            </List.Item>
                        </div>
                    )
                }
            />
        </div>
    );
}


function DeploymentListDetails(props) {
    const driver_id = props.id;
    const driver_name = props.name;
    const supervisor = JSON.parse(localStorage.user_staff);
    const absent_driver = props.absent_driver

    if (props.route == 'Main Road' || props.route == 'Main Route' || props.route == 'M') {
        var route_label = 'Main Road'
        var tag_color = 'blue';
        var isMainRoad = true;
    }
    else if (props.route == 'Kaliwa' || props.route == 'Left Route' || props.route == 'L') {
        var tag_color = 'orange';
        var route_label = 'Left Route';
        var isMainRoad = false;
    }
    else {
        var tag_color = 'green';
        var route_label = 'Right Route';
        var isMainRoad = false;
    }


    if (typeof absent_driver == "undefined") {
        return (
            <div>
                <div className="deployment-header">
                    <Avatar
                        src={props.photo}
                        style={{ backgroundColor: '#68D3B7' }}
                        shape="square"
                        icon="user"
                    />
                    <span className="deployment-name">
                        {props.name}
                    </span>
                    <Tag color={tag_color} className="route-tag">
                        {route_label}
                    </Tag>
                </div>

                <div className="deployment-list-container">
                    <DetailItems
                        title="Shuttle"
                        value={props.shuttle}
                    />
                    <DetailItems
                        title="Start Time"
                        value={props.start_time}
                    />

                    <div className="ticket-tags-container">
                        <TicketDisplay
                            amount="₱10"
                            tickets={props.ten_tickets}
                        />
                        <TicketDisplay
                            amount="₱12"
                            tickets={props.twelve_tickets}
                        />
                        {isMainRoad &&
                            <TicketDisplay
                                amount="₱15"
                                tickets={props.fifteen_tickets}
                            />
                        }
                    </div>
                </div>

                <StopDeploymentButton
                    supervisor_id={supervisor.id}
                    driver_id={props.driver_id}
                    driver_name={driver_name}
                    deployment_id={props.deployment_id}
                    route={route_label}
                    shuttle={props.shuttle}
                />
            </div>
        );
    } else {
        const prompt_text = props.name + " was subbed in for " + absent_driver.name

        return (
            <div>
                <div className="deployment-header">
                    <Tooltip title={prompt_text} placement="topLeft">
                        <Avatar
                            src={absent_driver.photo}
                            style={{ backgroundColor: '#68D3B7' }}
                            shape="square"
                            icon="user"
                        />
                        <Icon type="arrow-right" className="sub-arrow" />
                        <Avatar
                            src={props.photo}
                            style={{ backgroundColor: '#68D3B7' }}
                            shape="square"
                            icon="user"
                        />
                        <span className="deployment-name">
                            {props.name}
                        </span>
                        <Tag color={tag_color} className="route-tag">
                            {route_label}
                        </Tag>
                    </Tooltip>
                </div>

                <div className="deployment-list-container">
                    <DetailItems
                        title="Shuttle"
                        value={props.shuttle}
                    />
                    <DetailItems
                        title="Start Time"
                        value={props.start_time}
                    />

                    <div className="ticket-tags-container">
                        <TicketDisplay
                            amount="₱10"
                            tickets={props.ten_tickets}
                        />
                        <TicketDisplay
                            amount="₱12"
                            tickets={props.twelve_tickets}
                        />
                        {isMainRoad &&
                            <TicketDisplay
                                amount="₱15"
                                tickets={props.fifteen_tickets}
                            />
                        }
                    </div>
                </div>

                <StopDeploymentButton
                    supervisor_id={supervisor.id}
                    driver_id={props.driver_id}
                    driver_name={driver_name}
                    deployment_id={props.deployment_id}
                    route={route_label}
                    shuttle={props.shuttle}
                />
            </div>
        );
    }
}

function TicketDisplay(props) {

    if (props.tickets.length > 0) {
        var content = (
            props.tickets.map((item) => (
                <div className="ticket-wrapper">
                    <span className="ticket-label">
                        Ticket No.:
                    </span>
                    <span>
                        {item.range_from} - {item.range_to}
                    </span>
                </div>
            ))
        )

        return (
            <span className="ticket-tag-wrapper">
                <Popover content={content} title={props.amount + " tickets"}>
                    <Tag className="ticket-tag">
                        {props.amount}
                    </Tag>
                </Popover>
            </span>

        );

    } else {
        var content = (
            <Empty
                description={(
                    <a href={"http://localhost:3000/tickets"}>
                        Assign tickets to driver
                    </a>
                )}
            />
        )

        return (
            <span className="ticket-tag-wrapper">
                <Popover content={content} title={props.amount + " tickets"}>
                    <Badge dot>
                        <Tag className="ticket-tag">
                            {props.amount}
                        </Tag>
                    </Badge>
                </Popover>
            </span>

        );
    }


}

function DetailItems(props) {
    return (
        <div className="detail-container">
            <span className="detail-items-title">
                {props.title}:
            </span>
            <span className="detail-items-value">
                {props.value}
            </span>
        </div>
    );
}

class StopDeploymentButton extends React.Component {
    constructor(props) {
        super(props)

        this.handleShuttleChange = this.handleShuttleChange.bind(this);
        this.handleDriverChange = this.handleDriverChange.bind(this);

        const shuttleBreakdown = (
            <ShuttleBreakdown
                deployment_id={this.props.deployment_id}
                driver_name={this.props.driver_name}
                route={this.props.route}
                onSelectChange={this.handleShuttleChange}
            />
        )

        this.state = {
            modal_visibility: false,
            tooltip_message: null,
            modal_body: 1,
            content: shuttleBreakdown,
            shuttle_replacement: null,
            confirmLoading: false,
            is_disabled: true,
            'ten_peso_tickets': [],
            'twelve_peso_tickets': [],
            'fifteen_peso_tickets': [],
            'ten_total': 0,
            'twelve_total': 0,
            'fifteen_total': 0
        }
    }

    componentDidMount() {
        this.setState({
            tooltip_message: "shuttle breakdown is when the driver's shuttle breaksdown mid-deployment"
        })
    }

    showModal = () => {
        this.setState({
            modal_visibility: true
        });
    }

    handleCancel = () => {
        this.setState({
            modal_visibility: false,
        });
    }

    handleOk = () => {
        this.setState({
            confirmLoading: true,
        })

        console.log(this.state.modal_body)
        if (this.state.modal_body == 1) {
            this.handleBreakdownRedeploy()
        } else if (this.state.modal_body == 2) {
            this.handleDriverRedeploy()
        } else {
            this.handleAccident()
        }

        setTimeout(() => {
            this.setState({
                modal_visibility: false,
                confirmLoading: false,
            });
        }, 1000);
    }

    handleBreakdownRedeploy() {
        console.log(this.props.deployment_id)
        console.log(this.state.shuttle_replacement)
        let breakdown = {
            'deployment_id': this.props.deployment_id,
            'shuttle_id': this.state.shuttle_replacement
        }

        postData('remittances/deployments/shuttle-breakdown/redeploy/', breakdown)
            .then(response => {
                if (!response.error) {
                    message.success("Driver has been redeployed with a new shuttle");
                } else {
                    console.log(response.error);
                }
            });
    }

    handleDriverRedeploy() {
        let earlyleave = {
            'deployment_id': this.props.deployment_id,
            'driver_id': this.state.driver_replacement
        }

        let notice = "Driver has been deployed for " + this.props.driver_name

        postData('remittances/deployments/early-leave/redeploy/', earlyleave)
            .then(response => {
                if (!response.error) {
                    message.success(notice);
                } else {
                    console.log(response.error);
                }
            });
    }

    handleAccident() {
        let data = {
            "deployment_id": this.props.deployment_id
        }

        let notice = "Deployment stopped because of an accident"

        postData('remittances/deployments/accident/', data)
            .then(response => {
                if (!response.error) {
                    message.success(notice);
                } else {
                    console.log(response.error);
                }
            });
    }

    handleShuttleChange(value) {
        this.setState({
            shuttle_replacement: value,
            is_disabled: false
        });
    }

    handleDriverChange(value) {
        this.setState({
            driver_replacement: value
        });
        this.fetchSubDriverTickets(value)
    }

    fetchSubDriverTickets(sub_driver_id) {
        console.log('entered here', sub_driver_id)
        fetch('/remittances/tickets/driver/' + sub_driver_id)
            .then(response => {
                return response;
            })
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    if (this.props.route == 'Main Road' || this.props.route == 'M' || this.props.route == 'Main Route') {
                        console.log(this.state.ten_total)
                        if (data.ten_total >= 50 && data.twelve_total >= 80 && data.fifteen_total >= 50)
                            var is_disabled = false
                        else
                            var is_disabled = true
                    } else {
                        if (data.ten_total >= 50 && data.twelve_total >= 80)
                            var is_disabled = false
                        else
                            var is_disabled = true
                    }
                    console.log(this.state.is_disabled)
                    const earlyLeave = (
                        <EarlyLeave
                            deployment_id={this.props.deployment_id}
                            driver_name={this.props.driver_name}
                            route={this.props.route}
                            shuttle={this.props.shuttle}
                            onSelectChange={this.handleDriverChange}
                            ten_peso_tickets={data.ten_peso_tickets}
                            twelve_peso_tickets={data.twelve_peso_tickets}
                            fifteen_peso_tickets={data.fifteen_peso_tickets}
                            ten_total={data.ten_total}
                            twelve_total={data.twelve_total}
                            fifteen_total={data.fifteen_total}
                        />
                    )

                    this.setState({
                        ten_total: data.ten_total,
                        ten_peso_tickets: data.ten_peso_tickets,
                        twelve_total: data.twelve_total,
                        twelve_peso_tickets: data.twelve_peso_tickets,
                        fifteen_total: data.fifteen_total,
                        fifteen_peso_tickets: data.fifteen_peso_tickets,
                        is_disabled: is_disabled,
                        content: earlyLeave
                    });

                    console.log(this.state.ten_total)
                }
                else {
                    console.log(data.error)
                }
            }).catch(error => console.log(error));
    }

    handleSelectChange = (value) => {
        let modal_body = value;
        let breakdown_message = "shuttle breakdown is when the driver's shuttle breaksdown mid-deployment";
        let earlyend_message = "early leave of driver is when the driver requests for an early end of deployment for personal reasons";
        let accident_message = "accident is when the driver met with an unexpected accident that makes him/her unable to continue the deployment";

        if (value == 1)
            var tooltip_message = breakdown_message;
        else if (value == 2)
            var tooltip_message = earlyend_message;
        else
            var tooltip_message = accident_message;

        let is_disabled = (value == 1 || value == 3) ? false : true;

        //clear tickets when it returns to shuttleBreakdown
        if (value == 1) {
            this.setState({
                'ten_peso_tickets': [],
                'twelve_peso_tickets': [],
                'fifteen_peso_tickets': [],
                'ten_total': 0,
                'twelve_total': 0,
                'fifteen_total': 0
            })
        }

        const shuttleBreakdown = (
            <ShuttleBreakdown
                deployment_id={this.props.deployment_id}
                driver_name={this.props.driver_name}
                route={this.props.route}
                onSelectChange={this.handleShuttleChange}
            />
        )

        const earlyLeave = (
            <EarlyLeave
                deployment_id={this.props.deployment_id}
                driver_name={this.props.driver_name}
                route={this.props.route}
                shuttle={this.props.shuttle}
                onSelectChange={this.handleDriverChange}
                ten_peso_tickets={this.state.ten_peso_tickets}
                twelve_peso_tickets={this.state.twelve_peso_tickets}
                fifteen_peso_tickets={this.state.fifteen_peso_tickets}
                ten_total={this.state.ten_total}
                twelve_total={this.state.twelve_total}
                fifteen_total={this.state.fifteen_total}
            />
        )

        const accident = (
            <Accident
            />
        )

        if (value == 1)
            var content = shuttleBreakdown;
        else if (value == 2)
            var content = earlyLeave;
        else
            var content = accident;


        this.setState({
            modal_body: modal_body,
            tooltip_message: tooltip_message,
            content: content,
            is_disabled: is_disabled
        });
    }

    render() {
        const Option = Select.Option

        return (
            <div className="deployment-button-container">
                <Button
                    type="danger"
                    className="deployment-button"
                    onClick={this.showModal}
                >
                    Stop
                </Button>

                <Modal
                    title="Stop Deployment"
                    visible={this.state.modal_visibility}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    confirmLoading={this.state.confirmLoading}
                    okButtonProps={this.state.is_disabled ?
                        { disabled: true } : { disabled: false }
                    }
                >
                    <div className="modal-container">
                        <span className="stop-deployment-modal-select">
                            <label className="reason-label">
                                Reason for Termination
                                <Tooltip title={this.state.tooltip_message} className="info-circle">
                                    <Icon type="question-circle" />
                                </Tooltip>
                                :
                            </label>
                            <Select
                                defaultValue='1'
                                style={{ width: 200 }}
                                onChange={this.handleSelectChange}
                                className="reason-select"
                            >
                                <Option value='1'>Shuttle Breakdown</Option>
                                <Option value='2'>Early Leave of Driver</Option>
                                <Option value='3'>Accident</Option>
                            </Select>

                        </span>
                        {this.state.content}
                    </div>
                </Modal>
            </div>
        );
    }
}


class Accident extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const RadioGroup = Radio.Group;
        return (
            <div>
                <Divider />
            </div>

        );
    }
}


class ShuttleBreakdown extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            availableShuttles: [],
        }

        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.fetchAvailableShuttles();
    }

    fetchAvailableShuttles() {
        console.log(this.props.deployment_id)
        fetch('/remittances/deployments/' + this.props.deployment_id + '/available-shuttles')
            .then(response => {
                return response;
            })
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    this.setState({
                        availableShuttles: data.shuttles
                    });
                }
                else {
                    console.log(data.error)
                }
            }).catch(error => console.log(error));
    }

    handleChange(value) {
        this.props.onSelectChange(value);
    }

    render() {
        const { Option, OptGroup } = Select;
        return (
            <div>
                <Divider orientation="left">
                    Redeploy with a new shuttle
                </Divider>
                <ModalDetails
                    title="Driver"
                    value={this.props.driver_name}
                />
                <label className="modal-detail-title">Available Shuttles: </label>
                <Select
                    style={{ width: 200 }}
                    onChange={this.handleChange}
                    className="modal-detail-value"
                >
                    <OptGroup label="Back-up Shuttles">
                        {
                            this.state.availableShuttles.map((item) => {
                                if (item.route == 'B')
                                    return (
                                        <option value={item.id} key={item.id}>
                                            Shuttle#{item.shuttle_number} - {item.plate_number}
                                        </option>
                                    )
                            })
                        }
                    </OptGroup>
                    <OptGroup label="Other Available Shuttles">
                        {
                            this.state.availableShuttles.map((item) => {
                                if (item.route != 'B')
                                    return (
                                        <option value={item.id} key={item.id}>
                                            Shuttle#{item.shuttle_number} - {item.plate_number}
                                        </option>
                                    )
                            })
                        }
                    </OptGroup>
                </Select>
                <ModalDetails
                    title="Route"
                    value={this.props.route}
                />
            </div>
        );
    }
}

function ModalDetails(props) {
    return (
        <div className="modal-detail-container">
            <span className="modal-detail-title">
                {props.title}:
            </span>
            <span className="modal-detail-value">
                {props.value}
            </span>
        </div>
    );
}

class EarlyLeave extends React.Component {
    constructor(props) {
        super(props)

        super(props)
        this.state = {
            availableDrivers: [],
        }

        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.fetchAvailableDrivers()
    }

    fetchAvailableDrivers() {
        console.log(this.props.deployment_id)
        fetch('/remittances/deployments/' + this.props.deployment_id + '/available-drivers')
            .then(response => {
                return response;
            })
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    this.setState({
                        availableDrivers: data.available_drivers
                    });
                }
                else {
                    console.log(data.error)
                }
            }).catch(error => console.log(error));
    }

    handleChange(value) {
        this.props.onSelectChange(value);
    }

    render() {
        const { Option, OptGroup } = Select;
        return (
            <div>
                <Divider orientation="left">
                    Redeploy with a replacement driver
                </Divider>
                <label className="modal-detail-title">Available Drivers: </label>
                <Select 
                    style={{ width: 200 }}
                    onChange={this.handleChange}
                    className="modal-detail-value"
                    >
                    <OptGroup label="Supervisor">
                        {
                            this.state.availableDrivers.map((item) => {
                                if (item.is_supervisor == true)
                                    return (
                                        <option value={item.id} key={item.id}>
                                            {item.name}
                                        </option>
                                    )

                            })
                        }
                    </OptGroup>
                    <OptGroup label="Other Drivers">
                        {
                            this.state.availableDrivers.map((item) => {
                                if (item.is_supervisor == false)
                                    return (
                                        <option value={item.id} key={item.id}>
                                            {item.name}
                                        </option>
                                    )

                            })
                        }
                    </OptGroup>
                </Select>
                <ModalDetails
                    title="Shuttle"
                    value={this.props.shuttle}
                />
                <ModalDetails
                    title="Route"
                    value={this.props.route}
                />
                <div className="ticket-tags-container">
                    <SubTicketDisplay
                        amount="₱10"
                        tickets={this.props.ten_peso_tickets}
                        total={this.props.ten_total}
                    />
                    <SubTicketDisplay
                        amount="₱12"
                        tickets={this.props.twelve_peso_tickets}
                        total={this.props.twelve_total}
                    />
                    {this.props.route == 'Main Road' &&
                        <SubTicketDisplay
                            amount="₱15"
                            tickets={this.props.fifteen_peso_tickets}
                            total={this.props.fifteen_total}
                        />
                    }
                </div>
            </div>
        );
    }
}
