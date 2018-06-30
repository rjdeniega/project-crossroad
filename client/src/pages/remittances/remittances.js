/**
 * Created by JasonDeniega on 27/06/2018.
 */

import React, {Component} from 'react';
import './style.css'
import logo from '../../images/crossroad_logo.png'
import colors from '../../utilities/colorsFonts.css'
import {Icon} from 'react-icons-kit'
import {UsersPage, Page2} from '../../pages/users/users'
import {groupOutline} from 'react-icons-kit/typicons/groupOutline'
import {users} from 'react-icons-kit/feather/'
import {u1F46E} from 'react-icons-kit/noto_emoji_regular/u1F46E'
import {driversLicenseO} from 'react-icons-kit/fa/driversLicenseO'
import {cube} from 'react-icons-kit/fa/cube'
import {Avatar, List,Tag} from 'antd'
import {userCircleO} from 'react-icons-kit/fa/userCircleO'
import './style.css'
import {UserAvatar} from "../../components/avatar/avatar"
import {RemittanceNavBar} from './components/remittance_navigation/navigation'
import {money} from 'react-icons-kit/fa/money'
import {data} from '../../pages/users/users'


export class RemittancePage extends Component {
    render() {
        return (
            <div className="body-wrapper">
                <div className="remittance-page-wrapper">
                    <RemittanceNavBar/>
                    <div className="remittance-page-body">
                        <div className="remittance-header">
                            <div className="header-text">
                                <Icon className="page-icon" icon={money} size={42}/>
                                <div className="page-title"> Remittances</div>
                                <div className="current-date"> Manage ticketing remittances</div>
                            </div>
                            <UserAvatar/>
                        </div>
                        {/*<div className="filters">*/}
                            {/*<div className="filter-box">*/}
                                {/*<div className="filter-label">Filters:</div>*/}
                            {/*</div>*/}
                        {/*</div>*/}
                        <div className="remittance-lists">
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
                        </div>
                    </div>
                </div>

            </div>
        );
    }
}