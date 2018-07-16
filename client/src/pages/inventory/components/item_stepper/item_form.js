/**
 * Created by Not Jason Deniega on 28/06/2018.
 */
import React, {Component} from "react"
import '../../../../utilities/colorsFonts.css'
import {Form, Input, Button, message, InputNumber} from 'antd'
import './style.css'
import { postData } from "../../../../network_requests/general";

const FormItem = Form.Item;

function hasErrors(fieldsError){
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}


class ExtendedForm extends React.Component{
    constructor(props){
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount(){
        this.props.form.validateFields();
    }

    handleSubmit(e){
        e.preventDefault();
        let item = {
            name: this.props.name.value,
            brand: this.props.brand.value,
            vendor: this.props.vendor.value,
            unit_price: this.props.unit_price.value,
            quantity: this.props.quantity.value,
            };
        console.log(item);
        // fetch('inventory/items/',{
        //     method: 'POST',
        //     headers: {
        //         'Accept': 'application/json',
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(item),
        // }).then(data => data.json()).then(response => );
        postData('inventory/items/',item).then(response => {
            if(!response.error) {
                message.success(response.item_name + " was added");
            }else{
                console.log(response.error);
            }
        });
        this.props.handleOk();
    }

    render(){
        const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched} = this.props.form;
        const nameError = isFieldTouched('name') && getFieldError('name');
        const brandError = isFieldTouched('brand') && getFieldError('brand');
        const vendorError = isFieldTouched('vendor') && getFieldError('vendor');
        const unitpriceError = isFieldTouched('unit_price') && getFieldError('unit_price');
        const quantityError = isFieldTouched('quantity') && getFieldError('quantity');
        return (
            <div className='item-form'>
                <Form hideRequiredMark={true} onChange={this.handleFormChange} onSubmit={this.handleSubmit}>
                    <FormItem label="Item Name" className='item-name-label'
                              validateStatus={nameError ? 'error' : ''}
                              help={nameError || ''}>
                        {getFieldDecorator('name',{
                            rules: [{
                                required: true,
                                message: 'Please input name',
                            }]
                        })(
                            <Input autoFocus='true' className='item-name' type="text" placeholder="Item Name"/>
                        )}
                    </FormItem>
                    <FormItem className='brand-label' label='Brand'
                              validateStatus={brandError ? 'error' : ''}
                              help={brandError || ''}>
                        {getFieldDecorator('brand',{
                            rules: [{
                                required: true,
                                message: 'Please input brand',
                            }]
                        })(
                            <Input className='brand' type="text" placeholder="Brand"/>
                        )}
                    </FormItem>
                    <FormItem className='vendor-label' label='Vendor'
                              validateStatus={vendorError ? 'error' : ''}
                              help={vendorError || ''}>
                        {getFieldDecorator('vendor',{
                            rules: [{
                                required: true,
                                message: 'Please input vendor',
                            }]
                        })(
                            <Input className='vendor' type="text" placeholder="Vendor"/>
                        )}
                    </FormItem>
                    <FormItem className='unit-price-label' label='Unit Price'
                              validateStatus={unitpriceError ? 'error' :''}
                              help={unitpriceError || ''}>
                        {getFieldDecorator('unit_price',{
                            rules: [{
                                required: true,
                                message: 'Please input unit price',
                            }]
                        })(
                            <InputNumber className='unit_price' type='text' placeholder="Unit Price"
                                     formatter={value => `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                     parser={value => value.replace(/₱\s?|(,*)/g, '')}/>
                        )}
                    </FormItem>
                    <FormItem className='quantity-label' label='Initial Quantity'
                              validateStatus={quantityError ? 'error' : ''}
                              help={quantityError || ''}>
                        {getFieldDecorator('quantity',{
                            rules: [{
                                required: true,
                                message: 'Please input quantity',
                            }]
                        })(
                            <InputNumber className='quantity' type="text" placeholder="Initial Quantity"
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}/>
                        )}
                    </FormItem>
                    <FormItem>
                        <Button type='primary' htmlType='submit' className='item_submit'
                                disabled={hasErrors(getFieldsError())}>Submit</Button>
                    </FormItem>
                </Form>
            </div>
        );
    }
}


const WrappedItemForm = Form.create({
    onFieldsChange(props, changedFields){
        props.onChange(changedFields);
    },
    mapPropsToFields(props){
        return{
            name: Form.createFormField({
                ...props.name,
                value: props.name.value,
            }),
            brand: Form.createFormField({
                ...props.brand,
                value: props.brand.value,
            }),
            vendor: Form.createFormField({
                ...props.vendor,
                value: props.vendor.value,
            }),
            unit_price: Form.createFormField({
                ...props.unit_price,
                value: props.unit_price.value,
            }),
            quantity: Form.createFormField({
                ...props.quantity,
                value: props.quantity.value,
            }),
        }
    },
})(ExtendedForm);

export class ItemForm extends Component {
    state = {
        formLayout: 'vertical',
        fields: {
            name: {
                value: ''
            },
            brand:{
                value: ''
            },
            vendor: {
                value: ''
            },
            unit_price: {
                value: ''
            },
            quantity:{
                value: ''
            }
        }
    };

    handleFormChange = (changedFields) => {
        this.setState(({fields}) => ({
            fields: {...fields, ...changedFields}
        }));
    };

    handleOk = () => {
        this.props.handleOk()
    };

    render(){
        const fields = this.state.fields;
        return(
            <div>
                <WrappedItemForm {...fields} onChange={this.handleFormChange} handleOk={this.handleOk}/>
            </div>
        )

    }
}

