import React, { Component } from 'react';
import './style.css';
import {List} from 'antd';

export default class Notification extends Component{
    constructor(props){
        super(props);
    }

    render(){
        const {title, description} = this.props;
    
        return(
            <div className="specific-notification">
                <List.Item>
                    <List.Item.Meta
                        title={title}
                        description={description}/>
                </List.Item>
            </div>
        );
    }
}