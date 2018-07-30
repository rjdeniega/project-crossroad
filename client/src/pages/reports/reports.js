/**
 * Created by JasonDeniega on 29/07/2018.
 */
import '../../utilities/colorsFonts.css'
import React, { Component, Fragment } from 'react'
import '../../utilities/colorsFonts.css'
import './style.css'
import { Button } from 'antd'
import { Icon as AntIcon, Input, Card, Modal, Divider } from 'antd'
import { Icon } from 'react-icons-kit'
import { UserAvatar } from '../../components/avatar/avatar'
import { postData } from '../../network_requests/general'
import crossroad_logo from '../../images/crossroad_logo.png'
import { RemittancePage } from '../../pages/remittances/remittances'
import { InventoryPage } from '../../pages/inventory/inventory'
import { fileTextO } from 'react-icons-kit/fa/fileTextO'
import { money } from 'react-icons-kit/fa/money'
import {wrench} from 'react-icons-kit/fa/wrench'
import { driversLicenseO } from "react-icons-kit/fa/driversLicenseO";
import { RemittanceReport } from './content/remittance_report/remittance_report'
import { SharesReport } from './content/shares_report/shares_report'



const { Meta } = Card;
const REMITTANCE_CARDS = [{
    'title': 'Remittance Report',
    'description': 'view remittances for a time period',
    'icon': money,
    'content': <RemittanceReport/>
}];
const MAINTENANCE_CARDS = [{
    'title': 'Maintenance Report',
    'description': 'view maintenance cost per shuttle',
    'icon': wrench,
    'content': <RemittanceReport/>
}];
const MEMBER_CARDS = [{
    'title': 'Member Report',
    'description': 'View Shares per Member',
    'icon': driversLicenseO,
    'content': <SharesReport/>
}];
export class ReportsPage extends Component {
    state = {
        content: null,
        visible: false,
        modalTitle: null,
    };
    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    handleOk = (e) => {
        console.log(e);
        this.setState({
            visible: false,
        });
    };

    handleCancel = (e) => {
        console.log(e);
        this.setState({
            visible: false,
        });
    };
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
    changeModalContent = (content, title) => event => {
        this.setState({
            content: content,
            modalTitle: title
        }, this.showModal())
    };
    renderRemittanceCards = () => REMITTANCE_CARDS.map(item =>
        <Card
            className="report-item"
            onClick={this.changeModalContent(item.content, item.title)}
            hoverable
            style={{ width: 240 }}
            cover={<div style={{ color: 'var(--darkgreen)' }}><Icon icon={item.icon} size={42}/></div>}
        >
            <Meta
                title={item.title}
                description={item.description}
            />
        </Card>
    );
    renderMaintenanceCards = () => MAINTENANCE_CARDS.map(item =>
        <Card
            className="report-item"
            onClick={this.changeModalContent(item.content, item.title)}
            hoverable
            style={{ width: 240 }}
            cover={<div style={{ color: 'var(--darkgreen)' }}><Icon icon={item.icon} size={42}/></div>}
        >
            <Meta
                title={item.title}
                description={item.description}
            />
        </Card>
    );
    renderMemberCards = () => MEMBER_CARDS.map(item =>
        <Card
            className="report-item"
            onClick={this.changeModalContent(item.content, item.title)}
            hoverable
            style={{ width: 240 }}
            cover={<div style={{ color: 'var(--darkgreen)' }}><Icon icon={item.icon} size={42}/></div>}
        >
            <Meta
                title={item.title}
                description={item.description}
            />
        </Card>
    );
    renderModal = () => (
        <Modal
            className="report-modal"
            title={this.state.modalTitle}
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
        >
            {this.state.content}
        </Modal>
    );

    render() {
        return (
            <div className="body-wrapper">
                {this.renderModal()}
                <div className="reports-page-wrapper">
                    {this.renderHeader()}
                    <div className="reports-content">
                        <div className="remittance-reports">
                            <Divider>Remittance Reports</Divider>
                            {this.renderRemittanceCards()}
                        </div>
                        <div className="maintenance-reports">
                            <Divider>Maintenance Reports</Divider>
                            {this.renderMaintenanceCards()}
                        </div>
                        <div className="member-reports">
                            <Divider>Member Reports</Divider>
                            {this.renderMemberCards()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}