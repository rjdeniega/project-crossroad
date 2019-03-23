import React, { Component } from 'react';
import { Row, Col, Tag, Popconfirm, Avatar, Drawer, Button, List, Divider, Tooltip, Icon, Form, message, Input, InputNumber } from 'antd';
import { postData } from '../../../../../network_requests/general';

import '../revised-style.css';

export class PostDeployment extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="phase-container">
                <Header
                    title="Post-Deployment"
                    description="Confirm Remittances of Finished Deployments"
                />
                <DeploymentList
                    pendingDeployments={this.props.pendingDeployments}
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
                dataSource={props.pendingDeployments}
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
                                    route={item.route}
                                    start_time={item.start_time}
                                    end_time={item.end_time}
                                    photo={item.driver.photo}
                                    absent_driver={item.absent_driver}
                                    date={item.date}
                                />
                            </List.Item>
                        </div>
                    )
                }
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

function DeploymentListDetails(props) {
    const driver_name = props.name;
    const supervisor = JSON.parse(localStorage.user_staff);
    const absent_driver = props.absent_driver

    if (props.route == 'Main Road' || props.route == 'Main Route' || props.route == 'M') {
        var route_label = 'Main Road'
        var tag_color = 'blue';
    }
    else if (props.route == 'Kaliwa' || props.route == 'Left Route' || props.route == 'L') {
        var tag_color = 'orange';
        var route_label = 'Left Route';
    }
    else {
        var tag_color = 'green';
        var route_label = 'Right Route';
    }

    if (typeof absent_driver == "undefined") {
        return (
            <div>
                <div className="deployment-header">
                    <Avatar 
                        src={props.photo} 
                        style={{ backgroundColor: '#68D3B7' }} 
                        shape="square"
                        icon="user"
                        />
                    <span className="deployment-name">
                        {props.name}
                    </span>
                    <Tag color={tag_color} className="route-tag">
                        {route_label}
                    </Tag>
                </div>

                <div className="deployment-list-container">
                    <DetailItems
                        title="Shuttle"
                        value={props.shuttle}
                    />
                    <DetailItems
                        title="Deployment Date"
                        value={props.date}
                    />
                    <DetailItems
                        title="Start Time"
                        value={props.start_time}
                    />
                    <DetailItems
                        title="End Time"
                        value={props.end_time}
                    />
                </div>

                <ViewRemittance
                    deployment_id={props.deployment_id}
                    driver_name={props.name}
                />
            </div>
        );
    } else {
        const prompt_text = props.name + " was subbed in for " + absent_driver.name

        return (
            <div>
                <div className="deployment-header">
                    <Tooltip title={prompt_text} placement="topLeft">
                        <Avatar 
                            src={absent_driver.photo}
                            style={{ backgroundColor: '#68D3B7' }} 
                            shape="square"
                            icon="user"
                            />
                        <Icon type="arrow-right" className="sub-arrow" />
                        <Avatar 
                            src={props.photo} 
                            style={{ backgroundColor: '#68D3B7' }} 
                            shape="square"
                            icon="user"
                            />
                        <span className="deployment-name">
                            {props.name}
                        </span>
                        <Tag color={tag_color} className="route-tag">
                            {props.route}
                        </Tag>
                    </Tooltip>
                </div>

                <div className="deployment-list-container">
                    <DetailItems
                        title="Shuttle"
                        value={props.shuttle}
                    />
                    <DetailItems
                        title="Deployment Date"
                        value={props.date}
                    />
                    <DetailItems
                        title="Start Time"
                        value={props.start_time}
                    />
                    <DetailItems
                        title="End Time"
                        value={props.end_time}
                    />
                </div>

                <ViewRemittance
                    deployment_id={props.deployment_id}
                    driver_name={props.name}
                />
            </div>
        );
    }
}

class ViewRemittance extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            drawer_visibility: false,
        }

        this.onClose = this.onClose.bind(this);
    }

    showDrawer = () => {
        this.setState({
            drawer_visibility: true
        })
    }

    onClose = () => {
        this.setState({
            drawer_visibility: false
        })
    }

    render() {
        return (
            <div className="button-container">
                <Button
                    className="list-action"
                    onClick={this.showDrawer}
                >
                    View Remittance
                </Button>
                <Drawer
                    title={"Remittance Info for " + this.props.driver_name}
                    placement="right"
                    closable={true}
                    onClose={this.onClose}
                    visible={this.state.drawer_visibility}
                    width={600}
                >
                    <RemittanceInfo
                        deployment_id={this.props.deployment_id}
                        onClose={this.onClose}
                    />
                </Drawer>
            </div>
        )
    }
}

