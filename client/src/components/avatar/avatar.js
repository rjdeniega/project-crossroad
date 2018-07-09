/**
 * Created by JasonDeniega on 21/06/2018.
 */
import React, {Component} from 'react';
import './style.css'
import {Button, Badge, Tag, Avatar, Popover} from 'antd'
import {me} from '../../images/me.jpg'
import {Icon} from 'react-icons-kit'
import {bell} from 'react-icons-kit/fa/bell'
import {withRouter} from "react-router-dom";
import history from '../../utilities/history'
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
                <p>Content</p>
                <Button className="sign-out" onClick={this.signOut}>Sign-out</Button>
            </div>
        );
        const {username} = JSON.parse(localStorage.user);
        return (
            <div className="header-icons">
                <div className="user-full-name"> {username}</div>
                <Tag className="user-type" color="var(--orange)">OM</Tag>
                <Popover placement="bottomRight" content={content} title="User Settings" trigger="click">
                    <div className="user-avatar">
                        <Avatar size="large" style={{backgroundColor: 'var(--purple'}}
                                src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"/>
                    </div>
                </Popover>
                <Badge count={5} className="notification" size={5}>
                    <Icon icon={bell} size={25}/>
                </Badge>
            </div>
        );
    }
}

export default withRouter(UserAvatar)
