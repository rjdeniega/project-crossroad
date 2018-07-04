/**
 * Created by Not JasonDeniega on 29/05/2018.
 */

import React, {Component} from 'react';
import './style.css'
import {UserAvatar} from '../../../../components/avatar/avatar'
import {Modal, Button, Input, Tabs, message, Row} from 'antd'
import {Icon} from 'react-icons-kit'
import {search} from 'react-icons-kit/fa/search'
import {dropbox} from 'react-icons-kit/typicons/dropbox'
import {Stepper} from '../item_stepper/stepper'
import '../../../../utilities/colorsFonts.css'


const TabPane = Tabs.TabPane;
function callback(key) {
    console.log(key);
}

function currentDate() {
    const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
    const tempDate = new Date();
    return monthNames[tempDate.getMonth()] + ' ' + tempDate.getDate() + ', '
        + tempDate.getFullYear()
}

export const date = currentDate();

export class Header extends Component {
    state = {visible: false};
    showModal = () => {
        this.setState({
            visible: true,
        });
    };
    handleOk = () => {
        message.success('Item successfully added!');
        this.setState({
            visible: false,
        });
    };
    handleCancel = (e) => {
        console.log(e);
        this.setState({
            visible: false,
        });
    };


    render() {
        return (
            //render logo and all items
            <div className="inventory-header">
                <div className='upper-header'>
                    <div className="header-text">
                    <Icon className="page-icon" icon={dropbox} size={42}/>
                    <div className="page-title">Inventory</div>
                    <div className="current-date"> Manage item stocks</div>
                    <Button className="add-item" onClick={this.showModal}>Add Item</Button>
                    <Modal
                        className="add-item-modal"
                        title="Add Item"
                        visible={this.state.visible}
                        onOk={this.handleOk}
                        onCancel={this.handleCancel}
                        footer={null}>
                        <Stepper handleOk={this.handleOk}/>
                    </Modal>
                </div>
                <UserAvatar/>
                </div>
            </div>
        );
    }

}