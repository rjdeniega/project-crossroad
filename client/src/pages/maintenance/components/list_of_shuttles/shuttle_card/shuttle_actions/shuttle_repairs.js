import React, {Component} from 'react'
import {Icon} from 'react-icons-kit'
import {wrench} from 'react-icons-kit/fa/wrench'
import {iosListOutline} from 'react-icons-kit/ionicons/iosListOutline'
import {Modal, Divider, Row, Col, Menu} from 'antd'
import {RepairForm} from "./repair_tabs/repair_form"
import {RepairsTable} from './repair_tabs/repair_list'

export class Repairs extends Component{
    constructor(props){
        super(props);
        this.state = {
            shuttle: props.shuttle,
            visible: false,
            currentPage: <RepairsTable shuttle={props.shuttle} />,
            modalWidth: 1100
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
        let width;
        if (e.key === "repairForm") {
            content = <RepairForm requestSubmitted={this.requestSubmitted.bind(this)}
                                  shuttle={this.state.shuttle}/>;
                              width = 650;
        } else {
            content = <RepairsTable shuttle={this.state.shuttle} />;
            width = 1100;
        }
        this.setState({
            currentPage: content,
            modalWidth: width
        });
    };

    requestSubmitted(){
        this.setState({
            currentPage: <RepairsTable shuttle={this.state.shuttle} />,
            modalWidth: 1100
        })
    }

    render() {
        const {shuttle} = this.state;
        return(
            <div>
                <Icon icon={wrench} onClick={this.showModal}/>
                <Modal title={"Shuttle " + shuttle.id + " repair information"}
                       visible={this.state.visible}
                       onCancel={this.handleCancel}
                       footer={false} width={this.state.modalWidth}>
                    <Menu onClick={this.handleClick}
                          selectedKeys={[this.state.currentPage]}
                          mode="horizontal">
                        <Menu.Item key='repairInfo' active>
                            <Icon icon={wrench}/> Repair Information
                        </Menu.Item>
                        <Menu.Item key='repairForm'>
                            <Icon icon={iosListOutline}/> Repair Request
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
