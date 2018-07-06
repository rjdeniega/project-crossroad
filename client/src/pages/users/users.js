/**
 * Created by JasonDeniega on 24/05/2018.
 */
import React, {Component} from "react"
import {Header} from "./components/header/header"
import '../../utilities/colorsFonts.css'
import {List, Avatar} from 'antd'
import './style.css'
import emptyStateImage from '../../images/empty state record.png'
import {Spin} from 'antd';


export const data = [
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
    {
        title: 'Ant Design Title 4',
    },
    {
        title: 'Ant Design Title 4',
    },
    {
        title: 'Ant Design Title 4',
    },
    {
        title: 'Ant Design Title 4',
    },
];
export class UsersPage extends Component {
    state = {
        drivers: null
    };

    componentDidMount() {
        return fetch('/members/drivers').then(response => response.json()).then(data => {
            this.setState({
                drivers: data["drivers"]
            });
        });
    }

    renderList = () => (
        <List
            className="user-list"
            itemLayout="horizontal"
            dataSource={this.state.drivers}
            renderItem={item => (
                <List.Item className="list-item">
                    <List.Item.Meta
                        avatar={<Avatar className="list-avatar" size="large"
                                        src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"/>}
                        title={<a className="list-title" href="https://ant.design">{item.name}</a>}
                        description={<p className="list-description"> operations manager</p>}
                    />
                </List.Item>
            )}
        />
    );

    render() {
        const {drivers} = this.state;
        const isLoading = drivers === null;
        return (
            <div className="body-wrapper">
                <Header/>
                <div className="page-body">
                    <div className="user-list-wrapper">
                        {drivers && this.renderList()}
                        {isLoading &&
                        <Spin size="large"/>
                        }
                    </div>
                    <div className="item-details-wrapper">
                        <img className="empty-image" src={emptyStateImage}/>
                        <p className="empty-message">Looks like this user has no historical records yet</p>
                    </div>
                </div>
            </div>
        );
    }
}


