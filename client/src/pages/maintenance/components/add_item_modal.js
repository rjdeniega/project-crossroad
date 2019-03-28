import React, {Component} from 'react'
import {postData, getData} from "../../../network_requests/general"
import {Form, Menu, Select, InputNumber, Button, Checkbox, message, Popover} from 'antd'
import Input from "antd/es/input";

const FormItem = Form.Item;
const Option = Select.Option;

class RequestItems extends Component {
    constructor(props) {
        super(props);
        this.state = {
            category: null,
            description: null,
        };

        this.submitRequest = this.submitRequest.bind(this)
    }

    submitRequest(){
        let data = {
            category: this.state.category,
            description: this.state.description
        };
        postData('inventory/request_item/', data).then(data => {
            console.log(data);
            message.success("Request Submitted!");
        })
    }

    render() {
        const {categories} = this.props;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 8},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 14},
            },
        };

        const buttonLayout = {
            wrapperCol: {
                sm: {
                    span: 14,
                    offset: 8
                }
            }
        };
        return (
            <div>
                <Form.Item label="Category" {...formItemLayout}>
                    <Select style={{width: "100%"}} onSelect={e => this.setState({category: e}, () => console.log(this.state))}>
                        {categories.map(function (category) {
                            return <Select.Option value={category.id}>{category.category}
                            </Select.Option>
                        })}
                    </Select>
                </Form.Item>
                <Form.Item label="Description" {...formItemLayout}>
                    <Input type="text" onChange={e => this.setState({description: e.target.value})}/>
                </Form.Item>
                <Form.Item {...buttonLayout}>
                    <Button htmlType="button" onClick={this.submitRequest}>Submit Request</Button>
                </Form.Item>
            </div>
        )
    }
}

export class AddItems extends Component {
    constructor(props) {
        super(props);
        this.state = {
            categories: [],
            items: [],
            active_category: null,
            active_item: null,
            quantity: null,
            request_item: false,
            measurement: null,
        };
        this.addItem = this.addItem.bind(this)
    }

    componentDidMount() {
        this.getItems()
    }

    addItem() {
        const {active_category, active_item, quantity, measurement} = this.state;
        let data = {
            category: active_category,
            item: active_item,
            quantity: quantity,
            measurement: measurement,
        };
        postData('inventory/mechanic/items/add/' + this.props.repair, data).then(data => {
            console.log(data);
            this.props.close();
        })
    }

    onSelect(value) {
        this.setState({
            active_category: value,
        }, () => {
            console.log(this.state.active_category)
        })
    }

    onSelect2(value) {
        this.setState({
            active_item: value
        })
    }

    updateField(value, field) {
        this.setState({
            [field]: value
        })
    }

    getItems() {
        getData('inventory/items/item_category').then(data => {
            let categories = [];
            data.item_category.forEach(function (category) {
                categories[category.id] = category
            });
            this.setState({
                categories: categories
            })
        });
        getData('inventory/items/').then(data => {
            let items = [];
            data.items.forEach(function (item) {
                if(item.quantity > 0){
                    items[item.id] = item;
                }
            });
            this.setState({
                items: items,
            }, () => console.log(this.state))
        })
    };

    handleVisibleChange = (request_item) => {
        this.setState({request_item});
    };

    render() {
        const {categories, items, active_category, active_item} = this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 6},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 12},
            },
        };
        const buttonLayout = {
            wrapperCol: {
                sm: {
                    span: 18,
                    offset: 6
                }
            }
        };
        return (
            <div>
                <Form.Item label="Category" {...formItemLayout}>
                    <Select style={{width: "100%"}} onSelect={e => this.onSelect(e)}>
                        {categories.map(function (category) {
                            return <Select.Option value={category.id}>{category.category} -
                                Quantity: {category.quantity}</Select.Option>
                        })}
                    </Select>
                </Form.Item>
                {active_category && (
                    <Form.Item label="Item" {...formItemLayout}>
                        <Select style={{width: "100%"}} onSelect={e => this.onSelect2(e)}>
                            {items.map(function (item) {
                                if (item.category === active_category) {
                                    return <Select.Option
                                        value={item.id}>{item.item_code} - {item.quantity}
                                        {item.unit === "pieces" ? item.quantity > 1 ? " boxes" : " box" :
                                            item.unit === "mL" ? item.quantity > 1 ? " bottles" : " bottle" :
                                                " available"}</Select.Option>
                                }
                            })}
                        </Select>
                    </Form.Item>
                )}
                {active_item && items[active_item].item_type === "Single Item" &&
                <Form.Item label="Quantity" {...formItemLayout}>
                    <Input type="number" onChange={e => this.updateField(e.target.value, 'quantity')}
                           addonAfter={items[active_item].quantity + " available"}/>
                </Form.Item>
                }
                {active_item && items[active_item].measurement &&
                <Form.Item label="Amount used up" {...formItemLayout}>
                    <Input type='number' onChange={e => this.updateField(e.target.value, 'measurement')}
                           addonAfter={items[active_item].current_measurement + items[active_item].unit + " available"}/>
                </Form.Item>}
                <Form.Item {...buttonLayout}>
                    <Button htmlType='button' type='primary' onClick={this.addItem}>Add Item</Button>
                    <Popover
                        trigger="click"
                        title="Request Item from clerk"
                        onVisibleChange={this.handleVisibleChange}
                        visible={this.state.request_item}
                        content={
                            <RequestItems categories={categories}/>
                        }>
                        <Button htmlType='button' style={{marginLeft: 5}}>Request Item from clerk</Button>
                    </Popover>
                </Form.Item>
            </div>
        )
    }
}
