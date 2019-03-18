/**
 * Created by JasonDeniega on 25/06/2018.
 */
import '../../utilities/colorsFonts.css'
import React, {Component} from 'react'
import '../../utilities/colorsFonts.css'
import './style.css'
import {Button} from 'antd'
import {Icon, Input} from 'antd'
import {postData} from '../../network_requests/general'
import crossroad_logo from '../../images/crossroad_logo.png'
import LBATSCLogo from '../../images/LBATSCLogo.png'
import {RemittancePage} from '../../pages/remittances/remittances'
import {InventoryPage} from '../../pages/inventory/inventory'

const CLERK_PAGES = [<RemittancePage/>,<InventoryPage/>];
export class SignInPage extends Component {
    constructor(props) {
        super(props);
        //the page initially has blank username and pw
        this.state = {
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
        console.log(e.target.value)
        e.preventDefault();
        this.setState({username: e.target.value});
    };
    onChangePassword = (e) => {
        e.preventDefault();
        this.setState({password: e.target.value});
    };

    render() {
        //same as const username = this.state.username and const password = this.state password
        const {username, password} = this.state;
        //if there's a username put an icon; otherwise null
        const suffix = username ? <Icon type="close-circle" onClick={this.emitEmpty}/> : null;
        return (
            <div className="sign-in-body">
                <div className="content-section">
                    <div className="sign-in-logos">
                        <img className="lbatsc-logo" src={LBATSCLogo}/>
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
                        />
                        {/*note : important to pass lambdas if it has paramters*/}
                        {/*actual sign in is performed in app.js*/}
                        <Button className="login-button" onClick={() => this.props.attemptSignIn(this.state.username,this.state.password)} type="primary">Sign In</Button>
                    </div>
                </div>
            </div>

        )
            ;
    }
}