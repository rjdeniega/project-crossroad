import React, { Component } from 'react';
import { Header } from '../../components/header/remittance_header';
import { Row, Col, Tag, Drawer, Button, List } from 'antd';

import './revised-style.css'

export class DriverRemittance extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="page-container">
                <Header />
                <Row className="remittance-body">
                    <Col span={24}>
                        <DeploymentList />
                    </Col>
                </Row>
            </div>
        );
    }
}

class DeploymentList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'deployments': [],
            'drawer_visibility': false
        }
    }

    showDrawer() {
        this.setState({
            drawer_visibility: true,
        })
    }

    onClose() {
        this.setState({
            drawer_visibility: false
        })
    }

    componentDidMount() {
        this.fetchDeployments();
    }

    fetchDeployments() {
        const driver = JSON.parse(localStorage.user_staff);
        fetch('/remittances/deployments/driver/' + driver.id)
            .then(response => {
                return response;
            })
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    this.setState({
                        deployments: data.deployments
                    });
                }
                else {
                    console.log(data.error)
                }
            }).catch(error => console.log(error));
    }

    render() {


        return (
            <div className="list-container">
                <List
                    header={<div> List of Deployments </div>}
                    dataSource={this.state.deployments}
                    bordered={true}
                    renderItem={
                        item => (
                            <div className="list-detail-container">
                                <List.Item>
                                    <DeploymentListDetails
                                        id={item.id}
                                        date={item.shift_date}
                                        start_time={item.start_time}
                                        end_time={item.end_time}
                                        status={item.status}
                                        shuttle={item.shuttle}
                                    />
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
    let tag_color = props.status == 'O' ? 'blue' : 'green';
    let status = props.status == 'O' ? 'Ongoing' : 'Finished';
    let end_time = props.end_time == null ? 'N/A' : props.end_time;
    return (
        <div className="deployment-list-container">
            <div className="list-header">
                <span className="list-header-date">
                    {props.date}
                </span>
                <Tag color={tag_color}>
                    {status}
                </Tag>
            </div>
            <div className="list-details">
                <DetailItem
                    title="Shuttle"
                    value={props.shuttle}
                />
                <DetailItem
                    title="Start Time"
                    value={props.start_time}
                />
                <DetailItem
                    title="End Time"
                    value={end_time}
                />
            </div>
            <SubmitRemittance />
        </div>
    );
}

class SubmitRemittance extends React.Component {
    constructor(props){
        super(props);
    }

    render() {
        return (
            <div className="button-container">
                <Button className="list-action">Submit Remittance</Button>
            </div>
        );
    }
}

function DetailItem(props) {
    return (
        <div>
            <span className="detail-item-title">{props.title}: </span>
            <span className="detail-item-value">{props.value}</span>
        </div>
    );
}

class RemittanceForm extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div>
                insert form here
            </div>
        );
    }
}