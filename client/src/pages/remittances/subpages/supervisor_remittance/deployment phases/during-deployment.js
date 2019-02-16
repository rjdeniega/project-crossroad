import React, {Component} from 'react';

import '../revised-style.css';

export class DuringDeployment extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            deployedDrivers: [],
        }
    }

    componentDidMount() {
        
    }

    render(){
        return (
            <div className="phase-container">
                During-Deployment
            </div>
        );
    }
}