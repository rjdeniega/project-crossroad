import React, { Component } from 'react';
import { List, Avatar, Button, Modal, message, Select } from 'antd';
import '../revised-style.css';
import { UserAvatar } from '../../../../../components/avatar/avatar';
import { postData } from '../../../../../network_requests/general';

export class PreDeployment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            plannedDrivers: [],
        }
    }

    componentDidMount() {
        this.fetchPlannedDrivers();
    }

    fetchPlannedDrivers() {
        const supervisor = JSON.parse(localStorage.user_staff);
        fetch('/remittances/shifts/pending_drivers/' + supervisor.id)
            .then(response => {
                return response;
            })
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    this.setState({
                        plannedDrivers: data.non_deployed_drivers
                    });
                }
                else {
                    console.log(data.error)
                }
            }).catch(error => console.log(error));
    }

    render() {
        return (
            <div className="phase-container">
                <Header
                    title="Pre-Deployment"
                    description="Deploy drivers for the day"
                />
                <DeploymentList
                    plannedDrivers={this.state.plannedDrivers}
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
                dataSource={props.plannedDrivers}
                bordered={true}
                renderItem={
                    item => (
                        <div className="list-detail-container">
                            <List.Item>
                                <DeploymentListDetails
                                    id={item.driver.id}
                                    name={item.driver.name}
                                    shuttle={"#" + item.shuttle.shuttle_number + " - " + item.shuttle.plate_number}
                                    route={item.shuttle.route}
                                    expected_departure={item.expected_departure}
                                    tickets="130pcs"
                                    photo={item.driver.photo}
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
                    title="Expected Departure"
                    value={props.expected_departure}
                />
                <DetailItems
                    title="Tickets Onhand"
                    value={props.tickets}
                />
            </div>

            <DeploymentButtons
                supervisor_id={supervisor.id}
                driver_id={driver_id}
                driver_name={driver_name}
                shuttle={props.shuttle}
                route={props.route}
            />
        </div>
    );
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

function DeploymentButtons(props) {
    const supervisor_id = props.supervisor_id
    const driver_id = props.driver_id
    const driver_name = props.driver_name

    function showConfirm() {
        const confirm = Modal.confirm;

        confirm({
            title: 'Are you sure you want to deploy this driver?',
            content: 'Deploying this driver would start his/her time for the shift.',

            onOk() {
                handleDeploy();

                return new Promise((resolve, reject) => {
                    setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
                }).catch(() => console.log('Oops errors!'));
            },

            onCancel() { },
        });
    }

    function handleDeploy() {
        console.log(supervisor_id)
        let deploy = {
            'supervisor_id': supervisor_id,
            'driver_id': driver_id
        }

        postData('remittances/deployments/', deploy)
            .then(response => {
                if (!response.error) {
                    message.success(driver_name + " has been deployed");
                } else {
                    console.log(response.error);
                }
            });
    }

    return (
        <div className="deployment-button-container">
            <SubButton 
                shuttle={props.shuttle}
                route={props.route}
                driver_id={props.driver_id}
                supervisor_id={supervisor_id}
                driver_name={driver_name}
            />
            <Button
                type="primary"
                className="deployment-button"
                onClick={showConfirm}
            >
                Deploy
            </Button>
        </div>
    );
}

class SubButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'modal_is_visible': false,
            'driver_id': this.props.driver_id,
            'sub_driver_id': null,
        }
        this.handleSubDriverChange = this.handleSubDriverChange.bind(this);
    }

    showModal = () => {
        this.setState({
            'modal_is_visible': true,
        });
    }

    handleOk = () => {
        this.handleDeploy();

        this.setState({
            'modal_is_visible': false,
        });
    }

    handleCancel = () => {
        this.setState({
            'modal_is_visible': false,
        });
    }

    handleSubDriverChange(sub_driver_id) {
        this.setState({
            'sub_driver_id': sub_driver_id
        });
    }

    handleDeploy() {
        let deploy = {
            'supervisor_id': this.props.supervisor_id,
            'driver_id': this.state.sub_driver_id,
            'absent_id': this.state.driver_id
        }

        postData('remittances/deployments/deploy-sub/', deploy)
            .then(response => {
                if (!response.error) {
                    message.success("A sub-driver has been deployed for " + this.props.driver_name);
                } else {
                    console.log(response.error);
                }
            });
    }

    render() {
        return (
            <div className="subButton-container">
                <Button className="deployment-button" onClick={this.showModal}>
                    Sub
                </Button>
                <Modal
                    title="Deploy a sub-driver"
                    visible={this.state.modal_is_visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    okText="Deploy"
                >
                    <SubContent 
                        onSelectChange={this.handleSubDriverChange}
                        supervisor_id={this.props.supervisor_id}
                        shuttle={this.props.shuttle}
                        driver_name={this.props.driver_name}
                        route={this.props.route}
                    />
                </Modal>
            </div>
        );
    }
}

class SubContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'supervisor_id': this.props.supervisor_id,
            'subDrivers': [],
        };
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount(){
        this.fetchSubDrivers();
    }

    fetchSubDrivers() {
        console.log(this.state.supervisor_id)
        fetch('/remittances/shifts/sub_drivers/' + this.state.supervisor_id)
            .then(response => {
                return response;
            })
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    this.setState({
                        subDrivers: data.sub_drivers
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
                    <span className="select-group">
                        <label>Subdrivers: </label>
                        <Select onChange={this.handleChange} style={{ width: 200 }}>
                            {
                                this.state.subDrivers.map((item) => (
                                    <option value={item.driver.id} key={item.driver.id}>
                                        {item.driver.name}
                                    </option>
                                ))
                            }
                        </Select>
                    </span>
                </div>
                <div>
                    <span>Deployment Details</span>
                    <DetailItems
                        title="Subbing in for "
                        value={this.props.driver_name}
                    />
                    <DetailItems
                        title="Shuttle: "
                        value={this.props.shuttle}
                    />
                    <DetailItems
                        title="Route: "
                        value={this.props.route}
                    />
                </div>
            </div>
        );
    }
}