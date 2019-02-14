import React, {Component} from 'react';
import {Table, Divider, Tag} from 'antd';
import './style.css'
import {getData} from "../../../../network_requests/general";

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

const columns = [{
    title: 'PO Number',
    dataIndex: 'po_number',
    key: 'po_number',
    align: 'left',
    sorter: (a, b) => a.po_number - b.po_number,
}, {
    title: 'Order Date',
    dataIndex: 'order_date',
    key: 'order_date',
    align: 'left',
    defaultSortOrder: 'descend',
    sorter: (a, b) => a.order_date - b.order_date,
    render: date => (
        <span>{dateFormat(date)}</span>
    )
}, {
    title: 'Delivery Date',
    dataIndex: 'delivery_date',
    key: 'delivery_date',
    align: 'left',
    sorter: (a, b) => a.delivery_date - b.delivery_date,
    render: date => (
        <span>{dateFormat(date)}</span>
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
    render: () => (
        <span>
            <a href="#">Update</a>
            <Divider type='vertical'/>
            <a href="#">View</a>
        </span>)
}];

export class PurchaseOrderList extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {purchase_order_list} = this.props;
        return (<div>
            <Table columns={columns} dataSource={purchase_order_list} pagination={{pageSize: 7}}/>
        </div>)
    }
}