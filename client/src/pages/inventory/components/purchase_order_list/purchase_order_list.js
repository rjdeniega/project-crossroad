import React, {Component} from 'react';
import {Table, Divider, Tag, Modal, Button} from 'antd';
import './style.css'
import {getData} from "../../../../network_requests/general";
import ReactToPrint from 'react-to-print'
import {PurchaseOrderView} from "../purchase_order_view/purchase_order_view";
import {Icon} from 'react-icons-kit'
import {printer} from 'react-icons-kit/icomoon/printer'

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

function dateFormat(date) {
    if (date === null) {
        return "N/A"
    } else {
        return date.toLocaleString()
    }
}

const data = [{
    key: '1',
    po_number: '72391',
    order_date: new Date(2019, 0, 15, 12, 1),
    delivery_date: null,
    vendor: "Ace Hardware",
    status: "Processing",
}, {
    key: '2',
    po_number: '75923',
    order_date: new Date(2019, 0, 1, 4, 23),
    delivery_date: new Date(2019, 0, 8, 12, 1),
    vendor: "Ace Hardware",
    status: "Requires Payment",
}, {
    key: '3',
    po_number: '71265',
    order_date: new Date(2019, 1, 9, 12, 1),
    delivery_date: null,
    vendor: "Budjolex",
    status: "Processing",
}, {
    key: '4',
    po_number: '12364',
    order_date: new Date(2019, 0, 4, 2, 1),
    delivery_date: new Date(2019, 0, 7, 8, 1),
    vendor: "Concorde",
    status: "Complete",
}];


export class PurchaseOrderList extends Component {
    constructor(props) {
        super(props);

        this.state = {visible: false}
    }


    showModal = () => {
        this.setState({
            visible: true,
        });
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
            <a href="#">Update</a>
            <Divider type='vertical'/>
            <a onClick={this.showModal}>View</a>
            <Modal
                title="Purchase Order"
                visible={this.state.visible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                className="purchaseOrderModal"
                footer={[
                    <ReactToPrint
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