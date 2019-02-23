import React, { Component } from 'react';
import { Header } from '../../components/header/remittance_header';
import { Row, Col, Table, Tag } from 'antd';

import './revised-style.css'
import { Button } from 'antd/lib/radio';

export class DriverRemittance extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
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
            'deployments': []
        }
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
        const columns = [{
            title: 'Date',
            dataIndex: 'shift_date',
            key: 'shift_date',
            align: 'left',
            render: (shift_date) => (
                <span className="item-date">
                    {shift_date}
                </span>
            ),
        }, {
            title: 'Shuttle',
            dataIndex: 'shuttle',
            key: 'shuttle',
            align: 'left'
        }, {
            title: 'Start Time',
            dataIndex: 'start_time',
            key: 'start_time',
            align: 'left'
        }, {
            title: 'End Time',
            dataIndex: 'end_time',
            key: 'end_time',
            align: 'left',
            render: (end_time) => (
                <span>
                    { end_time == null ? 'N/A' : end_time }
                </span>
            )
        }, {
            title: "Status",
            dataIndex: 'status',
            key: 'status',
            align: 'left',
            render: (status) => (
                <span>
                    <Tag 
                        color={ status == 'O' ? 'geekblue' : 'green' }
                    >
                        {status == 'O' ? 'Ongoing' : 'Finished'}
                    </Tag>
                </span>
            ),
        }, {
            title: "Action",
            key: 'action',
            align: 'left',
            render: (text, record) => (
                <span>
                    { record.status == 'O'? <Button>Submit Remittance</Button> : <Button>View</Button> }    
                </span>
            ),
        }]

        return(
            <div className="list-container">
                <div>
                    Deployment List
                </div>
                <Table 
                    columns={columns} 
                    dataSource={this.state.deployments}
                    size="small"
                    />
            </div>
        );
    }
}