import React, {Component} from 'react';
import {
    Table,
    Row,
    Col,
    Input,
    AutoComplete,
    Divider,
    message,
    Select,
    Icon,
    Popover,
    Button,
    Form,
    Checkbox,
    Cascader,
    Tooltip,
    DatePicker,
} from 'antd';
import update from 'react-addons-update';
import './style.css';
import NumberFormat from 'react-number-format';
import {getData, postData} from "../../../../network_requests/general";
import moment from 'moment'

function disabledDate(current) {
    // Can not select days before today and today
    return current && current <= moment().endOf('day');
}

function pad(num) {
    let digits = 6 - num.toString().length;
    let output = '';
    for (let i = 0; i < digits; i++) {
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
            category: null,
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

const columns = [{
    title: "Item",
    dataIndex: 'details',
    key: 'details',
    width: '5in',
    align: 'left',
}, {
    title: "Quantity",
    dataIndex: 'quantity',
    key: 'quantity',
    align: 'center',
    width: '0.5in',
}, {
    title: "Unit Price",
    dataIndex: 'unit_price',
    key: 'unit_price',
    align: 'right',
    width: '1in',
}, {
    title: "Total",
    dataIndex: 'total',
    key: 'total',
    align: 'right',
    width: '1.5in',
}];

class ItemForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            quantity: null,
            description: null,
            unit_price: null,
            category: null,
            categories: [],
            item_type: "Single Item",
            measurement: null,
            unit: null,
            brand: null,
        };

        this.selectOptions = this.selectOptions.bind(this);
        this.submitItem = this.submitItem.bind(this);
    }

    componentDidMount() {
        getData('inventory/items/item_category/').then(data => {
            this.setState({
                categories: data.item_category,
            })
        });
    }

    updateField = (value, field) => {
        this.setState({
            [field]: value
        });
        if (field === 'item_type' && value === "Physical Measurement") {
            this.setState({
                unit: 'pieces',
            })
        } else if (field === 'item_type' && value === "Liquid Measurement") {
            this.setState({
                unit: "mL",
            })
        } else if (field === 'item_type' && value === "Single Item") {
            this.setState({
                measurement: null,
                unit: null
            })
        }
    };

    submitItem() {
        const {quantity, description, unit_price, category, item_type, measurement, brand, unit} = this.state;
        if (!quantity || !description || !unit_price || !category || !item_type || !brand ||
            ((item_type === 'Physical Measurement' || item_type === 'Liquid Measurement') && !measurement)) {
            message.error("Please complete fields!");
        } else {
            let item = {
                quantity: quantity,
                description: description,
                unit_price: unit_price,
                category: category,
                item_type: item_type,
                measurement: measurement,
                brand: brand,
                unit: unit,
            };
            this.props.add_item(item);
        }
    }

    selectOptions() {
        const {categories} = this.state;
        let select_options = [];
        let low_inventory = [];
        let normal_stock = [];
        categories.forEach(function (category) {
            if (category.quantity < category.minimum_quantity) {
                low_inventory.push(<Select.Option value={category.category}>
                    <Tooltip
                        title={(category.minimum_quantity - category.quantity + 1) + " is recommended to stay above minimum quantity"}>
                        <span>{category.category}</span>
                    </Tooltip>
                </Select.Option>)
            } else {
                normal_stock.push(<Select.Option value={category.category}>{category.category}</Select.Option>)
            }
        });
        if (low_inventory) {
            select_options.push(<Select.OptGroup label={<span>
                      <p><Icon type="warning"
                               theme="twoTone"
                               twoToneColor="#FFCC00"/>&nbsp;Low Inventory</p>
            </span>}>
                {low_inventory}
            </Select.OptGroup>);
            if (normal_stock) {
                select_options.push(<Select.OptGroup label={"Above Maintaining"}>
                    {normal_stock}
                </Select.OptGroup>)
            }
        } else {
            select_options.push(normal_stock)
        }

        return select_options;
    }

    render() {
        const {quantity, description, unit_price, category, item_type, measurement, unit, brand} = this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 8},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 16},
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 16,
                    offset: 8,
                },
            },
        };

        return (
            <div style={{width: "25vw"}}>
                <Form.Item label="Category" {...formItemLayout}>
                    <Select placeholder="Select category" style={{width: '100%'}}
                            onSelect={e => this.updateField(e, 'category')}>
                        {this.selectOptions()}
                    </Select>
                </Form.Item>
                <Form.Item label="Brand" {...formItemLayout}>
                    <Input value={brand} onChange={e => this.updateField(e.target.value, 'brand')}/>
                </Form.Item>
                <Form.Item label="Description" {...formItemLayout}>
                    <Input value={description} onChange={e => this.updateField(e.target.value, 'description')}/>
                </Form.Item>
                <Form.Item label="Quantity" {...formItemLayout}>
                    <Input value={quantity} type='number' min={0}
                           onChange={e => this.updateField(e.target.value, 'quantity')}/>
                </Form.Item>
                <Form.Item label="Unit Price" {...formItemLayout}>
                    <Input value={unit_price} type='number' min={0}
                           onChange={e => this.updateField(e.target.value, 'unit_price')}/>
                </Form.Item>
                <Form.Item label="Type" {...formItemLayout}>
                    <Select defaultValue="Single Item" style={{width: "100%"}}
                            onSelect={e => this.updateField(e, 'item_type')}>
                        <Select.Option value="Single Item">Single Item</Select.Option>
                        <Select.Option value="Physical Measurement">Physical Measurement</Select.Option>
                        <Select.Option value="Liquid Measurement">Liquid Measurement</Select.Option>
                    </Select>
                </Form.Item>
                {item_type === "Physical Measurement" &&
                <Form.Item label="Measurement" {...formItemLayout}>
                    <Input addonAfter={(
                        <Select defaultValue="pieces" style={{width: 95}} onSelect={e => this.updateField(e, 'unit')}>
                            <Select.Option value="pieces">pieces</Select.Option>
                            <Select.Option value="meters">meters</Select.Option>
                        </Select>
                    )} value={measurement} onChange={e => this.updateField(e.target.value, 'measurement')}/>
                </Form.Item>}
                {item_type === "Liquid Measurement" &&
                <Form.Item label="Measurement" {...formItemLayout}>
                    <Input addonAfter={(
                        <Select defaultValue="mL" style={{width: 75}}
                                onSelect={e => this.updateField(e, 'unit')}>
                            <Select.Option value="mL">mL</Select.Option>
                            <Select.Option value="L">L</Select.Option>
                            <Select.Option value="fl. oz">fl. oz</Select.Option>
                        </Select>
                    )} value={measurement} onChange={e => this.updateField(e.target.value, 'measurement')}/>
                </Form.Item>}
                <Form.Item {...tailFormItemLayout}>
                    <Button type="primary" htmlType="button" onClick={this.submitItem}>Add</Button>
                </Form.Item>
            </div>)
    }
}

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
            categories: [],
            visible_form: false,
            items_submit: [],
            options: [],
            new_vendor: true,
            expected_delivery: null,
        };

        this.updateFields = this.updateFields.bind(this);
        this.updateDetails = this.updateDetails.bind(this);
        this.updatedCreateRows = this.updatedCreateRows.bind(this);
        this.addItem = this.addItem.bind(this);
        this.newVendor = this.newVendor.bind(this);
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
            let options = [];
            Object.keys(data.vendor_list).map(vendor => {
                let items = [];
                data.vendor_list[vendor].forEach(category => {
                    items.push({
                        disabled: true,
                        code: category,
                        name: category,
                    })
                });
                options.push({
                    code: vendor,
                    name: vendor,
                    items: items,
                });
            });
            console.log(options);
            this.setState({
                options: options,
                autofill_data: autofill_data,
                data_source: data_source
            })
        })
    }

    getVendorInfo = (vendor) => {
        const {autofill_data} = this.state;
        autofill_data.map(instance => {
            if (instance.name === vendor) {
                this.setState({
                    vendorAddress: instance.address,
                    vendorContact: instance.contact_number,
                })
            }
        })
    };

    createRows(items, grand_total, updateItems, categories) {
        let rows = [];
        let select_options = [];
        let low_inventory = [];
        let normal_stock = [];
        categories.forEach(function (category) {
            if (category.quantity < 4) {
                low_inventory.push(<Select.Option value={category.category}>{category.category}</Select.Option>)
            } else {
                normal_stock.push(<Select.Option value={category.category}>{category.category}</Select.Option>)
            }
        });
        if (low_inventory) {
            select_options.push(<Select.OptGroup label={<span>
                      <p><Icon type="warning"
                               theme="twoTone"
                               twoToneColor="#FFCC00"/>&nbsp;Low Inventory</p>
            </span>}>
                {low_inventory}
            </Select.OptGroup>);
            if (normal_stock) {
                select_options.push(<Select.OptGroup label={"Above Maintaining"}>
                    {normal_stock}
                </Select.OptGroup>)
            }
        } else {
            select_options.push(normal_stock)
        }
        for (let i = 1; i <= 8; i++) {
            rows.push({
                key: i + '',
                details: <span>
                <Col span={12}>
                    <Select style={{width: 190}} onSelect={e => updateItems(i, e, 'category')} placeholder={"Category"}>
                        {select_options}
                    </Select>
                </Col>
                <Col span={12}>
                    <Input className={"item" + i} value={items[i].detail} placeholder={"Item Details"}
                           onChange={e => updateItems(i, e.target.value, "detail")}/>
                </Col>
            </span>,
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

    saveForm() {
        const {items, vendorName, vendorAddress, vendorContact, po_num, special_instructions, expected_delivery} = this.state;

        if (vendorName && vendorAddress && vendorContact && po_num && items[1].brand) {
            let final_items = [];
            items.forEach(function (item) {
                if (item.brand) {
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
                "expected_delivery": expected_delivery
            };
            console.log(data);
            postData('inventory/purchase_order/', data).then(data => {
                console.log(data);
                message.success("Purchase order successfully added!");
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

    handleVisibleChange = (visible_form) => {
        this.setState({visible_form});
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
        } else if (attribute === "category") {
            this.setState({
                items: update(this.state.items, {
                    [key]: {
                        category: {$set: desc}
                    }
                })
            }, () => {
                console.log(this.state.items)
            })
        }
    };

    addItem = (item) => {
        console.log(item);
        const {items} = this.state;
        let id = 0;
        items.every(function (ite, key) {
            if (!ite.brand) {
                id = key;
                return false;
            } else {
                return true;
            }
        });
        this.setState({
            items: update(items, {
                [id]: {
                    $set: {
                        key: id,
                        brand: item.brand,
                        description: item.description,
                        category: item.category,
                        quantity: item.quantity,
                        item_type: item.item_type,
                        measurement: item.measurement,
                        unit: item.unit,
                        unit_price: item.unit_price,
                        total: item.quantity * item.unit_price,
                    }
                }
            })
        }, () => {
            console.log(this.state.items);
            this.setState({
                visible_form: false,
            })
        });
    };

    filter(inputValue, path) {
        return (path.some(option => (option.label).toLowerCase().indexOf(inputValue.toLowerCase()) > -1));
    }

    updatedCreateRows(items) {
        let rows = [];
        let self = this;
        items.every(function (item, key) {
            if (!item.brand) {
                rows.push({
                    key: key,
                    details:
                        <span>
                            <Popover
                                placement='bottom'
                                content={<ItemForm add_item={self.addItem}/>}
                                trigger="click"
                                visible={self.state.visible_form}
                                onVisibleChange={self.handleVisibleChange}
                            >
                                <Button type="primary" htmlType='button'>Add Item</Button>
                            </Popover>
                        </span>,
                });
                return false;
            } else {
                let measurement = "";
                if (item.measurement) {
                    measurement = item.measurement + item.unit;
                }
                rows.push({
                    key: key,
                    details: item.brand + " " + measurement + " - " + item.description,
                    quantity: item.quantity,
                    unit_price: <NumberFormat value={item.unit_price} displayType={'text'} thousandSeparator={true}
                                              prefix={'Php'}
                                              decimalScale={2} fixedDecimalScale={true}/>,
                    total: <NumberFormat value={item.total} displayType={'text'} thousandSeparator={true} prefix={'Php'}
                                         decimalScale={2} fixedDecimalScale={true}/>
                });
                return true;
            }
        });
        if (items[1].brand) {
            let total = 0;
            items.forEach(function (item) {
                total = total + item.total;
            });
            rows.push({
                key: 9,
                unit_price: "Total:",
                total: <NumberFormat value={total} displayType={'text'} thousandSeparator={true} prefix={'Php'}
                                     decimalScale={2} fixedDecimalScale={true}/>,
            })
        }
        return rows;
    }

    newVendor(e) {
        console.log(this.state);
        this.setState({
            new_vendor: e.target.checked,
            vendorName: '',
            vendorAddress: '',
            vendorContact: '',
        })
    }

    render() {
        const {new_vendor, po_num, vendorName, vendorAddress, vendorContact, items, grand_total, data_source, categories, options} = this.state;
        const {filter} = this.filter;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 16},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 8},
            },
        };

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
                    <Col span={8}>
                        <p className="form-info">Phone: +63(49) 530-1166</p>
                    </Col>
                    <Col span={16}>
                        <Form.Item label="Expected Delivery" {...formItemLayout}>
                            <DatePicker onChange={(date, dateString) => this.setState({expected_delivery: dateString})}
                                        disabledDate={disabledDate}/>
                        </Form.Item>
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
                        <Checkbox checked={new_vendor} onChange={this.newVendor}>New Vendor</Checkbox>
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col span={4}>
                        <p align="left" className="form-info-vendor">Vendor Name: &nbsp;</p>
                    </Col>
                    <Col>
                        {new_vendor ? (<Input size='small'
                                              className='vendor-name-input'
                                              value={vendorName}
                                              onChange={e => this.updateDetails('vendor_name', e.target.value)}/>)
                            :
                            (<Cascader className='vendor-name-input'
                                       size='small'
                                       expandTrigger="hover"
                                       fieldNames={{label: 'name', value: 'code', children: 'items'}}
                                       options={options} showSearch={{filter}}
                                       changeOnSelect
                                       onChange={e => {
                                           this.getVendorInfo(e[0]);
                                           this.updateDetails('vendor_name', e[0])
                                       }}/>)}

                        {/*<AutoComplete*/}
                        {/*size='small'*/}
                        {/*className='vendor-name-input'*/}
                        {/*onSelect={this.getVendorInfo}*/}
                        {/*value={vendorName}*/}
                        {/*dataSource={data_source}*/}
                        {/*onChange={e => this.updateDetails('vendor_name', e)}*/}
                        {/*filterOption={(inputValue, option) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}/>*/}
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
                               dataSource={this.updatedCreateRows(items)}/>
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