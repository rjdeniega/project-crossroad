import React, {Component} from 'react'
import {postData, getData} from "../../../network_requests/general"
import {Form, Menu, Select, InputNumber, Button, Checkbox, message} from 'antd'

const FormItem = Form.Item;
const Option = Select.Option;

class ConsumableItemFormInit extends Component {
    constructor(props) {
        super(props)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.state = {
            items: [],
            selectedItem: 0,
            depleted: false
        }
    }

    componentDidMount() {
        getData('inventory/mechanic/items/2')
            .then(response => {
                return response;
            })
            .then(data => {
                console.log(data.items);
                this.setState({
                    items: data.items
                })
            }, () => console.log(this.state.items))
    }

    toggleChecked = () => {
        this.setState({depleted: !this.state.depleted})
    }

    handleSubmit(e) {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const data = {
                    selectedItem: this.state.selectedItem,
                    depleted: this.state.depleted,
                }

                postData('inventory/mechanic/items/add/' + this.props.repair, data)
                    .then(data => {
                        if (!data.error) {
                            this.props.loadItems(data.modifications)
                        } else {
                            console.log(data.error)
                        }
                    })

                this.props.close();
                message.success('Item added!')
            }
        })
    }

    handleChange(value) {
        this.setState({
            selectedItem: value
        })
    }

    render() {
        const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched, getFieldValue} = this.props.form;
        const {items} = this.state
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 4},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 20},
            },
        };
        const formItemLayoutWithOutLabel = {
            wrapperCol: {
                xs: {span: 24, offset: 0},
                sm: {span: 20, offset: 4},
            },
        };
        return (
            <Form onSubmit={this.handleSubmit} hideRequiredMark={true}>
                <FormItem {...formItemLayout} label='Item'>
                    {getFieldDecorator('item', {
                        rules: [{
                            required: true,
                            message: 'Please select an item'
                        }],
                    })(
                        <Select placeholder='Please select an item' onChange={this.handleChange.bind(this)}>
                            {items.map((item, index) => (
                                <Option value={item.id}>{item.name}</Option>
                            ))}
                        </Select>
                    )}
                </FormItem>
                <FormItem {...formItemLayoutWithOutLabel} className='depleted-labed'>
                    &nbsp;
                    {getFieldDecorator('depleted', {
                        valuePropName: 'checked',
                    })(
                        <Checkbox className='depleted' onChange={this.toggleChecked}>Depleted</Checkbox>
                    )}
                </FormItem>
                <FormItem {...formItemLayoutWithOutLabel}>
                    <Button type='primary' htmlType='submit'>Submit</Button>
                </FormItem>
            </Form>
        )
    }
}

const ConsumableItemForm = Form.create()(ConsumableItemFormInit);

class NonConsumableItemFormInit extends Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {
            items: [],
            maxQuantity: 1,
            selectedItem: 0,
            disabled: true
        }
    }

    componentDidMount() {
        getData('inventory/mechanic/items/1')
            .then(response => {
                return response;
            })
            .then(data => {
                console.log(data.items);
                this.setState({
                    items: data.items
                })
            }, () => console.log(this.state.items))
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const data = {
                    quantity: values['quantity'],
                    selectedItem: this.state.selectedItem
                }

                postData('inventory/mechanic/items/add/' + this.props.repair, data)
                    .then(data => {
                        if (!data.error) {
                            this.props.loadItems(data.modifications)
                        } else {
                            console.log(data.error)
                        }
                    })

                this.props.close();
                message.success('Item added!')
            }
        })
    }

    handleChange(value, key) {
        this.setState({
            maxQuantity: value,
            selectedItem: key.key,
            disabled: false
        })
        console.log(value)
        console.log(key.key)
    }

    render() {
        const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched, getFieldValue} = this.props.form;
        const {items} = this.state
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 4},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 20},
            },
        };
        const formItemLayoutWithOutLabel = {
            wrapperCol: {
                xs: {span: 24, offset: 0},
                sm: {span: 20, offset: 4},
            },
        };
        return (
            <Form onSubmit={this.handleSubmit} hideRequiredMark={true}>
                <FormItem {...formItemLayout} label='Item'>
                    {getFieldDecorator('item', {
                        rules: [{
                            required: true,
                            message: 'Please select an item'
                        }],
                    })(
                        <Select placeholder='Please select an item' onChange={this.handleChange.bind(this)}>
                            {items.map((item, index) =>
                                (
                                    <Option value={item.quantity}
                                            key={item.id}>{item.quantity} - {item.name}</Option>
                                )
                            )}
                        </Select>
                    )}
                </FormItem>
                <FormItem {...formItemLayout} label='Quantity'>
                    {getFieldDecorator('quantity', {
                        rules: [{
                            required: true,
                            message: 'Please input a quantity'
                        }]
                    })(
                        <InputNumber min={1} max={this.state.maxQuantity} disabled={this.state.disabled}/>
                    )}
                </FormItem>
                <FormItem {...formItemLayoutWithOutLabel}>
                    <Button type='primary' htmlType='submit'>Submit</Button>
                </FormItem>
            </Form>
        )
    }
}

const NonConsumableItemForm = Form.create()(NonConsumableItemFormInit);

export class AddItems extends Component {
    constructor(props) {
        super(props);
        this.state = {
            categories: [],
            items: [],
            active_category: null,
            active_item: null,
        }
    }

    componentDidMount() {
        this.getItems()
    }

    handleClick = (e) => {
        let content;
        switch (e.key) {
            case '1':
                content = 1;
                break;
            case '2':
                content = 2;
                break;
        }
        this.setState({
            currentTab: content
        })
    };

    onSelect(value) {
        this.setState({
            active_category: value,
        }, () => {
            console.log(this.state.active_category)
        })
    }

    onSelect2(value){
        this.setState({
            active_item: value
        })
    }

    getItems() {
        getData('inventory/items/item_category').then(data => {
            this.setState({
                categories: data.item_category
            }, () => {
                console.log(this.state.categories)
            })
        });
        getData('inventory/items/').then(data => {
            this.setState({
                items: data.items,
            })
        })
    }

    render() {
        const {categories, items, active_category} = this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 4},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 16},
            },
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
                            {items.map(function(item){
                                console.log(categories[item.id]);
                                if(item.category === active_category){
                                    return <Select.Option value={item.item_code}>{item.item_code}</Select.Option>
                                }
                            })}
                        </Select>
                    </Form.Item>
                )}
            </div>
        )
    }
}
