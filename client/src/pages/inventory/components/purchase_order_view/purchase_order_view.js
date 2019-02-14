import React, {Component} from 'react';
import './style.css'
import {getData} from "../../../../network_requests/general";
import {Table, Row, Col, Divider, message} from 'antd'

function pad(num) {
    let digits = 6 - num.toString().length;
    let output = '';
    for(let i = 0; i < digits; i++){
        output += '0';
    }
    output = output + num;
    return output;
}

const columns = [{
    title: "Item",
    dataIndex: 'details',
    key: 'details',
    width: '3.5in',
}, {
    title: "Quantity",
    dataIndex: 'quantity',
    key: 'quantity',
    align: 'center',
}, {
    title: "Unit Price",
    dataIndex: 'unit_price',
    key: 'unit_price',
    align: 'right',
}, {
    title: "Total",
    dataIndex: 'total',
    key: 'total',
    align: 'right',
    width: '1.5in',
}];

export class PurchaseOrderView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            po_number: '',
            vendor_name: '',
            vendor_address: '',
            vendor_contact: '',
            special_instructions: '',
            items: [],
            grand_total: '',
        }
    }

    componentDidMount() {
        let po_id = this.props.po_id;
        getData('inventory/purchase_order/' + po_id).then(data => {
            this.setState({
                po_number: data.purchase_order.po_number,
                vendor_name: data.vendor.name,
                vendor_address: data.vendor.address,
                vendor_contact: data.vendor.contact_number,
                special_instructions: data.purchase_order.special_instruction,
                items: data.items,
            })
        })
    }

    render() {
        const {po_number, vendor_name, vendor_address, vendor_contact, special_instructions} = this.state;
        return (
            <div className="purchase-order-view">
                <Row type="flex" justify="space-between" align="bottom">
                    <Col span={12}>
                        <h2>Laguna Bel-Air Transport Service Cooperative</h2>
                    </Col>
                    <Col span={12}>
                        <h2 align="right">Purchase Order</h2>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <p className="form-info">Sta. Ana Street, Laguna Bel-Air Subdivision 2, Ph 5</p>
                    </Col>
                    <Col span={12}>
                        <p align="right" className="form-info">Date: {new Date(Date.now()).toLocaleDateString()}</p>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <p className="form-info">Sta. Rosa City, Laguna, ZIP: 4026</p>
                    </Col>
                    <Col span={12}>
                        <p align="right" className="form-info">PO #: {pad(po_number)}</p>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <p className="form-info">Phone: +63(49) 530-1166</p>
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col span={12}>
                        <h3>Vendor</h3>
                    </Col>
                </Row>
            </div>
        )
    }
}