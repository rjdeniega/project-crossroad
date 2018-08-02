import React, {Component} from 'react'
import {postData, getData} from "../../../network_requests/general"
import {Form, Menu, Select, InputNumber, Button, Checkbox} from 'antd'

const FormItem = Form.Item;
const Option = Select.Option;

class ConsumableItemFormInit extends Component{
    constructor(props){
        super(props)
        this.state = {
            items: [],
            selectedItem: 0,
            depleted: false
        }
    }

    componentDidMount(){
        getData('inventory/mechanic/items/2')
            .then(response => {
                return response;
            })
            .then(data => {
                console.log(data.items)
                this.setState({
                    items: data.items
                })
            }, () => console.log(this.state.items))
    }

    toggleChecked = () => {
        this.setState({depleted : !this.state.depleted})
    }

    handleSubmit(e){
        e.preventDefault()
    }

    handleChange(value){
        this.setState({
            selectedItem: value
        })
    }

    render(){
        const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched, getFieldValue} = this.props.form;
        const {items} = this.state
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 20 },
            },
        };
        const formItemLayoutWithOutLabel = {
            wrapperCol: {
                xs: { span: 24, offset: 0 },
                sm: { span: 20, offset: 4 },
            },
        };
        return(
            <Form onSubmit={this.handleSubmit} hideRequiredMark={true}>
                <FormItem {...formItemLayout} label='Item'>
                    {getFieldDecorator('item',{
                        rules: [{
                            required: true,
                            message: 'Please select an item'
                        }],
                    })(
                        <Select placeholder='Please select an item' onChange={this.handleChange.bind(this)}>
                            {items.map((item, index) => (
                                <Option value={item.id}>{item.name} - {item.quantity}</Option>
                            ))}
                        </Select>
                    )}
                </FormItem>
                <FormItem {...formItemLayoutWithOutLabel} className='depleted-labed'>
                    &nbsp;
                    {getFieldDecorator('depleted',{
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

const ConsumableItemForm = Form.create()(ConsumableItemFormInit)

class NonConsumableItemFormInit extends Component{
    constructor(props){
        super(props)
        this.state = {
            items: [],
            maxQuantity: 1,
            selectedItem: 0,
            disabled: true
        }
    }

    componentDidMount(){
        getData('inventory/mechanic/items/1')
            .then(response => {
                return response;
            })
            .then(data => {
                console.log(data.items)
                this.setState({
                    items: data.items
                })
            }, () => console.log(this.state.items))
    }

    handleSubmit(e){
        e.preventDefault()
    }

    handleChange(value, key){
        this.setState({
            maxQuantity: value,
            selectedItem: key.key,
            disabled: false
        })
        console.log(value)
        console.log(key.key)
    }

    render(){
        const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched, getFieldValue} = this.props.form;
        const {items} = this.state
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 20 },
            },
        };
        const formItemLayoutWithOutLabel = {
            wrapperCol: {
                xs: { span: 24, offset: 0 },
                sm: { span: 20, offset: 4 },
            },
        };
        return(
            <Form onSubmit={this.handleSubmit} hideRequiredMark={true}>
                <FormItem {...formItemLayout} label='Item'>
                    {getFieldDecorator('item', {
                        rules: [{
                            required: true,
                            message: 'Please select an item'
                        }],
                    })(
                        <Select placeholder='Please select an item' onChange={this.handleChange.bind(this)}>
                            {items.map((item,index) =>
                                (
                                    <Option value={item.quantity}
                                            key={item.id}>{item.name} - {item.quantity}</Option>
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

const NonConsumableItemForm = Form.create()(NonConsumableItemFormInit)

export class AddItems extends Component{
    constructor(props){
        super(props);
        this.state ={
            currentTab: 1,
        }
    }

    handleClick = (e) => {
        let content;
        switch (e.key){
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
    }

    renderCurrentPage = () => {
        const {currentTab} = this.state;
        switch (currentTab){
            case 1:
                return (<ConsumableItemForm/>)
            case 2:
                return (<NonConsumableItemForm/>)
        }
    }

    render(){
        return(
            <div>
                <Menu onClick={this.handleClick} selectedKeys={[this.state.currentTab]}
                      mode='horizontal'>
                      <Menu.Item key={1}>
                          Consumables
                      </Menu.Item>
                      <Menu.Item key={2}>
                          Non-consumables
                      </Menu.Item>
                </Menu>
                <br/>
                {this.renderCurrentPage()}
            </div>
        )
    }
}
