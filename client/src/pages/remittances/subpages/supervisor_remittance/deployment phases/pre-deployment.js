import React, { Component } from 'react';
import { List, Avatar, Button, Tag } from 'antd';
import '../revised-style.css';
import { UserAvatar } from '../../../../../components/avatar/avatar';

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
        const supervisor_id = JSON.parse(localStorage.user_staff);

        fetch('/remittances/shifts/assigned_drivers/1')
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
                                    name={item.driver.name}
                                    shuttle={ "#" + item.shuttle.shuttle_number + " - " + item.shuttle.plate_number}
                                    route={item.shuttle.route}
                                    expected_departure= "5:30pm"
                                    tickets= "130pcs"
                                    photo={item.driver.photo}
                                />
                                <div className="deployment-button-container">
                                    <Button className="deployment-button">
                                        Sub
                                        </Button>
                                    <Button type="primary" className="deployment-button">
                                        Deploy
                                        </Button>
                                </div>
                            </List.Item>
                        </div>
                    )
                }
            />
        </div>
    );
}

function DeploymentListDetails(props) {
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