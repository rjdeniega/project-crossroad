/**
 * Created by JasonDeniega on 29/05/2018.
 */

import React, {Component} from 'react';
import './style.css'
import {UserAvatar} from '../../../../components/avatar/avatar'
import {Input, Tabs} from 'antd'
import {Icon} from 'react-icons-kit'
import {search} from 'react-icons-kit/fa/search'
import {group} from 'react-icons-kit/typicons/group'


const TabPane = Tabs.TabPane;
function callback(key) {
    console.log(key);
}
export class Header extends Component {
    render() {
        return (
            //render logo and all items
            <div className="header">
                <div className="header-text">
                    <Icon className="page-icon" icon={group} size={42}/>
                    <div className="page-title"> Users</div>
                    <div className="current-date"> Feb 16 2018</div>
                </div>
                {/*to transfer these components*/}
                <UserAvatar/>
                <div className="header-bottom">
                    <div className="user-search-wrapper">
                        <Input.Search
                            className="user-search"
                            placeholder="search for users"
                            onSearch={value => console.log(value)}
                            suffix={<Icon size={18} icon={search}/>}
                        />
                    </div>
                    <div className="user-tabs-wrapper">
                        <Tabs className="user-tabs" defaultActiveKey="1" onChange={callback}>
                            <TabPane className="tab-item" tab="Overview" key="1"></TabPane>
                            <TabPane className="tab-item" tab="History" key="2"></TabPane>
                            <TabPane className="tab-item" tab="Something" key="3"></TabPane>
                        </Tabs>
                    </div>
                </div>
            </div>
        );
    }

}