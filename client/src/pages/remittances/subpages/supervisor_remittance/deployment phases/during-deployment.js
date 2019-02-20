import React, { Component } from 'react';
import { List, Avatar, Button, Modal, message, Select, Icon, Tooltip } from 'antd';
import '../revised-style.css';
import { postData } from '../../../../../network_requests/general';


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
                                    route={item.shuttle.route}
                                    start_time={item.start_time}
                                    tickets="130pcs"
                                    photo={item.driver.photo}
                                    absent_driver={item.absent_driver}
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

    if (typeof absent_driver == "undefined") {
        return (
            <div>
                <div className="deployment-header">
                    <Avatar src={props.photo} shape="square" />
                    <span className="deployment-name">
                        {props.name}
                    </span>
                </div>

                <div className="deployment-list-container">
                    <DetailItems
                        title="Shuttle"
                        value={props.shuttle}
                    />
                    <DetailItems
                        title="Route"
                        value={props.route}
                    />
                    <DetailItems
                        title="Start Time"
                        value={props.start_time}
                    />
                    <DetailItems
                        title="Tickets Onhand"
                        value={props.tickets}
                    />
                </div>

                <StopDeploymentButton
                    supervisor_id={supervisor.id}
                    driver_id={props.driver_id}
                    driver_name={driver_name}
                    deployment_id={props.deployment_id}
                    route={props.route}
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
                        <Avatar src={absent_driver.photo} shape="square" />
                        <Icon type="arrow-right" className="sub-arrow" />
                        <Avatar src={props.photo} shape="square" />
                        <span className="deployment-name">
                            {props.name}
                        </span>
                    </Tooltip>
                </div>

                <div className="deployment-list-container">
                    <DetailItems
                        title="Shuttle"
                        value={props.shuttle}
                    />
                    <DetailItems
                        title="Route"
                        value={props.route}
                    />
                    <DetailItems
                        title="Start Time"
                        value={props.start_time}
                    />
                    <DetailItems
                        title="Tickets Onhand"
                        value={props.tickets}
                    />
                </div>

                <StopDeploymentButton
                    supervisor_id={supervisor.id}
                    driver_id={props.driver_id}
                    driver_name={driver_name}
                    deployment_id={props.deployment_id}
                    route={props.route}
                    shuttle={props.shuttle}
                />
            </div>
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
            confirmLoading: false
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

        if (this.state.modal_body == 1) {
            this.handleBreakdownRedeploy()
        } else {

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

    handleShuttleChange(value) {
        this.setState({
            shuttle_replacement: value
        });
    }

    handleDriverChange(value) {
        this.setState({
            driver_replacement: value
        });
    }

    handleSelectChange = (value) => {
        let modal_body = ((value == 1) ? 2 : 1);
        let breakdown_message = "shuttle breakdown is when the driver's shuttle breaksdown mid-deployment";
        let earlyend_message = "early leave of driver is when the driver requests for an early end of deployment for personal reasons";
        let tooltip_message = ((value == 1) ? breakdown_message : earlyend_message);

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
            />
        )

        let content = (value == 1) ? shuttleBreakdown : earlyLeave;

        this.setState({
            modal_body: modal_body,
            tooltip_message: tooltip_message,
            content: content
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
                >
                    <span className="stop-deployment-modal-select">
                        <label>
                            Reason for Termination:
                        </label>
                        <Select
                            defaultValue='1'
                            style={{ width: 200 }}
                            onChange={this.handleSelectChange}
                        >
                            <Option value='1'>Shuttle Breakdown</Option>
                            <Option value='2'>Early Leave of Driver</Option>
                        </Select>
                        <Tooltip title={this.state.tooltip_message}>
                            <Icon type="question-circle" />
                        </Tooltip>
                    </span>
                    {this.state.content}
                </Modal>
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
        return (
            <div>
                <div>
                    Redeploy with a new shuttle
                </div>
                <DetailItems
                    title="Driver"
                    value={this.props.driver_name}
                />
                <label>Available Shuttles: </label>
                <Select style={{ width: 200 }} onChange={this.handleChange}>
                    {
                        this.state.availableShuttles.map((item) => (
                            <option value={item.id} key={item.id}>
                                Shuttle#{item.shuttle_number} - {item.plate_number}
                            </option>
                        ))
                    }
                </Select>
                <DetailItems
                    title="Route"
                    value={this.props.route}
                />
            </div>
        );
    }
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

    componentDidMount(){
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
        return (
            <div>
                <div>
                    Redeploy with a replacement driver
                </div>
                <label>Available Drivers: </label>
                <Select style={{ width: 200 }} onChange={this.handleChange}>
                    {
                        this.state.availableDrivers.map((item) => (
                            <option value={item.id} key={item.id}>
                                {item.name}
                            </option>
                        ))
                    }
                </Select>
                <DetailItems
                    title="Shuttle"
                    value={this.props.shuttle}
                />
                <DetailItems
                    title="Route"
                    value={this.props.route}
                />
            </div>
        );
    }
}
