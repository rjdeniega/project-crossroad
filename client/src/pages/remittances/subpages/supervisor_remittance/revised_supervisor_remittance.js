import { Row, Col, Alert } from 'antd';
import React, { Component } from 'react';
import { Header } from '../../components/header/remittance_header';
import { PreDeployment } from './deployment phases/pre-deployment';
import { DuringDeployment } from './deployment phases/during-deployment';
import { PostDeployment } from './deployment phases/post-deployment';

import PerfectScrollbar from '@opuscapita/react-perfect-scrollbar';

import './revised-style.css'

export class SupervisorRemittance extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'disabled': "No",
            'plannedDrivers': [],
            'deployedDrivers': [],
            'pendingDeployments': []
        }

        this.fetchPlannedDrivers = this.fetchPlannedDrivers.bind(this);
        this.fetchDeployedDrivers = this.fetchDeployedDrivers.bind(this);
        this.fetchPendingDeployments = this.fetchPendingDeployments.bind(this);
    }

    componentDidMount() {
        this.fetchDeployedDrivers();
        this.fetchPlannedDrivers();
        this.fetchPendingDeployments();
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
                    console.log(data);
                    this.setState({
                        plannedDrivers: data.non_deployed_drivers,
                        disabled: data.disabled
                    });
                }
                else {
                    console.log(data.error)
                }
            }).catch(error => console.log(error));
    }

    fetchPendingDeployments() {
        const supervisor = JSON.parse(localStorage.user_staff);
        fetch('/remittances/remittance_form/pending/' + supervisor.id)
            .then(response => {
                return response;
            })
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    this.setState({
                        pendingDeployments: data.deployments
                    });
                }
                else {
                    console.log(data.error)
                }
            }).catch(error => console.log(error));
    }

    fetchDeployedDrivers() {
        const supervisor = JSON.parse(localStorage.user_staff);
        fetch('/remittances/deployments/deployed_drivers/' + supervisor.id)
            .then(response => {
                return response;
            })
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    this.setState({
                        deployedDrivers: data.deployed_drivers
                    });
                }
                else {
                    console.log(data.error)
                }
            }).catch(error => console.log(error));
    }

    render() {
        return (
            <div className="page-container">
                <PerfectScrollbar>
                    <Header />
                    <Row className="remittance-body" gutter={16}>
                        {console.log(this.state.disabled)}
                        {console.log(this.state.disabled=="AM")}
                        {this.state.disabled == "AM" &&
                            <Col span={8}>
                                <Alert
                                    message="AM Disabled"
                                    description="AM Driver deployment at this hour is restricted"
                                    type="warning"
                                    showIcon
                                />
                            </Col>
                        }
                        {this.state.disabled == "PM" &&
                            <Col span={8}>
                                <Alert
                                    message="PM Disabled"
                                    description="PM Driver deployment at this hour is restricted"
                                    type="warning"
                                    showIcon
                                />
                            </Col>
                        }


                        {this.state.disabled == "No" &&
                        <Col span={8}>
                            <PreDeployment
                                plannedDrivers={this.state.plannedDrivers}
                                is_disabled={this.state.disabled}
                            />
                        </Col>
                        }
                        <Col span={8}>
                            <DuringDeployment
                                deployedDrivers={this.state.deployedDrivers}
                            />
                        </Col>
                        <Col span={8}>
                            <PostDeployment
                                pendingDeployments={this.state.pendingDeployments}
                            />
                        </Col>
                    </Row>
                </PerfectScrollbar>
            </div>
        );
    }
}