/**
 * Created by JasonDeniega on 25/06/2018.
 */
import '../../utilities/colorsFonts.css'
import React, {Component} from 'react'
import './style.css'
import {Button} from 'antd'
import {Icon, Input} from 'antd'
import {postData} from '../../network_requests/general'
import crossroad_logo from '../../images/crossroad_logo.png'


export class SignInPage extends Component {
    constructor(props) {
        super(props);
        //the page initially has blank username and pw
        this.state = {
            user: '',
            username: '',
            password: ''
        };
    }

    //handle changes in the page
    emitEmpty = () => {
        this.userNameInput.focus();
        this.setState({username: ''});
    };
    //if the textbox changes change the content
    onChangeUserName = (e) => {
        this.setState({username: e.target.value});
    };
    onChangePassword = (e) => {
        this.setState({password: e.target.value});
    };

    attemptSignIn = () => {
        const data = {
            'username': this.state.username,
            'password': this.state.password
        };
        //equivalent to an ajax request (ajax needs jquery; fetch is built in)
        // this uses a shortcut from general.js from network_requests
        //.then = onSuccess .catch= onError
        postData('sign-in',data)
            .then(data => console.log('data is', data))
            .catch(error => console.log('error is', error));
    };

    render() {
        //same as const username = this.state.username and const password = this.state password
        const {username, password} = this.state;
        //if theres a username put an icon; otherwise null
        const suffix = username ? <Icon type="close-circle" onClick={this.emitEmpty}/> : null;
        return (
            <div className="sign-in-body">
                <div className="content-section">
                    <div className="sign-in-logos">
                        <img className="crossroad-logo" src={crossroad_logo}/>
                    </div>

                    <div className="greeting-intro">
                        Welcome to &nbsp;
                    </div>
                    <div className="project-name">
                        Project: Crossroad
                    </div>
                    <div className="project-description">
                        A Laguna Bel-Air Transport Cooperative Management Information System
                    </div>
                    <div className="form-section">
                        <Input
                            className="username"
                            placeholder="Enter your username"
                            size="large"
                            prefix={<Icon type="user" style={{fontSize: 15, color: '#dddd'}}/>}
                            suffix={suffix}
                            value={username}
                            onChange={this.onChangeUserName}
                            ref={node => this.userNameInput = node}
                        />
                        <Input
                            className="password"
                            placeholder="Enter your password"
                            size="large"
                            type="password"
                            prefix={<Icon type="lock" style={{fontSize: 15, color: '#dddd'}}/>}
                            suffix={suffix}
                            value={password}
                            onChange={this.onChangePassword}
                            ref={node => this.userNameInput = node}
                        />
                        <Button className="login-button" onClick={this.attemptSignIn} type="primary">Sign In</Button>
                    </div>
                </div>
            </div>

        )
            ;
    }
}