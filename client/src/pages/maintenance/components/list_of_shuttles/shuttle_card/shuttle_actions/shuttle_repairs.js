import React, {Component} from 'react'
import {Icon} from 'react-icons-kit'
import {wrench} from 'react-icons-kit/fa/wrench'
import {iosListOutline} from 'react-icons-kit/ionicons/iosListOutline'
import {Modal, Divider, Row, Col, Menu} from 'antd'
import {RepairForm} from "./repair_tabs/repair_form";

export class Repairs extends Component{
    constructor(props){
        super(props);
        this.state = {
            shuttle: props.shuttle,
            visible: false,
            currentPage: "repairInfo"
        }
    }

    showModal = () => {
        this.setState({
            visible: true
        })
    };

    handleCancel = () => {
        this.setState({
            visible: false
        })
    };

    handleClick = (e) => {
        let content;
        if (e.key === "repairForm") {
            content = <RepairForm/>
        } else {
            content = "ehe"
        }
        this.setState({
            currentPage: content,
        });
    };

    render() {
        const {shuttle} = this.state;
        return(
            <div>
                <Icon icon={wrench} onClick={this.showModal}/>
                <Modal title={"Shuttle " + shuttle.id + " repair information"}
                       visible={this.state.visible}
                       onCancel={this.handleCancel}
                       footer={false} width={750}>
                    <Menu onClick={this.handleClick}
                          selectedKeys={[this.state.currentPage]}
                          mode="horizontal">
                        <Menu.Item key='repairInfo' active>
                            <Icon icon={wrench}/> Repair Information
                        </Menu.Item>
                        <Menu.Item key='repairForm'>
                            <Icon icon={iosListOutline}/> Repair Form
                        </Menu.Item>
                    </Menu>
                    <div className='repair-modal-body'>
                        {this.state.currentPage}
                    </div>
                </Modal>
            </div>
        )
    }
}