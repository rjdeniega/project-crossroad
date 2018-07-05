/**
 * Created by JasonDeniega on 28/06/2018.
 */
import React, {Component} from "react"
import '../../../../utilities/colorsFonts.css'
import {Steps} from 'antd'
import {Upload, Icon, Input, Button, message} from 'antd'
import './style.css'
import {postData} from '../../../../network_requests/general'


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
    state = {
        "username": "",
        "password": "",
        "confirm_password": "",
        "error": "",
    };

    onChangeUserName = (e) => {
        e.preventDefault();
        this.setState({username: e.target.value});
    };
    onChangePassword = (e) => {
        e.preventDefault();
        this.setState({password: e.target.value});
    };
    onChangeConfirmPW = (a) => {
        a.preventDefault();
        this.setState({confirm_password: a.target.value});
        console.log(this.state.password);
        console.log(this.state.confirm_password);
        if (this.state.password != this.state.confirm_password) {
            this.setState({
                error: "Passwords do not match"
            });
        } else {
            this.setState({
                error: ""
            });
        }
    };
    handleUserCreate = () => {

        const data = {
            "username":this.state.username,
            "password":this.state.password,
        };
        // you only have to do then once
        postData('users', data)
            .then(data => {
                if(data.error){
                    console.log("theres an error");
                    this.setState({
                        error: data["error"]
                    });
                    console.log(this.state.error);
                }else{
                    this.props.next()
                }
            })
            .catch(error => message(error));
    };

    render() {
        const {username, password, confirm_password} = this.state;
        return (
            <div>
                <p className="username-label">Please enter username</p>
                <Input className="username" onChange={this.onChangeUserName} value={username} type="text"
                       placeholder="username"/>
                <p className="username-label">Please enter password</p>
                <Input className="password" onChange={this.onChangePassword} value={password} type="password"/>
                {/*<p className="username-label">Confirm password</p>*/}
                {/*<Input className="password" type="password" onChange={this.onChangeConfirmPW} value={confirm_password}/>*/}
                <p className="user-error-msg">{this.state.error}</p>
                <Button onClick={this.handleUserCreate}>Next</Button>
            </div>
        );
    }
}
export class SecondContent extends Component {
    render() {
        return (
            <div>
                <Dragger className="user-dragger"{...props}>
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
                <Input addonAfter=".com" placeholder="someone@belair"/>
                <p className="name-label">Please enter contact number</p>
                <Input addonBefore="+639" placeholder=""/>
                <Button onClick={() => this.props.handleSubmit()}>Next</Button>
            </div>
        );
    }
}
export class LastContent extends Component {
    render() {
        return (
            <div>
                <p> User Successfully Created</p>
            </div>
        );
    }
}

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
        const steps = [{
            title: 'Set Username',
            content: <FirstContent next={() => this.next()}/>,
        }, {
            title: 'Personal Information',
            content: <SecondContent/>,
        }, {
            title: 'Confirm',
            content: <LastContent/>,
        }];
        return (
            <div>
                <Steps current={current} size="small">
                    {steps.map(item => <Step key={item.title} title={item.title}/>)}
                </Steps>
                <div className="steps-content">{steps[this.state.current].content}</div>
            </div>
        );
    }
}