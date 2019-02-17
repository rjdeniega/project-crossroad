import React, {Component} from 'react';
import { List, Avatar, Button, Modal, message, Select } from 'antd';
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
                                    tickets="130pcs"
                                    photo={item.driver.photo}
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
                    title="Tickets Onhand"
                    value={props.tickets}
                />
            </div>
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