class RemittanceInfo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            "remittance_form": {},
            "ten_tickets": [],
            "twelve_tickets": [],
            "fifteen_tickets": []
        }
    }

    componentDidMount() {
        this.fetchRemittanceForm();
    }

    fetchRemittanceForm() {
        console.log(this.props.deployment_id)
        fetch('/remittances/remittance_form/view/' + this.props.deployment_id)
            .then(response => {
                return response;
            })
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    this.setState({
                        remittance_form: data.remittance_form,
                        ten_tickets: data.ten_tickets,
                        twelve_tickets: data.twelve_tickets,
                        fifteen_tickets: data.fifteen_tickets
                    });
                    console.log(
                        this.state.remittance_form,
                        this.state.ten_tickets,
                        this.state.twelve_tickets,
                        this.state.fifteen_tickets
                    )
                }
                else {
                    console.log(data.error)
                }
            }).catch(error => console.log(error));
    }

    render() {

        const ten_isEmpty = this.state.ten_tickets.length == 0 ? true : false;
        const twelve_isEmpty = this.state.twelve_tickets.length == 0 ? true : false;
        const fifteen_isEmpty = this.state.fifteen_tickets.length == 0 ? true : false;
        const ConForm = Form.create({ name: 'confirm-form' })(ConfirmRemittanceForm);

        return (
            <div>
                <Row gutter={16}>
                    <Col span={8}>
                        <span className="view-remittances-tag">
                            Mileage:
                        </span>
                    </Col>
                    <Col span={16}>
                        <span>
                            {parseFloat(Math.round(this.state.remittance_form.km_from * 100) / 100).toFixed(2)} km
                        </span>
                        <span> - </span>
                        <span>
                            {parseFloat(Math.round(this.state.remittance_form.km_to * 100) / 100).toFixed(2)} km
                        </span>
                    </Col>
                </Row>
                {ten_isEmpty == false &&
                    <Divider>
                        10 Peso Tickets
                    </Divider>
                }
                {ten_isEmpty == false &&
                    this.state.ten_tickets.map((item) => (
                        <Row gutter={16}>
                            <Col span={8}>
                                <span className="view-remittances-tag">
                                    Ticket No:
                            </span>
                            </Col>
                            <Col span={8}>
                                <span>
                                    {item.start_ticket}
                                </span>
                                <span> - </span>
                                <span>
                                    {item.end_ticket}
                                </span>
                            </Col>
                            <Col span={8}>
                                <Divider type="vertical" />
                                <Tooltip
                                    title={"number of tickets (" + String(item.end_ticket - item.start_ticket) + " pcs) * 10"}
                                    placement="topRight"
                                >
                                    <span className="item-total">
                                        {parseFloat(Math.round(item.total * 100) / 100).toFixed(2)}
                                    </span>
                                </Tooltip>
                            </Col>
                        </Row>
                    ))
                }

                {twelve_isEmpty == false &&
                    <Divider>
                        12 Peso Tickets
                    </Divider>
                }
                {twelve_isEmpty == false &&
                    this.state.twelve_tickets.map((item) => (
                        <Row gutter={16}>
                            <Col span={8}>
                                <span className="view-remittances-tag">
                                    Ticket No:
                            </span>
                            </Col>
                            <Col span={8}>
                                <span>
                                    {item.start_ticket}
                                </span>
                                <span> - </span>
                                <span>
                                    {item.end_ticket}
                                </span>
                            </Col>
                            <Col span={8}>
                                <Divider type="vertical" />
                                <Tooltip
                                    title={"number of tickets (" + String(item.end_ticket - item.start_ticket) + " pcs) * 12"}
                                    placement="topRight"
                                >
                                    <span className="item-total">
                                        {parseFloat(Math.round(item.total * 100) / 100).toFixed(2)}
                                    </span>
                                </Tooltip>
                            </Col>
                        </Row>
                    ))
                }

                {fifteen_isEmpty == false &&
                    <Divider>
                        15 Peso Tickets
                    </Divider>
                }
                {fifteen_isEmpty == false &&
                    this.state.fifteen_tickets.map((item) => (
                        <Row gutter={16}>
                            <Col span={8}>
                                <span className="view-remittances-tag">
                                    Ticket No:
                                </span>
                            </Col>
                            <Col span={8}>
                                <span>
                                    {item.start_ticket}
                                </span>
                                <span> - </span>
                                <span>
                                    {item.end_ticket}
                                </span>
                            </Col>
                            <Col span={8}>
                                <Divider type="vertical" />
                                <Tooltip
                                    title={"number of tickets (" + String(item.end_ticket - item.start_ticket) + " pcs) * 15"}
                                    placement="topRight"
                                >
                                    <span className="item-total">
                                        {parseFloat(Math.round(item.total * 100) / 100).toFixed(2)}
                                    </span>
                                </Tooltip>
                            </Col>
                        </Row>
                    ))
                }

                <Divider orientation="left">Other Information</Divider>
                <Row gutter={16}>
                    <Col span={16}>
                        {this.state.remittance_form.fuel_cost != 0 ? (
                            <Tooltip title={"Receipt No.: " + this.state.remittance_form.fuel_receipt}>
                                <span className="view-remittances-tag">
                                    Fuel Costs:
                                </span>
                            </Tooltip>
                        ) : (
                                <span className="view-remittances-tag">
                                    Fuel Costs:
                            </span>
                            )}
                    </Col>
                    <Col span={8}>
                        <Divider type="vertical" />
                        <span className="item-total">
                            ({parseFloat(Math.round(this.state.remittance_form.fuel_cost * 100) / 100).toFixed(2)})
                        </span>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={16}>
                        <span className="view-remittances-tag">
                            Other Costs:
                        </span>
                    </Col>
                    <Col span={8}>
                        <Divider type="vertical" />
                        <span className="item-total">
                            ({parseFloat(Math.round(this.state.remittance_form.other_cost * 100) / 100).toFixed(2)})
                        </span>
                    </Col>
                </Row>
                <Row gutter={16} className="total-row">
                    <Col span={16}>
                        <span className="view-remittances-tag">
                            Total:
                        </span>
                    </Col>
                    <Col span={8}>
                        <Divider type="vertical" />
                        <span className="item-rem-total">
                            (Php) {parseFloat(Math.round(this.state.remittance_form.total * 100) / 100).toFixed(2)}
                        </span>
                    </Col>
                </Row>
                <div className="confirm-remittance-container">
                    <Divider orientation="left"> Confirm Remittance </Divider>
                    <ConForm
                        onClose={this.props.onClose}
                        remittance_id={this.state.remittance_form.id}
                        totalAmount={this.state.remittance_form.total}
                    />
                </div>
            </div>
        );
    }
}

