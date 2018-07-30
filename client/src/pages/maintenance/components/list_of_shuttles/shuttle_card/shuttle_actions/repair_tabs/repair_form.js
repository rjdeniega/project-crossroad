import React, {Component} from 'react'
import {Icon} from 'react-icons-kit'
import {Form, Input, Button, message, DatePicker} from 'antd'
import {postData} from "../../../../../../../network_requests/general";
import {withMinus} from 'react-icons-kit/entypo/withMinus'
import {plus} from 'react-icons-kit/entypo/plus'
import './style.css'

const FormItem = Form.Item;

function hasErrors(fieldsError){
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}

let uuid = 1;

class RepairFormInit extends React.Component{
    constructor(props){
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state ={
            shuttle: props.shuttle,
        }
    }

    remove = (k) => {
        const { form } = this.props;
        const keys = form.getFieldValue('keys');
        if (keys.length === 1) {
            return;
        }
        form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        });
    };

    add = () => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        const nextKeys = keys.concat(uuid);
        uuid++;
        // can use data-binding to set
        // important! notify form to detect changes
        form.setFieldsValue({
            keys: nextKeys,
        });
    };
/*
    componentDidMount(){
        this.props.form.validateFields();
    }*/

    handleSubmit(e){
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
            }
        });
    }

    render(){
        const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched, getFieldValue} = this.props.form;

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
        getFieldDecorator('keys', { initialValue: [1] });
        const keys = getFieldValue('keys');
        const formItems = keys.map((k, index) => {
            return (
                <FormItem
                    {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                    label={index === 0 ? 'Problems' : ''}
                    required={false}
                    key={k}>
                    {getFieldDecorator(`problems[${k}]`, {
                        validateTrigger: ['onChange', 'onBlur'],
                        rules: [{
                            required: true,
                            whitespace: true,
                            message: "Please input problem or delete this field.",
                        }],
                    })(
                        <Input className='problems' placeholder="Problem" style={{ width: '60%', marginRight: 8 }} />
                    )}
                    {keys.length > 2 ? (
                        <Icon
                            className="dynamic-delete-button" icon={withMinus}
                            disabled={keys.length === 1} onClick={() => this.remove(k)}/>
                    ) : null}
                    </FormItem>);
        });
        return(
            <Form onSubmit={this.handleSubmit}>
                <FormItem label='Date Reported' required={true}>
                  {getFieldDecorator('date_reported', {
                      rules: [{required: true,
                               message: 'Date reported is required!'}],
                  })(<DatePicker format='YYYY-MM-DD'/>)}
                </FormItem>
                {formItems}
                <FormItem {...formItemLayoutWithOutLabel}>
                    <Button type="dashed" onClick={this.add} style={{ width: '60%' }}>
                        <Icon icon={plus} /> Add field
                    </Button>
                </FormItem>
                <FormItem {...formItemLayoutWithOutLabel}>
                    <Button type="primary" htmlType="submit">Submit</Button>
                </FormItem>
            </Form>
        )
    }
}

const WrappedRepairForm = Form.create()(RepairFormInit);

export class RepairForm extends Component{

    handleOk = () => {
        this.props.handleOk()
    };

    render(){
        return(
            <div>
                <br/>
                <h2>Submit Checkup Request</h2>
                <WrappedRepairForm handleOk={this.handleOk}/>
            </div>
        )
    }
}
