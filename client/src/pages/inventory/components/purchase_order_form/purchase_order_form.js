import React, {Component} from 'react';
import {Table, Row, Col, Input, AutoComplete, Divider} from 'antd';
import './style.css'

const dataSource = ['Budjolex', 'Ace Hardware', 'Concorde'];

const autoFillData = [{
    name: 'Budjolex',
    address: '12 Karilagan St., Kawilihan Village',
    contact: '09178712380',
}, {
    name: 'Ace Hardware',
    address: '1st Floor Megamall',
    contact: '671-2973',
}, {
    name: 'Concorde',
    address: '3rd floor Greenhills',
    contact: '705-1436'
}];

function createRows() {
    let rows = [];
    for (let i = 1; i <= 8; i++) {
        rows.push({
            key: i,
            details: <Input/>,
            quantity: <Input/>,
            unit_price: <Input/>
        })
    }
    rows.push({
        key: 9,
        unit_price: "Total: ",
    });
    return rows;
}

const data = [{
    key: '1',
    details: <Input/>,
    quantity: <Input/>,
    unit_price: <Input/>,
}];

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

export class PurchaseOrderForm extends Component {
    state = {
        vendorName: '',
        vendorAddress: '',
        vendorContact: '',
        items: [],
    };

    getVendorInfo = (vendor) => {
        autoFillData.map(instance => {
            if (instance.name === vendor) {
                this.setState({
                    vendorAddress: instance.address,
                    vendorContact: instance.contact,
                })
            }
        })
    };

    render() {
        const {vendorName, vendorAddress, vendorContact} = this.state;

        return (
            <div className="purchase-order-form">
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
                        <p align="right" className="form-info">PO #: <Input className='purchase_order_number'
                                                                            size='small'/></p>
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
                    <Col span={24}>
                        <p align="left" className="form-info-vendor">Vendor Name: &nbsp;
                            <AutoComplete
                                size='small'
                                className='vendor-name-input'
                                onSelect={this.getVendorInfo}
                                dataSource={dataSource}
                                filterOption={(inputValue, option) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}/>
                        </p>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <p align="left" className="form-info-vendor">Vendor Address: &nbsp;
                            <Input
                                size='small'
                                className='vendor-address-input'
                                value={vendorAddress}/>
                        </p>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <p align="left" className="form-info-vendor"> Vendor Contact: &nbsp;
                            <Input
                                size='small'
                                className='vendor-contact-input'
                                value={vendorContact}/>
                        </p>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Table pagination={false} columns={columns} bordered size="small" dataSource={createRows()}/>
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col span={24}>
                        <p>Special Instructions: <Input.TextArea autosize={{minRows: 2, maxRows: 2}} size="small"/></p>
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col span={6}>
                        <Divider/>
                    </Col>
                </Row>
                <Row>
                    <Col span={6}>
                        <h3>Authorized by: <Divider/></h3>
                    </Col>
                </Row>
            </div>
        )
    }
}