import React, { Component } from 'react';
import { List, Avatar, Button } from 'antd';
import '../revised-style.css';
import { UserAvatar } from '../../../../../components/avatar/avatar';

export class PreDeployment extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="phase-container">
                <Header
                    title="Pre-Deployment"
                    description="Deploy drivers for the day"
                />
                <DeploymentList />
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

class DeploymentList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            deployments: [
                {
                    name: "Paolo",
                    shuttle: "Number 1",
                    route: "Kaliwa",
                    expected_departure: "5:00am",
                    tickets: "120 pcs"
                },
                {
                    name: "Trisha",
                    shuttle: "Number 2",
                    route: "Kanan",
                    expected_departure: "7:30am",
                    tickets: "50 pcs"
                },
            ]
        }
    }

    render() {
        return (
            <div className="list-container">
                <List
                    itemLayout="horizontal"
                    dataSource={this.state.deployments}
                    header="Deployments"
                    bordered={true}
                    renderItem={
                        item => (
                            <div className="list-detail-container">
                                <List.Item>
                                    <DeploymentListDetails
                                        name={item.name}
                                        shuttle={item.shuttle}
                                        route={item.route}
                                        expected_departure={item.expected_departure}
                                        tickets={item.tickets}
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
}

function DeploymentListDetails(props) {
    return (
        <div>
            <div className="deployment-header">
                <Avatar icon="user" />
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