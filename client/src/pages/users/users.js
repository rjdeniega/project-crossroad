/**
 * Created by JasonDeniega on 24/05/2018.
 */
import React,  { Component, Fragment } from "react"
import { Header } from "./components/header/header"
import '../../utilities/colorsFonts.css'
import { Tag, List, Avatar, Divider, Button } from 'antd'
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
        photoSrc ? console.log('not null') : console.log('null')
        return <Avatar className="list-avatar" size="large"
                       src={photoSrc ? photoSrc : users}/>;
    };

    handleClick = (data) => {
        console.log(data)
        this.setState({
            activeUser: data
        })
    }

    renderList = () => (
        <List
            className="user-list"
            itemLayout="horizontal"
            dataSource={(() => {
                console.log(this.state.users);
                return this.state.users;
            })()}
            renderItem={item => (
                <List.Item className="list-item" onClick={() => this.handleClick(item)}>
                    <List.Item.Meta
                        avatar={this.renderListItemPhoto(item.photo)}
                        title={<p className="list-title">{item.name}</p>}
                        description={<Tag color="geekblue"> {item.user_type}</Tag>}
                    />
                </List.Item>
            )}
        />
    );

    render() {
        const { activeUser } = this.state;
        const isLoading = users === null;
        return (
            <div className="body-wrapper">
                <Header onNewUserCreate={this.onNewUserCreate}/>
                <div className="page-body">
                    <div className="user-list-wrapper">
                        {this.state.users && this.renderList()}
                        {isLoading &&
                        <Spin className="user-spinner" indicator={antIcon} size="large"/>
                        }
                    </div>
                    <div className="item-details-wrapper">
                        {!activeUser &&
                        <Fragment>
                            <img className="empty-image" src={emptyStateImage}/>
                            <p className="empty-message">Select User to View Details</p>
                        </Fragment>
                        }
                        {activeUser &&
                        <div className="profile-container">
                            <div className="container">
                                <div className="header-div">
                                    <img className="profile-image"
                                         src={activeUser.photo ? activeUser.photo : users}/>
                                    <div className="basic-info">
                                        <div className="info-row"><b>Name:</b> {activeUser.name}</div>
                                        <div className="info-row"><b>Contact Number:</b> {activeUser.contact_no}
                                        </div>
                                        <div className="info-row"><b>E-mail:</b> {activeUser.email}</div>
                                    </div>
                                </div>
                                <Divider orientation="left">Optional User Information</Divider>
                                <div className="member-info">
                                    <div className="info-row-1"><b>Accepted date:</b> {activeUser.accepted_date}
                                    </div>
                                    <div className="info-row-1"><b>E-mail:</b> {activeUser.email}</div>
                                    <div className="info-row-1"><b>Religion:</b> {activeUser.religion}</div>
                                    <div className="info-row-1"><b>Sex:</b> {activeUser.sex}</div>
                                    <div className="info-row-1"><b>Address:</b> {activeUser.address}</div>

                                </div>
                            </div>
                        </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}


