import React, {Component} from 'react';
import './style.css'
import {getData} from "../../../../network_requests/general";
import {Table, Row, Col, Divider, message} from 'antd'
import NumberFormat from 'react-number-format';

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
    align: "left"
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

function createRows(items){
    let rows = [];
    let grand_total = 0;
    for(let i = 0; i <= 7; i++){
        let total = 0;
        if(items[i]){
            total = parseInt(items[i].quantity) * parseInt(items[i].unit_price)
        }
        rows.push({
            key: i,
            details: items[i] ? items[i].item : <p> </p>,
            quantity: items[i] ? items[i].quantity : ' ',
            unit_price: items[i] ? <NumberFormat value={items[i].unit_price} displayType={'text'} thousandSeparator={true} prefix={'Php'}
                                 decimalScale={2} fixedDecimalScale={true}/>: ' ',
            total: total ? <NumberFormat value={total} displayType={'text'} thousandSeparator={true} prefix={'Php'}
                                 decimalScale={2} fixedDecimalScale={true}/>: ' ',
        });
        grand_total = total + grand_total;
    }
    rows.push({
        key: 9,
        unit_price: "Total: ",
        total: <NumberFormat value={grand_total} displayType={'text'} thousandSeparator={true} prefix={'Php'}
                                 decimalScale={2} fixedDecimalScale={true}/>
    });

    return rows;
}

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
            date: '',
        }
    }

    componentDidMount() {
        let po_id = this.props.po_id;
        getData('inventory/purchase_order/' + po_id).then(data => {
            /** @namespace data.purchase_order **/
            /** @namespace data.vendor.contact_number **/
            this.setState({
                po_number: data.purchase_order.po_number,
                vendor_name: data.vendor.name,
                vendor_address: data.vendor.address,
                vendor_contact: data.vendor.contact_number,
                special_instructions: data.purchase_order.special_instruction,
                items: data.items,
                order_date: data.purchase_order.order_date
            })
        })
    }

    render() {
        const {po_number, vendor_name, vendor_address, vendor_contact, special_instructions, order_date, items} = this.state;
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
                        <p align="right" className="form-info">Date: {new Date(order_date).toLocaleDateString()}</p>
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
                <Row>
                    <Col span={12}>
                        <p align="left">Vendor Name: {vendor_name} </p>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <p align="left">Vendor Address: {vendor_address} </p>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <p align="left">Vendor Contact: {vendor_contact} </p>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Table pagination={false} columns={columns} bordered size="small"
                                dataSource={createRows(items)}/>
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col span={24}>
                        <p>Special Instructions: </p>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <p>{special_instructions}</p>
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col span={8}>
                        <h3>Authorized by: <Divider/></h3>
                    </Col>
                </Row>
            </div>
        )
    }
}