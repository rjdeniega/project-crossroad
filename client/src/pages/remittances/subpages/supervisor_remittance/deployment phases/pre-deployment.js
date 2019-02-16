import React, { Component } from 'react';
import { List, Avatar, Button, Modal, message } from 'antd';
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
        fetch('/remittances/shifts/assigned_drivers/' + supervisor.id)
            .then(response => {
                return response;
            })
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    this.setState({
                        plannedDrivers: data.drivers_assigned
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
                                    expected_departure="5:30pm"
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
    const confirm = Modal.confirm;
    const driver_id = props.id;
    const driver_name = props.name;
    const supervisor = JSON.parse(localStorage.user_staff);

    function showConfirm() {
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
        let deploy = {
            'supervisor_id': supervisor.id,
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


            <div className="deployment-button-container">
                <Button className="deployment-button">
                    Sub
                 </Button>
                <Button
                    type="primary"
                    className="deployment-button"
                    onClick={showConfirm}
                >
                    Deploy
                </Button>
            </div>
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
