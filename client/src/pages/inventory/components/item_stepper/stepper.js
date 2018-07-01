/**
 * Created by Not Jason Deniega on 28/06/2018.
 */
import React, {Component} from "react"
import '../../../../utilities/colorsFonts.css'
import {Steps, Form} from 'antd'
import {Upload, Icon, Input, Button, message} from 'antd'
import './style.css'

const Step = Steps.Step;
const Dragger = Upload.Dragger;
const props = {
    name: 'file',
    multiple: true,
    action: '//jsonplaceholder.typicode.com/posts/',
    onChange(info) {
        const status = info.file.status;
        if (status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (status === 'done') {
            message.success(`${info.file.name} file uploaded successfully.`);
        } else if (status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    },
};

class ItemForm extends React.Component{}

ItemForm = Form.create({})(ItemForm);

export class FirstContent extends Component {
    render() {
        return (
            <div className='item-form'>
                <p className='name-label'>Item Name</p>
                <Input className='name' type="text" placeholder="Item Name"/>
                <p className='quantity-label'>Initial Quantity</p>
                <Input className='quantity' type="text" placeholder="Initial Quantity"/>
                <p className='brand-label'>Brand</p>
                <Input className='brand' type="text" placeholder="Brand"/>
                <p className='vendor-label'>Vendor</p>
                <Input className='vendor' type="text" placeholder="Vendor"/>
            </div>
        );
    }
}
export class LastContent extends Component {
    render() {
        return (
            <div>
                <Dragger {...props}>
                    <p className="ant-upload-drag-icon">
                        <Icon type="inbox"/>
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    <p className="ant-upload-hint">Upload a single image of the item</p>
                </Dragger>
            </div>
        );
    }
}

const steps = [{
    title: 'Input Item Details',
    content: <FirstContent/>,
}, {
    title: 'Upload Item Picture',
    content: <LastContent/>,
}];

export class Stepper extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 0,
        };
    }

    next() {
        const current = this.state.current + 1;
        this.setState({current});
    }

    prev() {
        const current = this.state.current - 1;
        this.setState({current});
    }

    render() {
        const {current} = this.state;
        return (
            <div>
                <Steps current={current} size="small">
                    {steps.map(item => <Step key={item.title} title={item.title}/>)}
                </Steps>
                <div className="steps-content">{steps[this.state.current].content}</div>
                <div className="steps-action">
                    {
                        this.state.current < steps.length - 1
                        &&
                        <Button type="primary" onClick={() => this.next()}>Next</Button>
                    }
                    {
                        this.state.current === steps.length - 1
                        &&
                        <Button type="primary" onClick={this.props.handleOk}>Done</Button>
                    }
                    {
                        this.state.current > 0
                        &&
                        <Button style={{marginLeft: 8}} onClick={() => this.prev()}>
                            Previous
                        </Button>
                    }
                </div>
            </div>
        );
    }
}