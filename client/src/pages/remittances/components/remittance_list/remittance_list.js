/**
 * Created by JasonDeniega on 01/07/2018.
 */
import {Avatar, List,Tag} from 'antd'
import React, {Component} from 'react';
import {data} from '../../../../pages/users/users'
import './style.css'

export class RemittanceList extends Component {
    render() {
        return (

                <div className="remittance-list-container">
                    <div className="label-container">
                        <div className="shift-label">AM</div>
                        <div className="shift-label-secondary">shift</div>
                    </div>

                    <div className="remittance-list-wrapper">
                        <List
                            className="remittance-list"
                            itemLayout="horizontal"
                            dataSource={data}
                            renderItem={item => (
                                <List.Item className="rem-list-item">
                                    <List.Item.Meta
                                        avatar={<Avatar className="rem-list-avatar" size="large"
                                                        src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"/>}
                                        title={<a className="rem-list-title"
                                                  href="https://ant.design">{item.title}</a>}
                                    />
                                </List.Item>
                            )}
                        />
                    </div>
                </div>

        )
    }
}