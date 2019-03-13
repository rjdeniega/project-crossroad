import React, {Component} from 'react'
import {postData, getData} from "../../../network_requests/general"
import {Form, Menu, Select, InputNumber, Button, Checkbox, message} from 'antd'
import Input from "antd/es/input";

const FormItem = Form.Item;
const Option = Select.Option;

export class AddItems extends Component {
    constructor(props) {
        super(props);
        this.state = {
            categories: [],
            items: [],
            active_category: null,
            active_item: null,
            quantity: null,
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
            this.props.loadItems();
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
            data.item_category.forEach(function(category){
                categories[category.id] = category
            });
            this.setState({
                categories: categories
            })
        });
        getData('inventory/items/').then(data => {
            let items = [];
            data.items.forEach(function(item){
                items[item.id] = item;
            });
            this.setState({
                items: items,
            }, () => console.log(this.state))
        })
    }

    render() {
        const {categories, items, active_category, active_item} = this.state;
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
        const buttonLayout = {
            wrapperCol: {
                sm: {
                    span: 16,
                    offset: 8
                }
            }
        };
        return (
            <div>
                <Form.Item label="Category" {...formItemLayout}>
                    <Select style={{width: "100%"}} onSelect={e => this.onSelect(e)}>
                        {categories.map(function (category) {
                            return <Select.Option value={category.id}>{category.category}</Select.Option>
                        })}
                    </Select>
                </Form.Item>
                {active_category && (
                    <Form.Item label="Item" {...formItemLayout}>
                        <Select style={{width: "100%"}} onSelect={e => this.onSelect2(e)}>
                            {items.map(function (item) {
                                console.log(categories[item.id]);
                                if (item.category === active_category) {
                                    return <Select.Option value={item.id}>{item.item_code}</Select.Option>
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
                </Form.Item>
            </div>
        )
    }
}
