import React, { Component } from 'react';
import { Header } from '../../components/header/remittance_header';
import { Row, Col, Tag, Drawer, Button, List, Divider, Form, Input, Tooltip, Icon, message } from 'antd';

import './revised-style.css'
import { list } from 'react-icons-kit/feather';
import { postData } from '../../../../network_requests/general';

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
            <SubmitRemittance
                deployment_id={props.id}
            />
        </div>
    );
}

class SubmitRemittance extends React.Component {
    constructor(props) {
        super(props);

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

        const RemForm = Form.create({ name: 'remittance-form' })(RemittanceForm);

        return (
            <div className="button-container">
                <Button
                    className="list-action"
                    onClick={this.showDrawer}
                >
                    Submit Remittance
                </Button>
                <Drawer
                    title="Remittance Form"
                    placement="right"
                    closable={false}
                    onClose={this.onClose}
                    visible={this.state.drawer_visibility}
                    width={600}
                >
                    <RemForm 
                        deployment_id={this.props.deployment_id}
                        onClose={this.onClose}
                    
                    />
                </Drawer>
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

        this.state = {
            "tenPesoTickets": [],
            "twelvePesoTickets": [],
            "fifteenPesoTickets": []
        }
    }

    componentDidMount() {
        this.fetchTickets();
    }

    handleSubmit = (e) => {
        this.props.form.validateFields((err, values) => {
            if(!err){
                var list_of_keys = Object.keys(values);
                
                var x = 0;
                values["ten_peso_tickets"] = [];
                while(x < list_of_keys.length){
                    var str = list_of_keys[x]
                    if(str.includes("ten_peso")){
                        var parts = str.split("-", 2);
                        values["ten_peso_tickets"].push({
                            "id": parts[1],
                            "value": values[list_of_keys[x]]
                        });
                    }
                    x++;
                }

                var x = 0;
                values["twelve_peso_tickets"] = [];
                while(x < list_of_keys.length){
                    var str = list_of_keys[x]
                    if(str.includes("twelve_peso")){
                        console.log("entered_here if twelve")
                        var parts = str.split("-", 2);
                        values["twelve_peso_tickets"].push({
                            "id": parts[1],
                            "value": values[list_of_keys[x]]
                        }); 
                    }
                    x++;
                }

                var x = 0;
                values["fifteen_peso_tickets"] = [];
                while(x < list_of_keys.length){
                    var str = list_of_keys[x]
                    if(str.includes("fifteen_peso")){
                        console.log("entered_here if fifteen")
                        var parts = str.split("-", 2);
                        values["fifteen_peso_tickets"].push({
                            "id": parts[1],
                            "value": values[list_of_keys[x]]
                        }); 
                    }
                    x++;
                }

                values["deployment_id"] = this.props.deployment_id

                console.log('Received values of form:', values);

                postData('remittances/remittance_form/submit/', values)
                    .then(response => {
                    if (!response.error) {
                        message.success("Remittance form has been submitted");
                    } else {
                        console.log(response.error);
                    }
            });
            }
        });
    }

    fetchTickets() {
        fetch('/remittances/tickets/' + this.props.deployment_id)
            .then(response => {
                return response;
            })
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    this.setState({
                        tenPesoTickets: data.ten_tickets,
                        twelvePesoTickets: data.twelve_tickets,
                        fifteenPesoTickets: data.fifteen_tickets
                    });
                }
                else {
                    console.log(data.error)
                }
            }).catch(error => console.log(error));
    }

    render() {
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        }

        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 16,
                    offset: 8,
                },
            },
        }

        const { getFieldDecorator } = this.props.form;

        return (
            <Form onSubmit={this.handleSubmit} className="remittance-form">
                <Form.Item
                    {...formItemLayout}
                    label={
                        <span>
                            <Tooltip title="Input current mileage of the shuttle">
                                <Icon type="question-circle-o" className="field-guide" />
                            </Tooltip>
                            Mileage
                        </span>
                    }
                >
                    {
                        getFieldDecorator('mileage', {
                            rules: [{
                                required: true,
                                message: "Please input the shuttle's current mileage"
                            },]
                        })(
                            <Input />
                        )
                    }
                </Form.Item>
                {this.state.tenPesoTickets && this.state.tenPesoTickets.length &&
                    <div>
                        <Divider>10 Peso Tickets</Divider>
                        {
                            this.state.tenPesoTickets.map((item) => (
                                <Form.Item
                                    {...formItemLayout}
                                    label= {
                                        <span>
                                            <Tooltip title="Input the last consumed ticket of this bundle">
                                                <Icon type="question-circle-o" className="field-guide" />
                                            </Tooltip>
                                            Ticket No. {item.start_ticket} to
                                        </span>
                                    }
                                    key={item.id}
                                >
                                    {
                                        getFieldDecorator('ten_peso-'.concat(item.id), {
                                            rules: []
                                        })(
                                            <Input />
                                        )
                                    }
                                </Form.Item>
                                ))
                        }
                    </div>
                }
                {this.state.twelvePesoTickets && this.state.twelvePesoTickets.length &&
                    <div>
                        <Divider>12 Peso Tickets</Divider>
                        {
                            this.state.twelvePesoTickets.map((item) => (
                                <Form.Item
                                    {...formItemLayout}
                                    label= {
                                        <span>
                                            <Tooltip title="Input the last consumed ticket of this bundle">
                                                <Icon type="question-circle-o" className="field-guide" />
                                            </Tooltip>
                                            Ticket No. {item.start_ticket} to
                                        </span>
                                    }
                                    key={item.id}
                                >
                                    {
                                        getFieldDecorator('twelve_peso-'.concat(item.id), {
                                            rules: []
                                        })(
                                            <Input />
                                        )
                                    }
                                </Form.Item>
                                ))
                        }
                    </div>
                }
                {this.state.fifteenPesoTickets && this.state.fifteenPesoTickets.length &&
                    <div>
                        <Divider>15 Peso Tickets</Divider>
                        {
                            this.state.fifteenPesoTickets.map((item) => (
                                <Form.Item
                                    {...formItemLayout}
                                    label= {
                                        <span>
                                            <Tooltip title="Input the last consumed ticket of this bundle">
                                                <Icon type="question-circle-o" className="field-guide" />
                                            </Tooltip>
                                            Ticket No. {item.start_ticket} to
                                        </span>
                                    }
                                    key={item.id}
                                >
                                    {
                                        getFieldDecorator('fifteen_peso-'.concat(item.id), {
                                            rules: []
                                        })(
                                            <Input />
                                        )
                                    }
                                </Form.Item>
                                ))
                        }
                    </div>
                }
                <Divider orientation="left"> Other Information </Divider>
                <Form.Item
                    {...formItemLayout}
                    label={
                        <span>
                            <Tooltip title="Input costs made from buying fuel">
                                <Icon type="question-circle-o" className="field-guide" />
                            </Tooltip>
                            Fuel Costs
                        </span>
                    }
                >
                    {
                        getFieldDecorator('fuel_costs', {
                            rules: [ ]
                        })(
                            <Input />
                        )
                    }
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label={
                        <span>
                            <Tooltip title="Input the OR number of the receipt acquired from buying fuel">
                                <Icon type="question-circle-o" className="field-guide" />
                            </Tooltip>
                            OR Number
                        </span>
                    }
                >
                    {
                        getFieldDecorator('or_number', {
                            rules: []
                        })(
                            <Input />
                        )
                    }
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label={
                        <span>
                            <Tooltip title="Input other costs acquired during deployment">
                                <Icon type="question-circle-o" className="field-guide" />
                            </Tooltip>
                            Other Costs
                        </span>
                    }
                >
                    {
                        getFieldDecorator('other_costs', {
                            rules: []
                        })(
                            <Input />
                        )
                    }
                </Form.Item>
                <div className="form-footer" >
                    <Button onClick={this.props.onClose} style={{ marginRight: 8 }}>
                        Cancel
                    </Button>
                    <Button onClick={this.handleSubmit} type="primary">
                        Submit
                    </Button>
                </div>
            </Form>
        );
    }
}