class ConfirmRemittanceForm extends React.Component {
    constructor(props) {
        super(props)
    }

    handleSubmit = (e) => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                postData(('remittances/remittance_form/' + this.props.remittance_id + '/confirm/'), values)
                    .then(response => {
                        if (!response.error) {
                            message.success("Remittance form has been confirmed");
                        } else {
                            console.log(response.error);
                        }
                    });
                console.log('Received values of form:', values);
            }
        });
    }

    render() {

        const { getFieldDecorator } = this.props.form;

        return (
            <Form onSubmit={this.handleSubmit} layout="inline" className="confirm-form">
                <Form.Item
                    label={
                        <span>
                            <Tooltip title="Input amount received from driver">
                                <Icon type="question-circle-o" className="field-guide" />
                            </Tooltip>
                            Actual Cash
                        </span>
                    }
                >
                    {
                        getFieldDecorator('actual', {
                            rules: [{
                                required: true,
                                message: "Please input the actual cash received"
                            },],
                            initialValue: this.props.totalAmount
                        })(
                            <InputNumber />
                        )
                    }
                </Form.Item>
                <Form.Item>
                    <Popconfirm 
                        title="Are you sure?" 
                        onConfirm={this.handleSubmit}
                        okText="Yes"
                        cancelText="No"
                        >
                        <Button
                            type="primary"
                        >
                            Confirm Remittance
                        </Button>
                    </Popconfirm>
                </Form.Item>
            </Form>
        );
    }
}

