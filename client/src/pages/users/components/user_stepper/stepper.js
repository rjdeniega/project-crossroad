/**
 * Created by JasonDeniega on 28/06/2018.
 */
import React, {Component} from "react"
import '../../../../utilities/colorsFonts.css'
import {Steps} from 'antd'
import {Upload, Icon, Input, Button, message, Select} from 'antd'
import './style.css'
import {postData, getData} from '../../../../network_requests/general'
import moment from 'moment';
import {DatePicker} from 'antd';


const {MonthPicker, RangePicker} = DatePicker;
const dateFormat = "MM/DD/YYYY";
const Option = Select.Option;
const Step = Steps.Step;
const Dragger = Upload.Dragger;
const props = {
    name: 'file',
    multiple: true,
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
        console.log("this was clicked");
        const data = {
            "username": this.state.username,
            "password": this.state.password,
        };
        // you only have to do then once
        postData('/users/is_unique', data)
            .then(data => {
                if (data.error) {
                    console.log("theres an error");
                    this.setState({
                        error: data["error"]
                    });
                    console.log(this.state.error);
                } else {
                    const {username, password} = this.state;
                    this.props.next(username, password)
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
    state = {
        name: "",
        email: "",
        sex: "Male",
        birthDateObject: moment('2015/01/01', dateFormat),
        address: "",
        contactNumber: "",
        birthDate: "",
        image: null,
    };
    //shortcut to instantiating one by one handleEmail, handleName, etc...
    // no need to understand just use haha
    // handleChanges = fieldName => event => this.setState({ fieldName : event.target.value });
    // handleEmailChange = (e) => {
    //     this.setState({email:e.target.value})
    // };
    // handleNameChange = (e) => {
    //     this.setState({name:e.target.value})
    // };
    // handleContactNumberChange = (e) => {
    //     this.setState({contactNumber:e.target.value})
    // };
    // handleAddressChange = (e) => {
    //     this.setState({email:e.target.value})
    // };
    // handleBirthdateChange = (e) => {
    //     this.setState({email:e.target.value})
    // };
    // handleSexChange = (e) => {
    //     this.setState({email:e.target.value})
    // };
    handleFormChange = fieldName => event => {
        return this.handleSelectChange(fieldName)(event.target.value);
        //this is asynchronous, it does not execute in order
        //if console.log is not in callback, it might execute before state is updated

    };

    handleDateFormChange = (date, dateString) => this.setState({
        birthDateObject: date,
        birthDate: dateString
    });

    handleSelectChange = fieldName => value => {
        //this function is to handle dropdowns
        const state = {...this.state};
        state[fieldName] = value;
        this.setState({
            ...state
        }, () => console.log(this.state.birthDate));
    };

    getDataFromState = () => {
        const form = {...this.state};
        delete form.birthDateObject;
        console.log("Form", form);
        return form;
    };
    handleFileChange = (info) => {
        this.setState({image: info.file});
    };

    render() {
        return (
            <div>
                <Dragger className="user-dragger"
                         name='file'
                         multiple='false'
                         onChange={this.handleFileChange}
                >
                    <p className="ant-upload-drag-icon">
                        <Icon type="inbox"/>
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    <p className="ant-upload-hint">Support for a single or bulk upload. Strictly prohibit from uploading
                        company data or other band files</p>
                </Dragger>
                <Input onChange={this.handleFormChange("name")} value={this.state.name} className="user-input"
                       type="text"
                       placeholder="enter name"/>
                <Select onChange={this.handleSelectChange("sex")} className="user-input" defaultValue="Male">
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                </Select>
                <DatePicker onChange={this.handleDateFormChange} format={dateFormat}/>
                <Input onChange={this.handleFormChange("address")} value={this.state.address} className="user-input"
                       type="text"
                       placeholder="Enter address"/>
                <Input onChange={this.handleFormChange("email")} value={this.state.email} className="user-input"
                       addonAfter=".com"
                       placeholder="Enter email address"/>
                <Input onChange={this.handleFormChange("contactNumber")} value={this.state.contactNumber}
                       className="user-input" addonBefore="+639"
                       placeholder="Enter contact number"/>
                <Button onClick={() => this.props.handleSubmit(this.getDataFromState())}>Next</Button>
            </div>
        )
            ;
    }
}

export class Stepper extends Component {
    state = {
        current: 0,
        username: "",
        password: "",
    };

    next = (username, password) => {
        const current = this.state.current + 1;
        //add the fields from first content to this class
        this.setState({
            current,
            username,
            password,
        });
        // console.log(this.state.userType);
    };
    onSubmit = form => {
        //append all items of this classes' states (username and password)
        // + personal info received from SecondContent (form)
        const data = {...this.state, ...form};
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => formData.append(key, value));
        // for (const pair of formData.entries()) {
        //     console.log(pair[0] + ', ' + pair[1]);
        // }
        // postData('/users', data)
        //     .then(data => {
        //         if (data.error) {
        //             console.log("theres an error");
        //             this.setState({
        //                 error: data["error"]
        //             });
        //             console.log(this.state.error);
        //         } else {
        //             console.log(data);
        //         }
        //     })
        //     .catch(error => message.warning(error.message));

    };


    prev() {
        const current = this.state.current - 1;
        this.setState({current});
    }

    render() {
        const {current} = this.state;
        const steps = [{
            title: 'Set Username',
            content: <FirstContent
                next={this.next}
            />,
        }, {
            title: 'Personal Information',
            content: <SecondContent handleSubmit={this.onSubmit}/>,
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