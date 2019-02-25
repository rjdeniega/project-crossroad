import React, { Component } from 'react';
import { List, Avatar, Button, Modal, message, Select, Tag, Popover, Empty, Badge, Row, Col, Divider } from 'antd';
import '../revised-style.css';
import { UserAvatar } from '../../../../../components/avatar/avatar';
import { postData } from '../../../../../network_requests/general';

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
                <DeploymentList
                    plannedDrivers={this.props.plannedDrivers}
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
                                    id={item.driver.id}
                                    name={item.driver.name}
                                    shuttle={"#" + item.shuttle.shuttle_number + " - " + item.shuttle.plate_number}
                                    route={item.shuttle.route}
                                    expected_departure={item.expected_departure}
                                    photo={item.driver.photo}
                                    ten_tickets={item.ten_peso_tickets}
                                    twelve_tickets={item.twelve_peso_tickets}
                                    fifteen_tickets={item.fifteen_peso_tickets}
                                    shuttle_obj={item.shuttle}
                                />
                            </List.Item>
                        </div>
                    )
                }
            />
        </div>
    );
}

function DeploymentListDetails(props) {
    const driver_id = props.id;
    const driver_name = props.name;
    const supervisor = JSON.parse(localStorage.user_staff);

    if (props.route == 'Main Road')
        var tag_color = 'blue';
    else if (props.route == 'Kaliwa')
        var tag_color = 'orange';
    else
        var tag_color = 'green'

    return (
        <div>
            <div className="deployment-header">
                <Avatar src={props.photo} shape="square" />
                <span className="deployment-name">
                    {props.name}
                </span>
                <Tag color={tag_color} className="route-tag">
                    {props.route}
                </Tag>
            </div>

            <div className="deployment-list-container">
                {props.shuttle_obj.status == 'A'? (
                    <DetailItems
                        title="Shuttle"
                        value={props.shuttle}
                    />
                ) : (
                    <div className="detail-container">
                        <span className="detail-items-title">
                            Shuttle:
                        </span>
                        <Badge dot>
                            <span className="detail-items-value">
                                {props.shuttle}
                            </span>
                        </Badge>
                    </div>
                )}
                
                <DetailItems
                    title="Expected Departure"
                    value={props.expected_departure}
                />

                <div className="ticket-tags-container">
                    <TicketDisplay
                        amount="₱10"
                        tickets={props.ten_tickets}
                    />
                    <TicketDisplay
                        amount="₱12"
                        tickets={props.twelve_tickets}
                    />
                    {props.route == 'Main Road' &&
                        <TicketDisplay
                            amount="₱15"
                            tickets={props.fifteen_tickets}
                        />
                    }
                </div>
            </div>

            <DeploymentButtons
                supervisor_id={supervisor.id}
                driver_id={driver_id}
                driver_name={driver_name}
                shuttle={props.shuttle}
                route={props.route}
                shuttle_obj={props.shuttle_obj}
            />
        </div>
    );
}

function TicketDisplay(props) {

    if (props.tickets.length > 0) {
        var content = (
            props.tickets.map((item) => (
                <div className="ticket-wrapper">
                    <span className="ticket-label">
                        Ticket No.:
                    </span>
                    <span>
                        {item.range_from} - {item.range_to}
                    </span>
                </div>
            ))
        )

        return (
            <span className="ticket-tag-wrapper">
                <Popover content={content} title={props.amount + " tickets"}>
                    <Tag className="ticket-tag">
                        {props.amount}
                    </Tag>
                </Popover>
            </span>
    
        );

    } else {
        var content = (
            <Empty
                description={(
                    <a href={"http://localhost:3000/tickets"}>
                        Assign tickets to driver
                    </a>
                )}
            />
        )

        return (
            <span className="ticket-tag-wrapper">
                <Popover content={content} title={props.amount + " tickets"}>
                    <Badge dot>
                        <Tag className="ticket-tag">
                            {props.amount}
                        </Tag>
                    </Badge>       
                </Popover>
            </span>
    
        );
    }

    
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

function DeploymentButtons(props) {
    const supervisor_id = props.supervisor_id
    const driver_id = props.driver_id
    const driver_name = props.driver_name

    function showConfirm() {
        const confirm = Modal.confirm;

        confirm({
            title: 'Are you sure you want to deploy this driver?',
            content: 'Deploying this driver would start his/her time for the shift.',

            onOk() {
                handleDeploy();

                return new Promise((resolve, reject) => {
                    setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
                }).catch(() => console.log('Oops errors!'));
            },

            onCancel() { },
        });
    }

    function handleDeploy() {
        console.log(supervisor_id)
        let deploy = {
            'supervisor_id': supervisor_id,
            'driver_id': driver_id
        }

        postData('remittances/deployments/', deploy)
            .then(response => {
                if (!response.error) {
                    message.success(driver_name + " has been deployed");
                } else {
                    console.log(response.error);
                }
            });
    }

    return (
        <div className="deployment-button-container">
            <SubButton
                shuttle={props.shuttle}
                route={props.route}
                driver_id={props.driver_id}
                supervisor_id={supervisor_id}
                driver_name={driver_name}
            />
            {props.shuttle_obj.status == 'A' ? (
                <Button
                    type="primary"
                    className="deployment-button"
                    onClick={showConfirm}
                >
                    Deploy
                </Button>
            ) : (
                <DeployWithDiffShuttle 
                    driver_id={props.driver_id}
                    shuttle_display={props.shuttle}
                    supervisor_id={supervisor_id}
                    driver_name={driver_name}
                />
            )}
        </div>
    );
}

class DeployWithDiffShuttle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'modal_is_visible': false,
            'shuttle_id': null,
            'driver_id': this.props.driver_id,
        }
        this.handleShuttleChange = this.handleShuttleChange.bind(this);
    }

    showModal = () => {
        this.setState({
            'modal_is_visible': true,
        });
    }

    handleOk = () => {
        this.handleDeploy();

        this.setState({
            'modal_is_visible': false,
        });
    }

    handleCancel = () => {
        this.setState({
            'modal_is_visible': false,
        });
    }

    handleShuttleChange = (shuttle_id) => {
        this.setState({
            'shuttle_id': shuttle_id
        });
    }

    handleDeploy() {
        let deploy = {
            'supervisor_id': this.props.supervisor_id,
            'shuttle_id': this.state.shuttle_id,
            'driver_id': this.state.driver_id
        }

        postData('remittances/deployments/back-up-shuttles/deploy/', deploy)
            .then(response => {
                if (!response.error) {
                    message.success(this.props.driver_name + " has been deployed with back-up shuttle");
                } else {
                    console.log(response.error);
                }
            });
    }

    render() {
        return (
            <div className="subButton-container">
                <Button className="deployment-button" type="primary" onClick={this.showModal}>
                    Deploy
                </Button>
                <Modal
                    title="Deploy with a Back-up Shuttle"
                    visible={this.state.modal_is_visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    okText="Deploy"
                >
                    <DeployShuttleContent 
                        shuttle_display={this.props.shuttle_display}
                        handleShuttleChange={this.handleShuttleChange}
                    />
                </Modal>
            </div>
        );
    }
}

