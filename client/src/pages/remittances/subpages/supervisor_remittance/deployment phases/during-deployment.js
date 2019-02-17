import React, {Component} from 'react';

import '../revised-style.css';

export class DuringDeployment extends React.Component {
    constructor(props){
        super(props);
    }

    render(){
        return (
            <div className="phase-container">
                <Header
                    title="During Deployment"
                    description="Monitor deployed drivers"
                />
                <DeploymentList
                    plannedDrivers={this.props.deployedDrivers}
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
                                    expected_departure={item.expected_departure}
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

