/**
 * Created by JasonDeniega on 28/06/2018.
 */
import React, { Component } from "react"
import '../../../../utilities/colorsFonts.css'
import { Steps } from 'antd'
import { Upload, Icon, Input, Button, message, Select, Menu, Dropdown } from 'antd'
import './style.css'
import { postData, getData, postDataWithImage } from '../../../../network_requests/general'
import moment from 'moment';
import { DatePicker } from 'antd';


const { MonthPicker, RangePicker } = DatePicker;
const dateFormat = "YYYY-MM-DD";
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
        }
        else if (status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    },
};
export class FirstContent extends Component {
    state = {
        "username": "",
        "password": "",
        "error": "",
        "user_type": "Please select user type"
    };

    onChangeUserName = (e) => {
        e.preventDefault();
        this.setState({ username: e.target.value });
    };
    onChangePassword = (e) => {
        e.preventDefault();
        this.setState({ password: e.target.value });
    };
    onChangeConfirmPW = (a) => {
        a.preventDefault();
        this.setState({ confirm_password: a.target.value });
        console.log(this.state.password);
        console.log(this.state.confirm_password);
        if (this.state.password != this.state.confirm_password) {
            this.setState({
                error: "Passwords do not match"
            });
        }
        else {
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
            "user_type": this.state.user_type
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
                }
                else {
                    const { username, password, user_type } = this.state;
                    this.props.next(username, password, user_type)
                }
            })
            .catch(error => console.log("error"));
    };
    handleUserTypeSelect = (item) => {
        this.setState({
            user_type: item.key
        })
    };
    userTypes = (
        <Menu onClick={this.handleUserTypeSelect}>
            <Menu.Item key="Driver">Driver</Menu.Item>
            <Menu.Item key="OM">Operations Manager</Menu.Item>
            <Menu.Item key="Clerk">Clerk</Menu.Item>
            <Menu.Item key="Supervisor">Supervisor</Menu.Item>
        </Menu>
    );

    render() {
        const { username, password, confirm_password } = this.state;
        return (
            <div>
                <p className="username-label">Please select user type</p>
                <Dropdown.Button overlay={this.userTypes}>
                    {this.state.user_type}
                </Dropdown.Button>
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
        sex: "M",
        birth_date_object: moment('2015/01/01', dateFormat),
        address: "",
        contact_no: "",
        birth_date: "",
        image: null,
        application_date_object: moment('2015/01/01', dateFormat),
        application_date: ""
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
        birth_date_object: date,
        birth_date: dateString
    });

    handleSelectChange = fieldName => value => {
        // this function is to handle drop-downs
        const state = { ...this.state };
        state[fieldName] = value;
        this.setState({
            ...state
        });
    };
    handleApplicationDateChange = (date, dateString) => this.setState({
        application_date_object: date,
        application_date: dateString
    });


    getDataFromState = () => {
        const form = { ...this.state };
        delete form.birth_date_object;
        delete form.application_date_object;
        console.log("Form", form);
        return form;
    };

    handleFileChange = (e) => {
        this.setState({
            image: e.target.files[0]
        })
    };

    render() {
        return (
            <div>
                <Input type="file" placeholder="select image" onChange={this.handleFileChange}/>
                <Input onChange={this.handleFormChange("name")} value={this.state.name} className="user-input"
                       type="text"
                       placeholder="enter name"/>
                <Select onChange={this.handleSelectChange("sex")} className="user-input" defaultValue="Male">
                    <Option value="M">Male</Option>
                    <Option value="F">Female</Option>
                </Select>
                <DatePicker onChange={this.handleDateFormChange} format={dateFormat}/>
                <Input onChange={this.handleFormChange("address")} value={this.state.address} className="user-input"
                       type="text"
                       placeholder="Enter address"/>
                <Input onChange={this.handleFormChange("email")} value={this.state.email} className="user-input"
                       addonAfter=".com"
                       placeholder="Enter email address"/>
                <Input onChange={this.handleFormChange("contact_no")} value={this.state.contact_no}
                       className="user-input" addonBefore="+639"
                       placeholder="Enter contact number"/>
                <DatePicker onChange={this.handleApplicationDateChange} format={dateFormat}/>
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
        user_type: ""
    };

    next = (username, password, user_type) => {
        const current = this.state.current + 1;
        //add the fields from first content to this class
        this.setState({
            current,
            username,
            password,
            user_type
        });
        // console.log(this.state.userType);
    };
    onSubmit = form => {
        //append all items of this classes' states (username and password)
        // + personal info received from SecondContent (form)
        const data = { ...this.state, ...form };
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => formData.append(key, value));
        console.log(formData);

        // for (const pair of formData.entries()) {
        //     console.log(pair[0] + ', ' + pair[1]);
        // }
        postDataWithImage('/users', formData)
            .then(data => {
                if (data.error) {
                    console.log("theres an error");
                    this.setState({
                        error: data["error"]
                    });
                    console.log(this.state.error);
                }
                else {
                    console.log(data);
                    console.log(data.user_staff);
                    this.props.handleOk(data.user_staff);
                }
            })
            .catch(error => console.log(error));
    };

    prev() {
        const current = this.state.current - 1;
        this.setState({ current });
    }

    render() {
        const { current } = this.state;
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