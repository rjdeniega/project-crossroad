/**
 * Created by JasonDeniega on 25/06/2018.
 */
import logo from '../../images/crossroad_logo.png'
import '../../utilities/colorsFonts.css'
import React, {Component} from 'react'
import './style.css'
import {Button} from 'antd'
import {Icon, Input} from 'antd'
import crossroad_logo from '../../images/crossroad_logo.png'


export class SignInPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: '',
        };
    }

    emitEmpty = () => {
        this.userNameInput.focus();
        this.setState({userName: ''});
    };
    onChangeUserName = (e) => {
        this.setState({userName: e.target.value});
    };

    render() {
        const {userName} = this.state;
        const suffix = userName ? <Icon type="close-circle" onClick={this.emitEmpty}/> : null;
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
                            value={userName}
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
                            value={userName}
                            onChange={this.onChangeUserName}
                            ref={node => this.userNameInput = node}
                        />
                        <Button className="login-button" type="primary">Sign In</Button>
                    </div>
                </div>
                {/*<div className="form-section">*/}
                {/*</div>*/}
            </div>

        )
            ;
    }
}