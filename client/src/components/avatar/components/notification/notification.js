import React, { Component } from 'react';
import './style.css';
import {List} from 'antd';

export class Notification extends Component{
    constructor(props){
        super(props);
    }

    render(){
        return(
            <div className="specific-notification">
                <List.Item>
                    <List.Item.Meta
                        title="Title Sir"
                        description="Animo Labs Thesis chuchu huhu"/>
                </List.Item>
            </div>
        );
    }
}