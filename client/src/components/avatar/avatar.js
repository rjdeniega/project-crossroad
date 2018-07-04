/**
 * Created by JasonDeniega on 21/06/2018.
 */
import React, {Component} from 'react';
import './style.css'
import {Button, Badge, Tag, Avatar, Popover} from 'antd'
import {me} from '../../images/me.jpg'
import {Icon} from 'react-icons-kit'
import {bell} from 'react-icons-kit/fa/bell'

const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};
const content = (
    <div>
        <p>Content</p>
        <Button className="sign-out" onClick={signOut}>Sign-out</Button>
    </div>
);

export class UserAvatar extends Component {
    render() {
        return (
            <div className="header-icons">
                <div className="user-full-name"> Jason Deniega</div>
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
