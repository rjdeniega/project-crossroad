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

function disabledDate(current){
    return current > moment().endOf('day')
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
            shuttle_number: this.props.shuttle_number.value,
            plate_number: this.props.plate_number.value,
            make: this.props.make.value,
            model: this.props.model.value,
            date_acquired: this.props.date_acquired.value.format('YYYY-MM-DD'),
            status: "A",
            mileage: this.props.mileage.value,
            route: this.props.route.value,
            dayoff_date: this.props.dayoff_date.value,
        };

        console.log(shuttle);

        postData('inventory/shuttles/', shuttle)
            .then(response=> {
                if(!response.error){
                    message.success("Shuttle " + response.shuttle_number + " has been added");
                }else{
                    console.log(response.error);
                }
            });

        this.props.handleOk()
    }

    render(){
        const{ getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
        const shuttleNumberError = isFieldTouched('shuttle_number') && getFieldError('shuttle_number');
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
                    <FormItem label='Shuttle Number' validateStatus={shuttleNumberError ? 'error': ''}
                              help={shuttleNumberError || ''} {...formItemLayout}>
                        {getFieldDecorator('shuttle_number',{
                            rules: [{required: true,
                                     message: 'Shuttle Number is required!'}]
                        })(<Input className='shuttle_number' type='text' placeholder='Number'/>)}
                    </FormItem>
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
                        {getFieldDecorator('route')(<Select className="route" defaultValue="Main Road">
                            <Select.Option value="Main Road" selected>Main Road</Select.Option>
                            <Select.Option value="Kaliwa">Kaliwa</Select.Option>
                            <Select.Option value="Kanan">Kanan</Select.Option>
                            <Select.Option value="Back-up">Back-up</Select.Option>
                        </Select>)}
                    </FormItem>
                    <FormItem label='Day-off Date' {...formItemLayout}>
                        {getFieldDecorator('dayoff_date')(
                            <Select className="route" defaultValue="Monday">
                                <Select.Option value="Monday" selected>Monday</Select.Option>
                                <Select.Option value="Tuesday">Tuesday</Select.Option>
                                <Select.Option value="Wednesday">Wednesday</Select.Option>
                                <Select.Option value="Thursday">Thursday</Select.Option>
                                <Select.Option value="Friday">Friday</Select.Option>
                                <Select.Option value="Saturday">Saturday</Select.Option>
                                <Select.Option value="Sunday">Sunday</Select.Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label='Date Acquired' validateStatus={dateAcquiredError ? 'error': ''}
                              help={dateAcquiredError || ''} {...formItemLayout}>
                        {getFieldDecorator('date_acquired', {
                            rules: [{required: true,
                                     message: 'Date acquired is required!'}],
                        })(<DatePicker format={dateFormat} className="date_acquired" disabledDate={disabledDate}/>)}
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
            shuttle_number: Form.createFormField({
                ...props.shuttle_number,
                value: props.shuttle_number.value,
            }),
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
                value: props.route.value,
            }),
            date_acquired: Form.createFormField({
                ...props.date_acquired,
                value: props.date_acquired.value,
            }),
            dayoff_date: Form.createFormField({
                ...props.dayoff_date,
                value: props.dayoff_date.value,
            })
        }
    },

})(AddShuttleFormInit);

class FinalForm extends Component{
    state = {
        formLayout: 'vertical',
        fields: {
            shuttle_number: {
                value: ''
            },
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
            },
            dayoff_date: {
                value: ''
            },
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
                <Button type="primary" onClick={this.showModal} htmlType="button">Add Shuttle</Button>
                <Modal title="Add Shuttle" visible={this.state.visible} onOk={this.handleOk}
                       onCancel={this.handleCancel} footer={false}>
                    <FinalForm handleOk={this.handleOk}/>
                </Modal>
            </div>
        )
    }
}
