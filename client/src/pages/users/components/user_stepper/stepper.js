/**
 * Created by JasonDeniega on 28/06/2018.
 */
import React, {Component} from "react"
import '../../../../utilities/colorsFonts.css'
import {Steps} from 'antd'
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
export class FirstContent extends Component {
    render() {
        return (
            <div>
                <p className="username-label">Please enter username</p>
                <Input className="username" type="text" placeholder="username"/>
            </div>
        );
    }
}
export class SecondContent extends Component {
    render() {
        return (
            <div>
                <Dragger {...props}>
                    <p className="ant-upload-drag-icon">
                        <Icon type="inbox"/>
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    <p className="ant-upload-hint">Support for a single or bulk upload. Strictly prohibit from uploading
                        company data or other band files</p>
                </Dragger>
                <p className="name-label">Please enter name</p>
                <Input className="name" type="text" placeholder="username"/>
                <p className="name-label">Please enter address</p>
                <Input className="name" type="text" placeholder="laguna"/>
                <p className="name-label">Please enter email</p>
                <Input addonAfter=".com" defaultValue="someone@belair"/>
                <p className="name-label">Please enter contact number</p>
                <Input addonBefore="+639" defaultValue=""/>
            </div>
        );
    }
}
export class LastContent extends Component {
    render() {
        return (
            <div>
                <p> User's temporary password is <b>imabelairboy</b></p>
            </div>
        );
    }
}

const steps = [{
    title: 'Set Username',
    content: <FirstContent/>,
}, {
    title: 'Personal Information',
    content: <SecondContent/>,
}, {
    title: 'Confirm',
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
                        <Button type="primary" onClick={() => {
                            message.success('Processing complete!');
                        }}>Done</Button>
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