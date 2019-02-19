import React, {Component} from 'react';
import {Table, Divider, Tag, Modal, Button, message} from 'antd';
import './style.css'
import {getData} from "../../../../network_requests/general";
import ReactToPrint from 'react-to-print'
import {PurchaseOrderView} from "../purchase_order_view/purchase_order_view";
import {Icon} from 'react-icons-kit'
import {printer} from 'react-icons-kit/icomoon/printer'
import {UpdatePurchaseOrder} from "../update_purchase_order/update_purchase_order";

function pad(num) {
    let digits = 6 - num.toString().length;
    let output = '';
    for (let i = 0; i < digits; i++) {
        output += '0';
    }
    output = output + num;
    return output;
}

function tagColour(status) {
    let color;
    if (status === 'Complete') {
        color = 'green';
    } else if (status === 'Processing') {
        color = 'blue';
    } else if (status === 'Requires Payment') {
        color = 'gold';
    } else {
        color = 'red';
    }
    return color;
}


export class PurchaseOrderList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: false,
            update_modal: false,
        }
    }


    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    updateModal = () => {
        this.setState({
            update_modal: true,
        })
    };

    disapprove = (po_id) => {
        this.setState({
            update_modal: false,
        });
        message.success(po_id)
    };

    confirm = (po_id, items) => {
        this.setState({
            update_modal: false,
        });
        message.success(po_id)
    };

    handleOk = (e) => {
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

    handleCancel2 = (e) => {
        console.log(e);
        this.setState({
            update_modal: false,
        });
    };

    columns = [{
        title: 'PO Number',
        dataIndex: 'po_number',
        key: 'po_number',
        align: 'left',
        render: number => (
            <span>{pad(number)}</span>
        ),
        sorter: (a, b) => a.po_number - b.po_number,
    }, {
        title: 'Order Date',
        dataIndex: 'order_date',
        key: 'order_date',
        align: 'left',
        defaultSortOrder: 'descend',
        sorter: (a, b) => a.order_date - b.order_date,
        render: date => (
            <span>{new Date(date.substring(0, 10)).toLocaleDateString()}</span>
        )
    }, {
        title: 'Delivery Date',
        dataIndex: 'delivery_date',
        key: 'delivery_date',
        align: 'left',
        sorter: (a, b) => a.delivery_date - b.delivery_date,
        render: date => (
            <span>{date !== null ? new Date(date.substring(0, 10)).toLocaleDateString() : "N/A"}</span>
        )
    }, {
        title: 'Vendor',
        dataIndex: 'vendor',
        key: 'vendor',
        align: 'left',
        sorter: (a, b) => {
            return a.vendor.localeCompare(b.vendor)
        },
    }, {
        title: 'Status',
        key: 'status',
        dataIndex: 'status',
        align: 'right',
        filters: [{
            text: 'Complete',
            value: 'Complete',
        }, {
            text: 'Processing',
            value: 'Processing',
        }, {
            text: 'Requires Payment',
            value: 'Requires Payment',
        }, {
            text: 'Rejected',
            value: 'Rejected',
        }],
        onFilter: (value, record) => record.status.indexOf(value) === 0,
        render: text => (
            <span>
            <Tag color={tagColour(text)} key={text}>{text}</Tag>
        </span>)

    }, {
        key: 'action',
        dataIndex: 'id',
        render: value => (
            <span>
            <a onClick={this.updateModal}>Update</a>
                <Modal
                    title="Update Status"
                    visible={this.state.update_modal}
                    onCancel={this.handleCancel2}
                    className="update-purchase-order-modal"
                    footer={[
                        <Button key={1} htmlType='button' type="danger" onClick={() => this.disapprove(value)}>Disapproved</Button>,
                        <Button key={2} htmlType='button' type="primary" onClick={() => this.confirm(value)}>Confirm</Button>
                    ]}>
                    <UpdatePurchaseOrder po_id={value}/>
                </Modal>
            <Divider type='vertical'/>
            <a onClick={this.showModal}>View</a>
            <Modal
                title="Purchase Order"
                visible={this.state.visible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                className="purchaseOrderModal"
                footer={[
                    <ReactToPrint key={1}
                        trigger={() => <Button htmlType="button" type="primary"><Icon className="print"
                                                                                      icon={printer}
                                                                                      size={14}/> &nbsp; Print this out!</Button>}
                        content={() => this.componentRef}
                    />
                ]}
            >
                <PurchaseOrderView po_id={value} ref={el => (this.componentRef = el)}/>
            </Modal>
        </span>)
    }];

    render() {
        const {purchase_order_list} = this.props;
        console.log(purchase_order_list);
        return (<div>
            <Table columns={this.columns} dataSource={purchase_order_list} pagination={{pageSize: 7}}/>

        </div>)
    }
}