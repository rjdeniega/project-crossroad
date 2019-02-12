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

    }

    render() {
        return (
            <div className="page-container">
                <Header />
                <Row className="remittance-body" gutter={16}>
                    <Col span={8}>
                        <PreDeployment />
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