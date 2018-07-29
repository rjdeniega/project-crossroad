/**
 * Created by JasonDeniega on 29/07/2018.
 */
import '../../utilities/colorsFonts.css'
import React, { Component, Fragment } from 'react'
import '../../utilities/colorsFonts.css'
import './style.css'
import { Button } from 'antd'
import { Icon as AntIcon, Input } from 'antd'
import { Icon } from 'react-icons-kit'
import { UserAvatar } from '../../components/avatar/avatar'
import { postData } from '../../network_requests/general'
import crossroad_logo from '../../images/crossroad_logo.png'
import { RemittancePage } from '../../pages/remittances/remittances'
import { InventoryPage } from '../../pages/inventory/inventory'
import {fileTextO} from 'react-icons-kit/fa/fileTextO'


export class ReportsPage extends Component {
    renderHeader = () => (
        <div className="reports-header">
            <div className="header-text">
                <Icon className="page-icon" icon={fileTextO} size={42}/>
                <div className="page-title"> Reports</div>
                <div className="rem-page-description"> Analyze information</div>
            </div>
            <UserAvatar/>
        </div>
    );

    render() {
        return (
            <div className="body-wrapper">
                <div className="reports-page-wrapper">
                    {this.renderHeader()}
                </div>
            </div>
        );
    }
}