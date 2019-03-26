import React, { Component } from 'react';
import { Header } from '../../components/header/remittance_header';
import { Row, Col, Tag, Select, Modal, Drawer, Button, List, Divider, Form, Input, Tooltip, Icon, message } from 'antd';

import './revised-style.css'
import { list } from 'react-icons-kit/feather';
import { postData } from '../../../../network_requests/general';

import PerfectScrollbar from '@opuscapita/react-perfect-scrollbar';

export class DriverRemittance extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="page-container">
                <PerfectScrollbar>
                    <Header />
                    <Row className="remittance-body">
                        <Col span={24}>
                            <DeploymentList />
                        </Col>
                    </Row>
                </PerfectScrollbar>
            </div>
        );
    }
}

class OngoingDeployment extends React.Component {
    constructor(props){
        super(props);
        
        this.state = {
            "timeIn": null
        }

        this.handleMarkAsPresent = this.handleMarkAsPresent.bind(this);
    }

    componentDidMount(){
        this.fetchPresent();
    }

    fetchPresent(){
        let driver = JSON.parse(localStorage.user_staff);
        fetch('/remittances/deployments/present/' + driver.id)
            .then(response => {
                return response;
            })
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    this.setState({
                        timeIn: data.timeIn
                    });
                    console.log(this.state.timeIn)
                }
                else {
                    console.log(data.error)
                }
            }).catch(error => console.log(error));
    }

    handleMarkAsPresent = () => {
        let driver = JSON.parse(localStorage.user_staff)
    
        this.postDriver(driver);
    }

    postDriver(driver){
        let data = {"driver_id": driver.id}
        postData('remittances/deployments/present/', data)
            .then(response => {
                if (!response.error) {
                    message.success("You have been marked as Pending for Deployment");
                } else {
                    console.log(response.error);
                }
            })
    }

    render() {
        return(
            <div className="deployment-container">
                {this.state.timeIn != null ? (
                    <TimeInDisplay timeIn={this.state.timeIn} />
                ) : (
                    <MarkAsPresentButton handleMarkAsPresent={this.handleMarkAsPresent}/>
                )}
                
            </div>
        )
    }
}

