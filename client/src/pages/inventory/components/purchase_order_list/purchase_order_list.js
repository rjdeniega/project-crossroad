import React, {Component} from 'react';
import {Table, Divider, Tag, Modal, Button, message} from 'antd';
import './style.css'
import {getData} from "../../../../network_requests/general";
import {PurchaseOrderView} from "../purchase_order_view/purchase_order_view";
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
    }

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
        sorter: (a, b) => {
            return new Date(a.order_date) > new Date(b.order_date)
        },
        render: date => (
            <span>{new Date(date.substring(0, 10)).toLocaleDateString()}</span>
        )
    }, {
        title: 'Delivery Date',
        dataIndex: 'delivery_date',
        key: 'delivery_date',
        align: 'left',
        sorter: (a, b) => {
            return new Date(a.delivery_date) > new Date(b.delivery_date)
        },
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
        render: (value, row) => (
            <span>
                {row.status === "Processing" ?
                    <span>
                        <UpdatePurchaseOrder po_id={value}
                                             load_purchase_orders={this.props.load_purchase_orders}/>
                        <Divider type='vertical'/>
                    </span> : ""}
                <PurchaseOrderView po_id={value}/>
        </span>)
    }];

    render() {
        const {purchase_order_list} = this.props;
        return (<div>
            <Table columns={this.columns} dataSource={purchase_order_list} pagination={{pageSize: 7}}/>

        </div>)
    }
}