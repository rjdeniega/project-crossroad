import React, {Component} from 'react';
import { List, Avatar, Button, Modal, message, Select, Icon, Tooltip } from 'antd';
import '../revised-style.css';
import { postData } from '../../../../../network_requests/general';


export class DuringDeployment extends React.Component {
    constructor(props){
        super(props);
        console.log(this.props.deployedDrivers)
    }

    render(){
        return (
            <div className="phase-container">
                <Header
                    title="During Deployment"
                    description="Monitor deployed drivers"
                />
                <DeploymentList
                    deployedDrivers={this.props.deployedDrivers}
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
                dataSource={props.deployedDrivers}
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
                                    start_time={item.start_time}
                                    tickets="130pcs"
                                    photo={item.driver.photo}
                                    absent_driver={item.absent_driver}
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
    const absent_driver = props.absent_driver
    
    if(typeof absent_driver == "undefined"){
        return (
            <div>
                <div className="deployment-header">
                    <Avatar src={props.photo} shape="square" />
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
                        title="Start Time"
                        value={props.start_time}
                    />
                    <DetailItems
                        title="Tickets Onhand"
                        value={props.tickets}
                    />
                </div>
                
                <StopDeploymentButton
                    supervisor_id={supervisor.id}
                    driver_id={props.driver_id}
                />
            </div>
        );
    } else {
        const prompt_text = props.name + " was subbed in for " + absent_driver.name

        return (
            <div>
                <div className="deployment-header">
                    <Tooltip title={prompt_text} placement="topLeft">
                        <Avatar src={absent_driver.photo} shape="square" /> 
                        <Icon type="arrow-right" className="sub-arrow" />
                        <Avatar src={props.photo} shape="square" />
                        <span className="deployment-name">
                            {props.name}
                        </span>
                    </Tooltip>
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
                        title="Start Time"
                        value={props.start_time}
                    />
                    <DetailItems
                        title="Tickets Onhand"
                        value={props.tickets}
                    />
                </div>

                <StopDeploymentButton
                    supervisor_id={supervisor.id}
                    driver_id={props.driver_id}
                    driver_name={props.driver_name}
                />
            </div>
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

class StopDeploymentButton extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            modal_visibility: false
        }
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

    handleStop() {
        let deploy = {
            'supervisor_id': this.props.supervisor_id,
            'driver_id': this.props.driver_id
        }

        postData('remittances/deployments/', deploy)
            .then(response => {
                if (!response.error) {
                    message.success(this.props.driver_name + " has been deployed");
                } else {
                    console.log(response.error);
                }
            });
    }

    render() {
        return (
            <div className="deployment-button-container">
                <Button
                    type="danger"
                    className="deployment-button"
                    onClick={this.showModal}
                >
                    Stop
                </Button>

                <Modal
                    title="Stop Deployment"
                    visible={this.state.modal_visibility}
                    onOk={this.handleCancel}
                    onCancel={this.handleCancel}
                >
                </Modal>
            </div>
        );
    }
}
