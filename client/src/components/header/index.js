/**
 * Created by JasonDeniega on 29/05/2018.
 */

import React, {Component} from 'react';
import './style.css'
import {Page1, Page2} from '../../pages/home/home.js'
import {UserAvatar} from '../../components/avatar'
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
                <Input.Search
                    className="user-search"
                    placeholder="search for users"
                    onSearch={value => console.log(value)}
                    suffix={<Icon size={18} icon={search}/>}
                />
                <Tabs className="user-tabs" defaultActiveKey="1" onChange={callback}>
                    <TabPane className="tab-item" tab="Tab 1" key="1"></TabPane>
                    <TabPane className="tab-item" tab="Tab 2" key="2"></TabPane>
                    <TabPane className="tab-item" tab="Tab 3" key="3"></TabPane>
                </Tabs>
                <UserAvatar/>
            </div>
        );
    }

}