class MarkAsPresentButton extends React.Component {
    constructor(props){
        super(props);

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(){
        this.props.handleMarkAsPresent();
    }

    render(){
        return(
            <Tooltip 
                title="click time-in to ready for deployment"
                placement="right"
                >
                <Button type="primary" icon="clock-circle" onClick={this.handleClick} block>Time-In</Button>
            </Tooltip>
        ) 
    }
}

function TimeInDisplay(props){
    return (
        <div>
            <Icon type="clock-circle" />
            <label className="time-in-label">Time-In: </label>
            <span className="time-in-time">{props.timeIn}</span>
        </div>
    )
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
        let driver = null;
        console.log(this.props.driver);
        if (this.props.driver == undefined || this.props.driver == null) {
            driver = JSON.parse(localStorage.user_staff);
        }
        else {
            driver = this.props.driver
        }
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
                <OngoingDeployment />
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
                                        route={item.route}
                                        is_redeploy_shown={item.is_redeploy_shown}
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

export function DeploymentListDetails(props) {
    
    if(props.status == 'O'){
        var tag_color = 'blue';
        var status = 'Ongoing';
    } else if(props.status == 'P'){
        var tag_color = 'orange';
        var status = 'Pending for Remittance';
    } else {
        var tag_color = 'green';
        var status = 'Finished'
    }

    let end_time = props.end_time == null ? 'N/A' : props.end_time;
    console.log(props.driver_object);
    if (status == 'Ongoing') {
        return (
            <div className="deployment-list-container">
                <div className="list-header">
                    <span className="list-header-date">
                        {props.driver_object ? props.driver_object.name : props.date}
                    </span>
                    <Tag color={tag_color}>
                        {status}
                    </Tag>
                    {props.is_redeploy_shown &&
                        <StopDeployment 
                            deployment_id={props.id}
                            route={props.route}
                        />
                    }
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
    } else if(status == 'Pending for Remittance'){
        return (
            <div className="deployment-list-container">
                <div className="list-header">
                    <span className="list-header-date">
                        {props.driver_object ? props.driver_object.name : props.date}
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
    } else {
        return (
            <div className="deployment-list-container">
                <div className="list-header">
                    <span className="list-header-date">
                        {props.driver_object ? props.driver_object.name : props.date}
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
                <ViewRemittance
                    deployment_id={props.id}
                    deployment_date={props.date}
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
                    title={"Remittance Info for deployment on " + this.props.deployment_date}
                    placement="right"
                    closable={true}
                    onClose={this.onClose}
                    visible={this.state.drawer_visibility}
                    width={600}
                >
                    <RemittanceInfo
                        deployment_id={this.props.deployment_id}
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
                            <Divider type="vertical"/>
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
                            <Divider type="vertical"/>
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
                            <Divider type="vertical"/>
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
                        <Divider type="vertical"/>
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
                        <Divider type="vertical"/>
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
                        <Divider type="vertical"/>
                        <span className="item-rem-total">
                            (Php) {parseFloat(Math.round(this.state.remittance_form.total * 100) / 100).toFixed(2)}
                        </span>
                    </Col>
                </Row>
                {this.state.remittance_form.discrepancy != 0 &&
                    <Row gutter={16} style={{ marginTop: "40px"}}>
                        <Col span={16}>
                            <span className="view-remittances-tag">
                                Discrepancy:
                            </span>
                        </Col>
                        <Col span={8}>
                            <Divider type="vertical"/>
                            <span className="item-total">
                                (Php) {parseFloat(Math.round(this.state.remittance_form.discrepancy * 100) / 100).toFixed(2)}
                            </span>
                        </Col>
                    </Row>
                }
            </div>
        );
    }
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
            if (!err) {
                var list_of_keys = Object.keys(values);

                var x = 0;
                values["ten_peso_tickets"] = [];
                while (x < list_of_keys.length) {
                    var str = list_of_keys[x]
                    if (str.includes("ten_peso")) {
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
                while (x < list_of_keys.length) {
                    var str = list_of_keys[x]
                    if (str.includes("twelve_peso")) {
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
                while (x < list_of_keys.length) {
                    var str = list_of_keys[x]
                    if (str.includes("fifteen_peso")) {
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
                        }
                        else {
                            message.error(response.error);
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
                                <Icon type="question-circle-o" className="field-guide"/>
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
                                label={
                                    <span>
                                            <Tooltip title={"Ticket Numbers should only range from " + item.start_ticket + " - " + item.end_ticket}>
                                                <Icon type="question-circle-o" className="field-guide"/>
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
                                label={
                                    <span>
                                            <Tooltip title={"Ticket Numbers should only range from " + item.start_ticket + " - " + item.end_ticket}>
                                                <Icon type="question-circle-o" className="field-guide"/>
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
                                label={
                                    <span>
                                            <Tooltip title={"Ticket Numbers should only range from " + item.start_ticket + " - " + item.end_ticket}>
                                                <Icon type="question-circle-o" className="field-guide"/>
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
                                <Icon type="question-circle-o" className="field-guide"/>
                            </Tooltip>
                            Fuel Costs
                        </span>
                    }
                >
                    {
                        getFieldDecorator('fuel_costs', {
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
                            <Tooltip title="Input the OR number of the receipt acquired from buying fuel">
                                <Icon type="question-circle-o" className="field-guide"/>
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
                            <Tooltip title="Input cost for vulcanizing">
                                <Icon type="question-circle-o" className="field-guide"/>
                            </Tooltip>
                            Vulcanizing Cost
                        </span>
                    }
                >
                    {
                        getFieldDecorator('vulcanizing_cost', {
                            rules: []
                        })(
                            <Input />
                        )
                    }
                </Form.Item>
                <div className="form-footer">
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

class StopDeployment extends React.Component {
    constructor(props){
        super(props);

        this.handleShuttleChange = this.handleShuttleChange.bind(this);

        this.state = {
            modal_visibility: false,
            tooltip_message: null,
            shuttle_replacement: null,
            confirmLoading: false,
            is_disabled: true,
            is_shuttle_breakdown: true,
        }
    }

    componentDidMount() {
        this.setState({
            tooltip_message: "shuttle breakdown is when the driver's shuttle breaksdown mid-deployment"
        })
    }

    showModal = () => {
        this.setState({
            modal_visibility: true
        });
    }

    handleCancel = () => {
        this.setState({
            modal_visibility: false,
        });
    }

    handleOk = () => {
        this.setState({
            confirmLoading: true,
        })

        this.handleBreakdownRedeploy()
        

        setTimeout(() => {
            this.setState({
                modal_visibility: false,
                confirmLoading: false,
            });
        }, 1000);
    }

    handleBreakdownRedeploy() {
        console.log(this.props.deployment_id)
        console.log(this.state.shuttle_replacement)
        let breakdown = {
            'deployment_id': this.props.deployment_id,
            'shuttle_id': this.state.shuttle_replacement
        }

        postData('remittances/deployments/shuttle-breakdown/redeploy/', breakdown)
            .then(response => {
                if (!response.error) {
                    message.success("Driver has been redeployed with a new shuttle");
                } else {
                    console.log(response.error);
                }
            });
    }

    handleShuttleChange(value) {
        this.setState({
            shuttle_replacement: value,
            is_disabled: false
        });
    }

    render() {
        const Option = Select.Option

        return (
            <span>
                <Button
                    type="danger"
                    className="deployment-button"
                    onClick={this.showModal}
                    size="small"
                >
                    Redeploy
                </Button>

                <Modal
                    title="Stop Deployment"
                    visible={this.state.modal_visibility}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    confirmLoading={this.state.confirmLoading}
                    okButtonProps={this.state.is_disabled ?
                        { disabled: true } : { disabled: false }
                    }
                >
                    <div className="modal-container">
                        <ShuttleBreakdown
                            deployment_id={this.props.deployment_id}
                            route={this.props.route}
                            onSelectChange={this.handleShuttleChange}
                        />
                    </div>
                </Modal>
            </span>
        );
    }
}


class ShuttleBreakdown extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            availableShuttles: [],
        }

        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.fetchAvailableShuttles();
    }

    fetchAvailableShuttles() {
        console.log(this.props.deployment_id)
        fetch('/remittances/deployments/' + this.props.deployment_id + '/available-shuttles')
            .then(response => {
                return response;
            })
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    this.setState({
                        availableShuttles: data.shuttles
                    });
                }
                else {
                    console.log(data.error)
                }
            }).catch(error => console.log(error));
    }

    handleChange(value) {
        this.props.onSelectChange(value);
    }

    render() {
        const { Option, OptGroup } = Select;
        return (
            <div>
                <Divider orientation="left">
                    Redeploy with a new shuttle
                </Divider>
                <label className="modal-detail-title">Available Shuttles: </label>
                <Select
                    style={{ width: 200 }}
                    onChange={this.handleChange}
                    className="modal-detail-value"
                >
                    <OptGroup label="Back-up Shuttles">
                        {
                            this.state.availableShuttles.map((item) => {
                                if(item.route == 'B')
                                    return (
                                        <option value={item.id} key={item.id}>
                                            Shuttle#{item.shuttle_number} - {item.plate_number}
                                        </option>
                                    )
                            })
                        }
                    </OptGroup>
                    <OptGroup label="Other Available Shuttles">
                        {
                            this.state.availableShuttles.map((item) => {
                                if(item.route != 'B')
                                    return (
                                        <option value={item.id} key={item.id}>
                                            Shuttle#{item.shuttle_number} - {item.plate_number}
                                        </option>
                                    )
                            })
                        }
                    </OptGroup>
                </Select>
                <ModalDetails
                    title="Route"
                    value={this.props.route}
                />
            </div>
        );
    }
}

function ModalDetails(props) {
    return (
        <div className="modal-detail-container">
            <span className="modal-detail-title">
                {props.title}:
            </span>
            <span className="modal-detail-value">
                {props.value}
            </span>
        </div>
    );
}