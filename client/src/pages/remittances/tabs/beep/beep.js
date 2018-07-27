/**
 * Created by JasonDeniega on 02/07/2018.
 */

import React, { Component } from 'react';
import './style.css'
import emptyStateImage from '../../../../images/empty_state_construction.png'
import { Modal, Button, Input, Select, Icon, Table } from 'antd'
import { postDataWithImage, postDataWithFile, getData } from "../../../../network_requests/general";

const Option = Select.Option;
const columns = [{
    title: 'Date',
    dataIndex: 'shift.date',
    key: 'shift_date',
    render: (text) => (
        <div>
            {text}
        </div>
    )
}, {
    title: 'Shift Type',
    dataIndex: 'shift.type',
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
    dataIndex: 'total',
    key: 'grand_total',
    render: (text, record) => (
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
const transaction_columns = [{
    title: 'Card Number',
    dataIndex: 'card_number',
    key: 'card_number',
    render: (text) => (
        <div>
            {text}
        </div>
    )
}, {
    title: 'Member Name',
    dataIndex: 'member',
    key: 'member',
    render: (text) => (
        <div>
            {!text && <p>Prospect</p>}
            {text}
        </div>
    )
}, {
    title: 'Total Remittances',
    dataIndex: 'total',
    key: 'grand_total',
    render: (text, record) => (
        <p><b>Php {parseInt(text)}</b></p>
    ),
}];

export class BeepPane extends Component {
    state = {
        visible: false,
        report_visible: false,
        file: null,
        shift_type: null,
        shifts: [],
        transactions: []
    };

    componentDidMount() {
        this.fetchTransactions();
    }

    fetchTransactions = () => {
        getData('/remittances/beep/').then(data => {
            if (!data.error) {
                console.log(data.beep_shifts);
                this.setState({
                    shifts: data.beep_shifts
                })
            }
            else {
                console.log(data);
            }
        }).catch(error => console.log(error))
    };
    showModal = item => event => {
        this.setState({
            visible: true
        })
    };
    handleConfirm = (e) => {
        this.handleUpload();
        this.setState({
            visible: false,
            file: null,
            shift_type: null,
        });
    };
    handleCancel = (e) => {
        console.log(e);
        this.setState({
            visible: false,
        });
    };
    fetchTransactionData = data => {
        console.log("entered here");
        console.log(data);
        this.setState({
            report_visible: true,
            transactions: data
        });
    };
    handleReportConfirm = (e) => {
        this.handleUpload();
        this.setState({
            report_visible: false,
        });
    };
    handleReportCancel = (e) => {
        console.log(e);
        this.setState({
            report_visible: false,
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
                    <Select onChange={this.handleSelectChange("shift_type")} className="user-input"
                            defaultValue="Please select shift type">
                        <Option value="A">AM</Option>
                        <Option value="P">PM</Option>
                        <Option value="M">MN</Option>
                    </Select>
                    <Input className="user-input" type="file" placeholder="select image"
                           onChange={this.handleFileChange}/>
                    {/*<Button type="primary" onClick={this.handleUpload}> Submit </Button>*/}
                </Modal>
                <Modal
                    className="transaction-modal"
                    title="Basic Modal"
                    visible={this.state.report_visible}
                    onOk={this.handleReportConfirm}
                    onCancel={this.handleReportCancel}
                >
                    <Table bordered size="medium"
                           className="remittance-table"
                           columns={transaction_columns}
                           dataSource={this.state.transactions}
                    />
                </Modal>
                <Button type="primary" className="upload-button" onClick={this.showModal()}>Upload CSV</Button>
                <div className="table-div">
                    <Table bordered size="medium"
                           className="remittance-table"
                           columns={columns}
                           dataSource={this.state.shifts}
                           onRow={(record) => {
                               return {
                                   onClick: () => {
                                       console.log(record);
                                       this.fetchTransactionData(record.transactions);
                                   },       // click row
                               };
                           }}
                    />
                </div>
            </div>
        );
    }
}