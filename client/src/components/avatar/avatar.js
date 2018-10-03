/**
 * Created by JasonDeniega on 21/06/2018.
 */
import React, { Component } from 'react';
import './style.css'
import { Button, Badge, Tag, Avatar, Popover, List, Divider } from 'antd'
import { me } from '../../images/me.jpg'
import { Icon } from 'react-icons-kit'
import { bell } from 'react-icons-kit/fa/bell'
import { withRouter } from "react-router-dom";
import history from '../../utilities/history'
import users from '../../images/default.png'
import Notification from './components/notification/notification'
import PerfectScrollbar from "@opuscapita/react-perfect-scrollbar";

export class UserAvatar extends Component {
    constructor(props) {
        super(props);
        // Don't call this.setState() here!
        //set user for any children page of App (which is everything)
    }

    signOut = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("user_type");
        localStorage.removeItem("user_staff");
        history.replace('/sign-in');
    };

    render() {
        const content = (
            <div>
                <Button className="sign-out" onClick={this.signOut}>Sign-out</Button>
            </div>
        );
        const { username } = JSON.parse(localStorage.user);
        const notificationContent = (
            <div className="notification-area">
                <PerfectScrollbar>
                    <List itemlayout="horizontal">
                        <Notification />
                        <Notification />
                        <Notification />
                        <Notification />
                    </List>
                </PerfectScrollbar>
            </div>
        );
        return (
            <div className="header-icons">
                <div className="user-full-name"> {username}</div>
                <Tag className="user-type" color="var(--orange)">OM</Tag>
                <Popover placement="bottomRight" content={content} title="User Settings" trigger="click">
                    <div className="user-avatar">
                        <Avatar className="avatar-photo" size="large" src={users}/>
                    </div>
                </Popover>
                <Popover placement="bottomRight" content={notificationContent} title="Notifications" trigger="click">
                    <Badge count={5} className="notification" size={5}>
                        <Icon icon={bell} size={25} />
                    </Badge>
                </Popover>
            </div>
        );
    }
}

export default withRouter(UserAvatar)
