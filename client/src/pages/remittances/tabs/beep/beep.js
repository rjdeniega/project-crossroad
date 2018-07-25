/**
 * Created by JasonDeniega on 02/07/2018.
 */

import React, { Component } from 'react';
import './style.css'
import emptyStateImage from '../../../../images/empty_state_construction.png'
import { Modal, Button, Input, Select } from 'antd'
import { postDataWithImage, postDataWithFile } from "../../../../network_requests/general";

const Option = Select.Option;
const columns = [{
    title: 'Date',
    dataIndex: 'date_of_iteration',
    key: 'date_of_iteration',
    render: (text) => (
        <div>
            {text}
        </div>
    )
}, {
    title: 'Shift Type',
    dataIndex: 'shift_type',
    key: 'shift_type',
    render: (text) => (
        <div className="rem-status">
            {text == "A" &&
            <div className="shift-table-column"><Icon type="check-circle" className="status-icon"/> <p>AM</p></div>}
            {text == "P" &&
            <div className="shift-table-column"><Icon type="check-circle" className="status-icon"/> <p>PM</p></div>}
            {text == "MN" &&
            <div className="shift-table-column"><Icon type="check-circle" className="status-icon"/> <p>MN</p></div>}
        </div>
    ),
}, {
    title: 'Total Remittances',
    dataIndex: 'grand_total',
    key: 'grand_total',
    render: (text) => (
        <div className="rem-status">
            <p><b>Php {text}</b></p>
        </div>
    ),
}, {
    title: 'Action',
    key: 'action',
    render: (text, record) => (
        <Button className="view-button" type="ghost" icon="eye">
            View Report
        </Button>
    ),
}];
export class BeepPane extends Component {
    state = {
        visible: false,
        file: null,
        shift_type: null,
    };
    showModal = item => event => {
        console.log(item);
        this.setState({
            visible: true,
        });
    };

    handleConfirm = (e) => {
        console.log(e);
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
    handleFileChange = (e) => {
        this.setState({
            file: e.target.files[0]
        });
        console.log(e.target.files[0])
    };
    handleSelectChange = fieldName => value => {
        // this function is to handle drop-downs
        const state = { ...this.state };
        state[fieldName] = value;
        this.setState({
            ...state
        });
    };
    handleUpload = () => {
        const formData = new FormData();
        formData.append('shift_type', this.state.shift_type);
        formData.append('file', this.state.file);
        console.log(formData);

        postDataWithFile('/remittances/beep/', formData)
            .then(data => {
                if (data.error) {
                    console.log("theres an error");
                    this.setState({
                        error: data["error"],
                    });
                    console.log(this.state.error);
                }
                else {
                    console.log(data);
                    console.log(data.user_staff);
                }
            })
            .catch(error => console.log(error));
    };

    render() {
        return (
            <div className="beep-tab-body">
                <Modal
                    title="Something"
                    visible={this.state.visible}
                    onOk={this.handleConfirm}
                    onCancel={this.handleCancel}
                >
                    <Select onChange={this.handleSelectChange("shift_type")} className="user-input" defaultValue="Male">
                        <Option value="A">AM</Option>
                        <Option value="P">PM</Option>
                        <Option value="M">Midnight</Option>
                    </Select>
                    <Input type="file" placeholder="select image" onChange={this.handleFileChange}/>
                    <Button type="primary" onClick={this.handleUpload}> Submit </Button>
                </Modal>
                <Button type="primary" onClick={this.showModal()}>Upload CSV</Button>
                <div className="table-div">
                    <Table bordered size="medium"
                           className="remittance-table"
                           columns={columns}
                           dataSource={this.state.shifts}
                    />
                </div>
            </div>
        );
    }
}