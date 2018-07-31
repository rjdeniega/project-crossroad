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
            currentPage: 1,
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
        if (e.key === "1") {
            content = 1;
            width = 650;
        } else {
            content = 2;
            width = 1100;
        }
        this.setState({
            currentPage: content,
            modalWidth: width
        });
    };

    requestSubmitted(){
        this.setState({
            currentPage: 1,
            modalWidth: 1100
        })
    }
    renderCurrentPage = () => {
        const { currentPage} = this.state;
        switch (currentPage) {
            case 1:
                return <RepairsTable shuttle={this.state.shuttle} />;
            case 2:
                return <RepairForm requestSubmitted={this.requestSubmitted.bind(this)}
                                  shuttle={this.props.shuttle}/>;
            default:
                return <RepairsTable shuttle={this.state.shuttle}/>;
        }
    };

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
                        <Menu.Item key="1" active>
                            <Icon icon={wrench}/> Repair Information
                        </Menu.Item>
                        <Menu.Item key="2">
                            <Icon icon={iosListOutline}/> Repair Request
                        </Menu.Item>
                    </Menu>
                    <div className='repair-modal-body'>
                        {this.renderCurrentPage()}
                    </div>
                </Modal>
            </div>
        )
    }
}
