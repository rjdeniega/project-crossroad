import React, {Component} from 'react'
import {Form, Input, InputNumber, Col, Button, message} from 'antd'
import {Icon} from 'react-icons-kit'
import {withMinus} from 'react-icons-kit/entypo/withMinus'
import {postData} from  "../../../network_requests/general"
import {plus} from 'react-icons-kit/entypo/plus'


function hasErrors(fieldsError){
    return Object.keys(fieldsError).some(field=>fieldsError[field])
}

class OutsourceFormInit extends Component{
    constructor(props){
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {
            uuid: 0
        }
    }

    remove = (k) => {
        const {form} = this.props;
        const keys = form.getFieldValue('keys');
        if(keys.length === 1){
            return;
        }
        form.setFieldsValue({
            keys: keys.filter(key=> key !== k)
        })
    }

    add = () => {
        const {form} = this.props;
        const keys = form.getFieldValue('keys');
        const nextKeys = keys.concat(this.state.uuid);
        this.setState({
            uuid: this.state.uuid + 1,
        })
        form.setFieldsValue({
            keys: nextKeys,
        })
    }

    handleSubmit(e){
        e.preventDefault();
        const {repair} = this.props
        this.props.form.validateFields((err, values) => {
            if(typeof values['items'] === 'undefined'){
                message.warning('Add item fields!')
            }
            if(!err && typeof values['items'] !== 'undefined'){
                let labor_cost = values['labor_cost'];
                let items = []
                values['item_name'] = values['item_name'].filter(function(n){return n!= undefined})
                values['quantity'] = values['quantity'].filter(function(n){return n!= undefined})
                values['unit_price'] = values['quantity'].filter(function(n){return n!= undefined})
                values['item_name'].map(function(value, index){
                    let item = {
                        item_name: values['item_name'][index],
                        quantity: values['quantity'][index],
                        unit_price: values['unit_price'][index]
                    }
                    items.push(item)
                })
                let data = {
                    labor_cost: labor_cost,
                    items: items
                }

                postData('inventory/finalize/' + repair.id, data)
                this.props.unload()
                this.props.close()
                message.success('Repair ' + repair.id + ' complete!')
            }
        })
    }

    render(){
        const {getFieldDecorator, getFieldsError, getFieldError,
               isFieldTouched, getFieldValue} = this.props.form;

        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 4},
            },
            wrapperCol: {
                xs: {span:24},
                sm: {span:20}
            }
        };

        const formItemLayoutWithOutLabel = {
            wrapperCol: {
                xs: {span:24, offset: 0},
                sm: {span:20, offset: 4},
            },
        };
        getFieldDecorator('keys', {initialValue: []});
        const keys = getFieldValue('keys');
        const formItems = keys.map((k, index) => {
            return (
                <Form.Item
                    {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                    label={index === 0 ? 'Item' : ''}
                    required
                    key={k}>
                    {getFieldDecorator(`items[${k}]`, {
                        validateTrigger: ['onChange', 'onBlur'],
                        rules: [{
                            required: true,
                            whitespace: true,
                            message: 'Please input item'
                        }],
                    })(
                        <div>

                            <Col span={8}>
                                <Form.Item>
                                    {getFieldDecorator(`item_name[${k}]`, {
                                        validateTrigger: ['onChange', 'onBlur'],
                                        rules: [{
                                            required: true,
                                            whitespace: true,
                                            message: 'Please input item name'
                                        }],
                                    })(
                                        <Input className='item_name' placeholder='Name' style={{marginRight: 8}}/>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={2}>
                                <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                                    -
                                </span>
                            </Col>
                            <Col span={5}>
                                <Form.Item>
                                {getFieldDecorator(`unit_price[${k}]`, {
                                    validateTrigger: ['onChange', 'onBlur'],
                                    rules: [{
                                        required: true,
                                        message: 'Please input unit price'
                                    }],
                                })(
                                    <InputNumber className='unit_price' placeholder='Unit_price' style={{width: '80%', marginRight: 8}}/>
                                )}
                                </Form.Item>
                            </Col>
                            <Col span={2}>
                                <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                                    -
                                </span>
                            </Col>
                            <Col span={5}>
                                <Form.Item>
                                {getFieldDecorator(`quantity[${k}]`, {
                                    validateTrigger: ['onChange', 'onBlur'],
                                    rules: [{
                                        required: true,
                                        message: 'Please input quantity'
                                    }],
                                })(
                                    <InputNumber className='quantity' placeholder='Quantity' style={{width: '80%', marginRight: 8}}/>
                                )}
                                </Form.Item>
                            </Col>
                        </div>
                    )}
                    {keys.length > 1 ?(
                        <Col span={2}>
                            <Icon className='dynamid-delete-button' icon={withMinus}
                                  disabled={keys.length === 1} onClick={() => this.remove(k)}/>
                        </Col>
                    ):null}
                </Form.Item>
            );
        });

        return(
            <Form onSubmit={this.handleSubmit} hideRequiredMark={true}>
                <Form.Item {...formItemLayout} label='Labor Cost' required={true}>
                    {getFieldDecorator('labor_cost', {
                        rules: [{
                            required: true,
                            message: 'Please input labor cost'
                        }]
                    })(
                        <InputNumber className='labor_cost' placeholder='Labor Cost' style={{width: '30%'}}/>
                    )}
                </Form.Item>
                {formItems}
                <Form.Item {...formItemLayoutWithOutLabel}>
                    <Button type='dashed' onClick={this.add} style={{width: '100%'}}>
                        <Icon icon={plus}/>Add Item
                    </Button>
                </Form.Item>
                <Form.Item {...formItemLayoutWithOutLabel}>
                    <Button type="primary" htmlType='submit'>Submit</Button>
                </Form.Item>
            </Form>
        )
    }
}


export const OutsourceForm = Form.create()(OutsourceFormInit)
