/**
 * Created by JasonDeniega on 21/06/2018.
 */
import React, {Component} from 'react';
import './style.css'
import {Badge, Tag, Avatar} from 'antd'
import {me} from '../../images/me.jpg'
import {Icon} from 'react-icons-kit'
import {bell} from 'react-icons-kit/fa/bell'


export class UserAvatar extends Component {
    render() {
        return (
            <div className="header-wrapper">
                <div className="header-icons">
                    <div className="user-full-name"> Jason Deniega</div>
                    <Tag className="user-type" color="var(--purple)">OM</Tag>
                    <div className="user-avatar">
                        <Avatar size="large" style={{backgroundColor: 'var(--purple'}}
                                src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"/>
                    </div>
                    <Badge count={5} className="notification" size={5}>
                        <Icon icon={bell} size={25}/>
                    </Badge>
                </div>
            </div>
        );
    }
}
