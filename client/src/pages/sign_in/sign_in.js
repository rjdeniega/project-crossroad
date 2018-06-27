/**
 * Created by JasonDeniega on 25/06/2018.
 */
import logo from '../../images/crossroad_logo.png'
import '../../utilities/colorsFonts.css'
import React, {Component} from 'react'
import './style.css'
import {Button} from 'antd'
import {Icon, Input} from 'antd'
import '../../network_requests/'
import crossroad_logo from '../../images/crossroad_logo.png'


export class SignInPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: ''
        };
    }

    emitEmpty = () => {
        this.userNameInput.focus();
        this.setState({username: ''});
    };
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
        fetch('/sign-in', {
            body: JSON.stringify(data), // must match 'Content-Type' header
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, same-origin, *omit
            headers: {
                'user-agent': 'Mozilla/4.0 MDN Example',
                'content-type': 'application/json'
            },
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // *client, no-referrer
        })
            .then(response => response.json)
            .then(data => console.log('data is', data))
            .catch(error => console.log('error is', error));

    };

    render() {
        //same as const username = this.state.username and const password = this.state password
        const {username, password} = this.state;
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