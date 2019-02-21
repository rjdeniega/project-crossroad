import React, {Component} from 'react';
import {Card, Form, Input, Select, Tag, Divider, Button, message, Modal} from 'antd'
import update from 'react-addons-update'
import './style.css';
import {getData, postData} from "../../../../network_requests/general";
import Icon from 'react-icons-kit';
import {ic_cached} from 'react-icons-kit/md/ic_cached'

const Option = Select.Option;
const Search = Input.Search;

function generateCode() {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (let i = 0; i < 6; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

export class UpdatePurchaseOrder extends Component {
    constructor(props) {
        super(props);

        this.state = {
            update_modal: false,
            items: [],
            item_details: [],
        }
    }

    componentDidMount() {
        let po_id = this.props.po_id;
        getData('inventory/purchase_order/' + po_id).then(data => {
            this.setState({
                items: data.items,
            }, () => {
                let item_details = [];
                this.state.items.map(item => {
                    let item_detail = {
                        name: item.item,
                        generic_name: item.item,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        item_type: "Single Item",
                        item_code: generateCode(),
                    };
                    item_details.push(item_detail)

                });
                this.setState({
                    item_details: item_details,
                })
            })

        })
    }


    updateModal = () => {
        this.setState({
            update_modal: true,
        })
    };

    handleCancel2 = (e) => {
        console.log(e);
        this.setState({
            update_modal: false,
        });
    };

    disapprove = (id) => {
        let data = {
            'update': 'reject'
        };
        /** @namespace this.props.load_purchase_orders () **/
        postData('inventory/purchase_order/update/' + id, data).then(() => {
            message.success("Purchase order has been cancelled");
            this.props.load_purchase_orders()
        })
    };

    approve = (id) => {
        let final_items = [];
        this.state.item_details.forEach(function (item) {
            final_items.push({
                name: item.generic_name,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                item_type: item.item_type,
                measurement: item.measurement,
                unit: item.unit,
                brand: item.brand,
                item_code: item.item_code
            })
        });
        let data = {
            update: "accepted",
            items: final_items,
        };
         postData('inventory/purchase_order/update/' + id, data).then(data => {
             if (data.error){
                 console.log(data.error)
             }
             message.success("Purchase order has been confirmed");
             // this.props.load_purchase_orders()
        })
    };

    changeItemType = (index, new_item_type) => {
        this.setState({
            item_details: update(this.state.item_details, {
                [index]: {
                    item_type: {$set: new_item_type}
                }
            })
        }, () => {
            if (new_item_type === "Physical Measurement") {
                this.setState({
                    item_details: update(this.state.item_details, {
                        [index]: {
                            unit: {$set: "pieces"},
                        }
                    })
                }, () => {
                    console.log(this.state)
                })
            } else if (new_item_type === "Liquid Measurement") {
                this.setState({
                    item_details: update(this.state.item_details, {
                        [index]: {
                            unit: {$set: "mL"},
                        }
                    })
                }, () => {
                    console.log(this.state)
                })
            } else {
                this.setState({
                    item_details: update(this.state.item_details, {
                        [index]: {
                            unit: {$set: null},
                            measurement: {$set: null},
                        }
                    })
                }, () => {
                    console.log(this.state)
                })
            }
        })
    };

    changeMeasurement = (index, measurement) => {
        this.setState({
            item_details: update(this.state.item_details, {
                [index]: {
                    unit: {$set: measurement},
                }
            })
        }, () => {
            console.log(this.state)
        })
    };


    updateFields = (key, value, attribute) => {
        if (attribute === "item_code") {
            let code = generateCode();
            this.setState({
                item_details: update(this.state.item_details, {
                    [key]: {
                        item_code: {$set: code},
                    }
                })
            })
        } else if (attribute === "name") {
            this.setState({
                item_details: update(this.state.item_details, {
                    [key]: {
                        generic_name: {$set: value},
                    }
                })
            }, () => console.log(this.state))
        } else if (attribute === "description") {
            this.setState({
                item_details: update(this.state.item_details, {
                    [key]: {
                        description: {$set: value},
                    }
                })
            }, () => console.log(this.state))
        } else if (attribute === "brand") {
            this.setState({
                item_details: update(this.state.item_details, {
                    [key]: {
                        brand: {$set: value},
                    }
                })
            }, () => console.log(this.state))
        } else if (attribute === "measurement") {
            this.setState({
                item_details: update(this.state.item_details, {
                    [key]: {
                        measurement: {$set: value},
                    }
                })
            }, () => console.log(this.state))
        }
    };


    render() {
        const {item_details} = this.state;
        const {po_id} = this.props;
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

        return (
            <span>
                <a onClick={this.updateModal}>Update</a>
                <Modal
                    title="Update Status"
                    visible={this.state.update_modal}
                    onCancel={this.handleCancel2}
                    className="update-purchase-order-modal"
                    footer={[
                        <Button key={1} htmlType='button' type="danger"
                                onClick={() => this.disapprove(po_id)}>Disapproved</Button>,
                        <Button key={2} htmlType='button' type="primary"
                                onClick={() => this.approve(po_id)}>Confirm</Button>
                    ]}>
                    <div className="update-purchase-order-layout">
                        <h3>Add to Inventory</h3>
                        {item_details.map((item, index) => {
                            return (
                                <Card title={item.name}
                                      extra={(
                                          <span>
                                      <Tag color="blue">{item.quantity} pc</Tag>
                                      <Divider type="vertical"/>
                                      <Tag color="green">Php{item.unit_price}</Tag>
                                  </span>)} size="small"
                                      className="item-form-container">
                                    <Form.Item label="Type" {...formItemLayout}>
                                        <Select defaultValue="Single Item" style={{width: 210}}
                                                onSelect={e => this.changeItemType(index, e)}>
                                            <Option value="Single Item">Single Item</Option>
                                            <Option value="Physical Measurement">Physical Measurement</Option>
                                            <Option value="Liquid Measurement">Liquid Measurement</Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item label="Item Name" {...formItemLayout}>
                                        <Input value={item.generic_name}
                                               onChange={e => this.updateFields(index, e.target.value, "name")}/>
                                    </Form.Item>
                                    <Form.Item label="Description" {...formItemLayout}>
                                        <Input value={item.description}
                                               onChange={e => this.updateFields(index, e.target.value, "description")}/>
                                    </Form.Item>
                                    <Form.Item label="Brand" {...formItemLayout}>
                                        <Input value={item.brand}
                                               onChange={e => this.updateFields(index, e.target.value, "brand")}/>
                                    </Form.Item>
                                    {item.item_type === "Liquid Measurement" ?
                                        <Form.Item label="Measurement" {...formItemLayout}>
                                            <Input addonAfter={(
                                                <Select defaultValue="mL" style={{width: 75}}
                                                        onSelect={e => this.changeMeasurement(index, e)}>
                                                    <Option value="mL">mL</Option>
                                                    <Option value="L">L</Option>
                                                    <Option value="fl. oz">fl. oz</Option>
                                                </Select>
                                            )} onChange={e => this.updateFields(index, e.target.value, "measurement")}/>
                                        </Form.Item> : ''}
                                    {item.item_type === "Physical Measurement" ?
                                        <Form.Item label="Measurement" {...formItemLayout}>
                                            <Input addonAfter={(
                                                <Select defaultValue="pieces" style={{width: 95}}
                                                        onSelect={e => this.changeMeasurement(index, e)}>
                                                    <Option value="pieces">pieces</Option>
                                                    <Option value="meters">meters</Option>
                                                </Select>
                                            )} onChange={e => this.updateFields(index, e.target.value, "measurement")}/>
                                        </Form.Item>
                                        : ''}
                                    <Form.Item label="Item Code" {...formItemLayout}>
                                        <Search value={item.item_code} enterButton={<Icon icon={ic_cached}/>}
                                                onSearch={() => this.updateFields(index, null, "item_code")}/>
                                    </Form.Item>
                                </Card>
                            )
                        })}
                </div>
                </Modal>
            </span>
        )
    }
}