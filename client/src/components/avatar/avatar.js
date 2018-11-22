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
import { alignCenter } from 'react-icons-kit/feather';

export class UserAvatar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            notifications: [],
            unread: []
        };

        this.fetchNotifications = this.fetchNotifications.bind(this)
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

    componentDidMount(){
        this.fetchNotifications()
    }

    fetchNotifications() {
        fetch('notifications/' + JSON.parse(localStorage.user_type))
            .then(response => {
                return response;
            })
            .then(response => response.json())
            .then(data => {
                if(!data.error){
                    this.setState({
                        notifications: data.notifications,
                        unread: data.unread
                    });
                } else {
                    console.log(data.error)
                }
            }).catch(error => console.log(error));
    }

    render() {

        const {notifications, unread} = this.state;
        const content = (
            <div>
                <Button className="sign-out" onClick={this.signOut}>Sign-out</Button>
            </div>
        );
        const { username } = JSON.parse(localStorage.user);

        return <div className="header-icons">
            <div className="user-full-name"> {username}</div>
            {/*<Tag className="user-type" color="var(--orange)">*/}
              {/*OM*/}
            {/*</Tag>*/}
            <Popover placement="bottomRight" content={content} title="User Settings" trigger="click">
              <div className="user-avatar">
                <Avatar className="avatar-photo" size="large" src={users} />
              </div>
            </Popover>
            <Popover placement="bottomRight" content={notifications.length == 0 ? <div className="notification-area">
                    <p centered>You have no notifications</p>
                  </div> : <div className="notification-area">
                    <PerfectScrollbar>
                      <List itemlayout="horizontal">
                        {notifications.map(function (d, idx) {
                            console.log(d)
                            return (<Notification key={idx} title={d.type}
                                    description={d.description} isRead={d.is_read} id={d.id}/>)
                        })}
                      </List>
                    </PerfectScrollbar>
                  </div>} title="Notifications" trigger="click">
              <Badge count={unread.length} className="notification" size={5}>
                <Icon icon={bell} size={25} />
              </Badge>
            </Popover>
          </div>;
    }
}

export default withRouter(UserAvatar)
