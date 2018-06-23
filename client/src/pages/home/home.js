/**
 * Created by JasonDeniega on 24/05/2018.
 */
import React, {Component} from "react";
import {Tag, List, Avatar} from 'antd';
import './style.css'

const data = [
    {
        title: 'Ant Design Title 1',
    },
    {
        title: 'Ant Design Title 2',
    },
    {
        title: 'Ant Design Title 3',
    },
    {
        title: 'Ant Design Title 4',
    },
];
export class Page1 extends Component {
    render() {
        return (
            <div className="page-body">
                <div className="user-list-wrapper">
                    <List
                        className="user-list"
                        itemLayout="horizontal"
                        dataSource={data}
                        renderItem={item => (
                            <List.Item className="list-item">
                                <List.Item.Meta
                                    avatar={<Avatar className="list-avatar" size="large"
                                                    src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"/>}
                                    title={<a href="https://ant.design">{item.title}</a>}
                                    description={<Tag className="list-user-type" color="var(--divider)">OM</Tag>}
                                />
                            </List.Item>
                        )}
                    />
                </div>
            </div>

        );
    }
}

export class Page2 extends Component {
    render() {
        return (
            <div className="body-container">
                <h1>Page 2</h1>
            </div>
        )
    }
}

