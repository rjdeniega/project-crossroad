import { Row, Col } from 'antd';
import React, { Component } from 'react';
import { Header } from '../../components/header/remittance_header';
import { PreDeployment } from './deployment phases/pre-deployment';
import { DuringDeployment } from './deployment phases/during-deployment';
import { PostDeployment } from './deployment phases/post-deployment';

import './revised-style.css'

export class SupervisorRemittance extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'plannedDrivers': [],
        }
    }

    componentDidMount(){
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
            <div className="page-container">
                <Header />
                <Row className="remittance-body" gutter={16}>
                    <Col span={8}>
                        <PreDeployment 
                            onListChange={this.fetchPlannedDrivers}
                            plannedDrivers={this.state.plannedDrivers}
                        />
                    </Col>
                    <Col span={8}>
                        <DuringDeployment />
                    </Col>
                    <Col span={8}>
                        <PostDeployment />
                    </Col>
                </Row>
            </div>
        );
    }
}