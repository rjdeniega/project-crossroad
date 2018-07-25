import React, {Component} from 'react'
import {Icon} from 'react-icons-kit'
import {wrench} from 'react-icons-kit/fa/wrench'
import {Modal, Divider, Row, Col} from 'antd'

export class RepairForm extends Component{
    constructor(props){
        super(props);
        this.state = {
            shuttle: props.shuttle,
            visible: false
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

    render() {
        const {shuttle} = this.state;
        return(
            <div>
                <Icon icon={wrench} onClick={this.showModal}/>
                <Modal title={"Shuttle " + shuttle.id + " repair information"}
                       visible={this.state.visible}
                       onCancel={this.handleCancel}
                       footer={false} width={1000}>
                </Modal>
            </div>
        )
    }
}