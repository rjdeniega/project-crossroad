import React, {Component} from 'react';
import {Table, Row, Col, Input, AutoComplete, Divider} from 'antd';
import update from 'react-addons-update';
import './style.css';
import NumberFormat from 'react-number-format';

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

function createState() {
    let state = [];
    for (let i = 1; i <= 8; i++) {
        state[i] = {
            key: i,
            detail: null,
            quantity: null,
            unit_price: null,
            total: null,
        }
    }
    return state;
}

function getGrandTotal(rows) {
    let total = 0;
    for (let i = 1; i <= 8; i++) {
        total = total + rows[i].total;
    }
    return total;
}

function createRows(items, grand_total, updateItems) {
    let rows = [];
    for (let i = 1; i <= 8; i++) {
        rows.push({
            key: i,
            details: <Input className={"item" + i} value={items[i].detail}
                            onChange={e => updateItems(i, e.target.value, "detail")}/>,
            quantity: <Input className={"quantity" + i} value={items[i].quantity} type="number" min={0}
                             onChange={e => updateItems(i, e.target.value, "quantity")}/>,
            unit_price: <Input className={"unit_price" + i} value={items[i].unit_price} type="number" min={0}
                               onChange={e => updateItems(i, e.target.value, "unit_price")}/>,
            total: <NumberFormat value={items[i].total} displayType={'text'} thousandSeparator={true} prefix={'Php'}
                                 decimalScale={2} fixedDecimalScale={true}/>,
        })
    }
    rows.push({
        key: 9,
        unit_price: "Total: ",
        total: <NumberFormat value={grand_total} displayType={'text'} thousandSeparator={true} prefix={'Php'}
                             decimalScale={2} fixedDecimalScale={true}/>,
    });
    return rows;
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

export class PurchaseOrderForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            vendorName: '',
            vendorAddress: '',
            vendorContact: '',
            items: createState(),
            grand_total: '',
        };

        this.updateFields = this.updateFields.bind(this)
    }

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

    updateFields = (key, desc, attribute) => {
        if (attribute === "detail") {
            this.setState({
                items: update(this.state.items, {
                    [key]: {
                        detail: {$set: desc}
                    }
                })
            });
        } else if (attribute === "quantity") {
            this.setState({
                items: update(this.state.items, {
                    [key]: {
                        quantity: {$set: desc}
                    }
                })
            }, () => {
                const {unit_price, quantity} = this.state.items[key];
                if (unit_price !== null) {
                    let new_total = unit_price * quantity;
                    this.setState({
                        items: update(this.state.items, {
                            [key]: {
                                total: {$set: new_total}
                            }
                        })
                    }, () => {
                        let grand_total = getGrandTotal(this.state.items);
                        this.setState({
                            grand_total: grand_total,
                        })
                    });
                }
            });
        } else if (attribute === "unit_price") {
            this.setState({
                items: update(this.state.items, {
                    [key]: {
                        unit_price: {$set: desc}
                    }
                })
            }, () => {
                const {unit_price, quantity} = this.state.items[key];
                if (quantity !== null) {
                    let new_total = unit_price * quantity;
                    this.setState({
                        items: update(this.state.items, {
                            [key]: {
                                total: {$set: new_total}
                            }
                        })
                    }, () => {
                        let grand_total = getGrandTotal(this.state.items);
                        this.setState({
                            grand_total: grand_total,
                        })
                    });
                }
            });
        }

    };

    render() {
        console.log(this.state.items);
        const {vendorName, vendorAddress, vendorContact, items, grand_total} = this.state;
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
                    <Col span={10}>
                        <p align="right" className="form-info">PO #: &nbsp;</p>
                    </Col>
                    <Col span={2}>
                        <Input align="right" className='purchase_order_number' size='small'/>
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
                    <Col span={4}>
                        <p align="left" className="form-info-vendor">Vendor Name: &nbsp;</p>
                    </Col>
                    <Col>
                        <AutoComplete
                            size='small'
                            className='vendor-name-input'
                            onSelect={this.getVendorInfo}
                            dataSource={dataSource}
                            filterOption={(inputValue, option) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>
                        <p align="left" className="form-info-vendor">Vendor Address:</p>
                    </Col>
                    <Col span={20}>
                        <Input
                            size='small'
                            className='vendor-address-input'
                            value={vendorAddress}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>
                        <p align="left" className="form-info-vendor"> Vendor Contact:</p>
                    </Col>
                    <Col>
                        <Input
                            size='small'
                            className='vendor-contact-input'
                            value={vendorContact}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Table pagination={false} columns={columns} bordered size="small"
                               dataSource={createRows(items, grand_total, this.updateFields)}/>
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col span={24}>
                        <p>Special Instructions:</p>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Input.TextArea autosize={{minRows: 2, maxRows: 2}} size="small"/>
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