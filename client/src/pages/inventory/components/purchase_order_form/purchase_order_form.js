import React, {Component} from 'react';
import {Table, Row, Col, Input, AutoComplete, Divider, message} from 'antd';
import update from 'react-addons-update';
import './style.css';
import NumberFormat from 'react-number-format';
import {getData, postData} from "../../../../network_requests/general";


function pad(num) {
    let digits = 6 - num.toString().length;
    let output = '';
    for(let i = 0; i < digits; i++){
        output += '0';
    }
    output = output + num;
    return output;
}

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
            key: i + '',
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
        key: '9',
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
            po_num: '',
            vendorName: '',
            vendorAddress: '',
            vendorContact: '',
            special_instructions: '',
            items: createState(),
            grand_total: '',
            autofill_data: [],
            data_source: [],
        };

        this.updateFields = this.updateFields.bind(this);
        this.updateDetails = this.updateDetails.bind(this);
    }

    componentDidMount() {
        getData('inventory/purchase_order/').then(data => {
            this.setState({
                po_num: data.purchase_orders.length + 1,
            })
        });
        getData('inventory/vendors/').then(data => {
            /** @namespace data.vendors **/
            let autofill_data = [], data_source = [];
            data.vendors.forEach(vendor => {
                autofill_data.push({
                    name: vendor.name,
                    address: vendor.address,
                    contact_number: vendor.contact_number,
                });
                data_source.push(vendor.name);
            });
            this.setState({
                autofill_data: autofill_data,
                data_source: data_source
            })
        })
    }

    getVendorInfo = (vendor) => {
        const { autofill_data} = this.state;
        autofill_data.map(instance => {
            if (instance.name === vendor) {
                this.setState({
                    vendorAddress: instance.address,
                    vendorContact: instance.contact_number,
                })
            }
        })
    };


    saveForm() {
        const {items, vendorName, vendorAddress, vendorContact, po_num, special_instructions} = this.state;
        let empty_field = false;
        let no_items = 0;
        for (let i = 1; i <= 8; i++) {
            let missing_detail = !items[i].detail;
            let missing_quantity = !items[i].quantity;
            let missing_price = !items[i].unit_price;
            if (!missing_detail && !missing_quantity && !missing_price) {
                no_items++;
            } else if (!(missing_detail && missing_price && missing_quantity)) {
                empty_field = true;
            }
        }

        if (empty_field === false && no_items > 0 && vendorName && vendorAddress && vendorContact && po_num) {
            let final_items = [];
            items.forEach(function (item){
                if(item.detail){
                    final_items.push(item)
                }
            });
            let data = {
                "po_num": po_num,
                "vendor_name": vendorName,
                "vendor_address": vendorAddress,
                "vendor_contact": vendorContact,
                "special_instruction": special_instructions,
                "items": final_items,
            };
            console.log(data);
            postData('inventory/purchase_order/', data).then(data => {
                console.log(data);
                message.success(no_items.toString() + " " + empty_field.toString());
                this.props.load_purchase_order();
                this.props.close();
            });

        } else {
            message.error("Please complete form")
        }
    }

    updateDetails = (attribute, value) => {
        switch (attribute) {
            case 'vendor_name':
                this.setState({
                    vendorName: value,
                });
                break;
            case 'vendor_address':
                this.setState({
                    vendorAddress: value,
                });
                break;
            case 'vendor_contact':
                this.setState({
                    vendorContact: value,
                });
                break;
            case 'special_instructions':
                this.setState({
                    special_instructions: value,
                })
        }
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
        const {po_num, vendorName, vendorAddress, vendorContact, items, grand_total, data_source} = this.state;
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
                        <p align="right" className="form-info">PO #: {pad(po_num)}</p>
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
                            value={vendorName}
                            dataSource={data_source}
                            onChange={e => this.updateDetails('vendor_name', e)}
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
                            value={vendorAddress}
                            onChange={e => this.updateDetails('vendor_address', e.target.value)}/>
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
                            value={vendorContact}
                            onChange={e => this.updateDetails('vendor_contact', e.target.value)}/>
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
                        <Input.TextArea autosize={{minRows: 2, maxRows: 2}} size="small"
                                        onChange={e => this.updateDetails('special_instructions', e.target.value)}/>
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