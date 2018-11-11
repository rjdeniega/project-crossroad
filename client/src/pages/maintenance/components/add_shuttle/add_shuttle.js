import React, {Component} from 'react'
import {Modal, Button, Form, Input, DatePicker, message, Select} from 'antd'
import moment from 'moment'
import './style.css'
import { postData } from "../../../../network_requests/general";

const FormItem = Form.Item;
const dateFormat = 'YYYY-MM-DD';


function hasErrors(fieldsError){
    return Object.keys(fieldsError).some(field => fieldsError[field])
}

class AddShuttleFormInit extends React.Component{
    constructor(props){
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    componentDidMount(){
        this.props.form.validateFields();
    }

    handleSubmit(e){
        e.preventDefault();

        let shuttle ={
            plate_number: this.props.plate_number.value,
            make: this.props.make.value,
            model: this.props.model.value,
            date_acquired: this.props.date_acquired.value.format('YYYY-MM-DD'),
            status: "A",
            mileage: this.props.mileage.value,
            route: this.props.route.value,
        };

        postData('inventory/shuttles/', shuttle)
            .then(response=> {
                if(!response.error){
                    message.success("Shuttle " + response.shuttle_id + " has been added");
                }else{
                    console.log(response.error);
                }
            });

        this.props.handleOk()
    }

    render(){
        const{ getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
        const plateNumberError = isFieldTouched('plate_number') && getFieldError('plate_number');
        const makeError = isFieldTouched('make') && getFieldError('make');
        const modelError = isFieldTouched('model') && getFieldError('model');
        const mileageError = isFieldTouched('mileage') && getFieldError('mileage');
        const dateAcquiredError = isFieldTouched('date_acquired') && getFieldError('date_acquired');

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };

        return(
            <div>
                <Form onChange={this.handleFormChange} onSubmit={this.handleSubmit} hideRequiredMark={true}>
                    <FormItem label='Plate Number' validateStatus={plateNumberError ? 'error': ''}
                              help={plateNumberError || ''} {...formItemLayout}>
                        {getFieldDecorator('plate_number', {
                            rules: [{required: true,
                                     message: 'Plate Number is required!'},
                                    {len: 6,
                                     message: 'Please input a proper plate number (No hyphen)'}],
                        })(<Input className='plate_number' type='text' placeholder='AB1234 / ABC123'/>)}
                    </FormItem>
                    <FormItem label='Make' validateStatus={makeError ? 'error': ''}
                              help={makeError || ''} {...formItemLayout}>
                        {getFieldDecorator('make', {
                            rules: [{required: true,
                                     message: 'Make is required!'}]
                        })(<Input className='make' type='text' placeholder='Make'/>)}
                    </FormItem>
                    <FormItem label='Model' validateStatus={modelError ? 'error': ''}
                              help={modelError || ''} {...formItemLayout}>
                        {getFieldDecorator('model', {
                            rules: [{required: true,
                                     message: 'Model is required!'}],
                        })(<Input className='model' type='text' placeholder='Model'/>)}
                    </FormItem>
                    <FormItem label='Mileage' validateStatus={mileageError ? 'error' : ''}
                        help={mileageError || ''} {...formItemLayout}>
                        {getFieldDecorator('mileage', {
                            rules: [{
                                required: true,
                                message: 'Mileage is required!'
                            }],
                        })(<Input className='mileage' type='number' placeholder='Mileage' />)}
                    </FormItem>
                    <FormItem label='Route' {...formItemLayout}>
                            <Select defaultValue="Main Road" className="route">
                                <Select.Option value="Main Road">Main Road</Select.Option>
                                <Select.Option value="Kaliwa">Kaliwa</Select.Option>
                                <Select.Option value="Kanan">Kanan</Select.Option>
                            </Select>
                    </FormItem>
                    <FormItem label='Date Acquired' validateStatus={dateAcquiredError ? 'error': ''}
                              help={dateAcquiredError || ''} {...formItemLayout}>
                        {getFieldDecorator('date_acquired', {
                            rules: [{required: true,
                                     message: 'Date acquired is required!'}],
                        })(<DatePicker format={dateFormat}/>)}
                    </FormItem>
                    <FormItem wrapperCol={{
                        xs: {span: 24, offset: 0},
                        sm: {span: 16, offset: 8},
                    }}>
                        <Button type="primary" htmlType='submit' disabled={hasErrors(getFieldsError())}>
                            Submit
                        </Button>
                    </FormItem>
                </Form>
            </div>
        )
    }
}

const AddShuttleForm = Form.create({

    onFieldsChange(props, changedFields){
        props.onChange(changedFields);
    },

    mapPropsToFields(props){
        return{
            plate_number: Form.createFormField({
                ...props.plate_number,
                value: props.plate_number.value,
            }),
            make: Form.createFormField({
                ...props.make,
                value: props.make.value,
            }),
            model: Form.createFormField({
                ...props.model,
                value: props.model.value,
            }),
            mileage: Form.createFormField({
                ...props.mileage,
                value: props.mileage.value,
            }),
            route: Form.createFormField({
                ...props.route,
                value: props.route.value
            }),
            date_acquired: Form.createFormField({
                ...props.date_acquired,
                value: props.date_acquired.value,
            })
        }
    },

})(AddShuttleFormInit);

class FinalForm extends Component{
    state = {
        formLayout: 'vertical',
        fields: {
            plate_number: {
                value: ''
            },
            make: {
                value: ''
            },
            model: {
                value: ''
            },
            mileage: {
                value: ''
            },
            route: {
                value: ''
            },
            date_acquired: {
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
                <AddShuttleForm {...fields} onChange={this.handleFormChange} handleOk={this.handleOk}/>
            </div>
        )
    }
}

export class AddShuttle extends Component{
    state = {
        visible: false};

    showModal = () => {
        this.setState({
            visible: true,
        })
    };

    handleOk = () => {
        this.setState({
            visible: false,
        })
    };

    handleCancel = () => {
        this.setState({
            visible: false,
        })
    };

    render(){
        return (
            <div className='button-div'>
                <Button type="primary" onClick={this.showModal}>Add Shuttle</Button>
                <Modal title="Add Shuttle" visible={this.state.visible} onOk={this.handleOk}
                       onCancel={this.handleCancel} footer={false}>
                    <FinalForm handleOk={this.handleOk}/>
                </Modal>
            </div>
        )
    }
}
