/**
 * Created by JasonDeniega on 24/05/2018.
 */
import React, { Component } from "react"
import { Header } from "./components/header/header"
import '../../utilities/colorsFonts.css'
import { List, Avatar } from 'antd'
import './style.css'
import emptyStateImage from '../../images/empty state record.png'
import users from '../../images/default.png'
import { Spin, Icon } from 'antd';

const antIcon = <Icon type="loading" style={{ fontSize: 70, color: 'var(--darkgreen)' }} spin/>;
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
        users: null
    };

    componentDidMount() {
        this.fetchUsers()
    }

    componentDidUpdate() {

    }

    onNewUserCreate = (user) => {
        this.setState({
            users: [user, ...this.state.users]
        })
    };

    fetchUsers() {
        return fetch('/staff_accounts').then(response => response.json()).then(data => {
            this.setState({
                users: data["people"].reverse()
            }, () => console.log(this.state.users));
        });
    }

    renderListItemPhoto = photoSrc => {
        console.log("Photo src", photoSrc);
        return  <Avatar className="list-avatar" size="large"
                src={photoSrc ? photoSrc : users}/>;
    };

    renderList = () => (
        <List
            className="user-list"
            itemLayout="horizontal"
            dataSource={(() => {
                console.log(this.state.users);
                return this.state.users;
            })()}
            renderItem={item => (
                <List.Item className="list-item">
                    <List.Item.Meta
                        avatar={this.renderListItemPhoto(item.photo)}
                        title={<a className="list-title" href="https://ant.design">{item.name}</a>}
                        description={<p className="list-description"> operations manager</p>}
                    />
                </List.Item>
            )}
        />
    );

    render() {
        const { users } = this.state;
        const isLoading = users === null;
        return (
            <div className="body-wrapper">
                <Header onNewUserCreate={this.onNewUserCreate}/>
                <div className="page-body">
                    <div className="user-list-wrapper">
                        {users && this.renderList()}
                        {isLoading &&
                        <Spin className="user-spinner" indicator={antIcon} size="large"/>
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