class DeployShuttleContent extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            "backUpShuttles": []
        }

        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.fetchBackUpShuttles();
    }

    handleChange(value) {
        this.props.handleShuttleChange(value);
    }

    fetchBackUpShuttles() {
        fetch('/remittances/deployments/back-up-shuttles/')
        .then(response => {
            return response;
        })
        .then(response => response.json())
        .then(data => {
            if (!data.error) {
                this.setState({
                    backUpShuttles: data.shuttles
                });
            }
            else {
                console.log(data.error)
            }
        }).catch(error => console.log(error));
    }

    render() {
        return (
            <div>
                <div>
                    <span>
                        {"Shuttle No." + this.props.shuttle_display + " "}
                    </span>
                    <span>
                        is currently <b>under maintenance</b>
                    </span>
                </div>
                <Divider></Divider>
                <Row gutter={16}>
                    <Col span={8}>
                        <label className="shuttle-label">
                            Back-Up Shuttle:
                        </label>
                    </Col>
                    <Col span={16}>
                        <Select onChange={this.handleChange} style={{ width: 200 }}>
                            {
                                this.state.backUpShuttles.map((item) => (
                                    <option value={item.id} key={item.id}>
                                        Shuttle#{item.shuttle_number} - {item.plate_number}
                                    </option>
                                ))
                            }
                        </Select>
                    </Col>
                </Row>
            </div>
        );
    }
}

class SubButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'modal_is_visible': false,
            'driver_id': this.props.driver_id,
            'sub_driver_id': null,
        }
        this.handleSubDriverChange = this.handleSubDriverChange.bind(this);
    }

    showModal = () => {
        this.setState({
            'modal_is_visible': true,
        });
    }

    handleOk = () => {
        this.handleDeploy();

        this.setState({
            'modal_is_visible': false,
        });
    }

    handleCancel = () => {
        this.setState({
            'modal_is_visible': false,
        });
    }

    handleSubDriverChange(sub_driver_id) {
        this.setState({
            'sub_driver_id': sub_driver_id
        });
    }

    handleDeploy() {
        let deploy = {
            'supervisor_id': this.props.supervisor_id,
            'driver_id': this.state.sub_driver_id,
            'absent_id': this.state.driver_id
        }

        postData('remittances/deployments/deploy-sub/', deploy)
            .then(response => {
                if (!response.error) {
                    message.success("A sub-driver has been deployed for " + this.props.driver_name);
                } else {
                    console.log(response.error);
                }
            });
    }

    render() {
        return (
            <div className="subButton-container">
                <Button className="deployment-button" onClick={this.showModal}>
                    Sub
                </Button>
                <Modal
                    title="Deploy a sub-driver"
                    visible={this.state.modal_is_visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    okText="Deploy"
                >
                    <SubContent
                        onSelectChange={this.handleSubDriverChange}
                        supervisor_id={this.props.supervisor_id}
                        shuttle={this.props.shuttle}
                        driver_name={this.props.driver_name}
                        route={this.props.route}
                    />
                </Modal>
            </div>
        );
    }
}

class SubContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'supervisor_id': this.props.supervisor_id,
            'subDrivers': [],
        };
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.fetchSubDrivers();
    }

    fetchSubDrivers() {
        console.log(this.state.supervisor_id)
        fetch('/remittances/shifts/sub_drivers/' + this.state.supervisor_id)
            .then(response => {
                return response;
            })
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    this.setState({
                        subDrivers: data.sub_drivers
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
        return (
            <div>
                <div>
                    <span className="select-group">
                        <label>Subdrivers: </label>
                        <Select onChange={this.handleChange} style={{ width: 200 }}>
                            {
                                this.state.subDrivers.map((item) => (
                                    <option value={item.driver.id} key={item.driver.id}>
                                        {item.driver.name}
                                    </option>
                                ))
                            }
                        </Select>
                    </span>
                </div>
                <div>
                    <span>Deployment Details</span>
                    <DetailItems
                        title="Subbing in for "
                        value={this.props.driver_name}
                    />
                    <DetailItems
                        title="Shuttle: "
                        value={this.props.shuttle}
                    />
                    <DetailItems
                        title="Route: "
                        value={this.props.route}
                    />
                </div>
            </div>
        );
    }
}