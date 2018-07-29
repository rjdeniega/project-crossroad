/**
 * Created by JasonDeniega on 29/07/2018.
 */
import '../../utilities/colorsFonts.css'
import React, { Component, Fragment } from 'react'
import '../../utilities/colorsFonts.css'
import './style.css'
import { Button } from 'antd'
import { Icon as AntIcon, Input, Card, Modal } from 'antd'
import { Icon } from 'react-icons-kit'
import { UserAvatar } from '../../components/avatar/avatar'
import { postData } from '../../network_requests/general'
import crossroad_logo from '../../images/crossroad_logo.png'
import { RemittancePage } from '../../pages/remittances/remittances'
import { InventoryPage } from '../../pages/inventory/inventory'
import { fileTextO } from 'react-icons-kit/fa/fileTextO'
import { money } from 'react-icons-kit/fa/money'
import { RemittanceReport } from './content/remittance_report/remittance_report'


const { Meta } = Card;
const CARDS = [{
    'title': 'Remittance Report',
    'description': 'view remittances for a time period',
    'icon': money,
    'content': <RemittanceReport/>
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
    renderCards = () => CARDS.map(item =>
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
                        {this.renderCards()}
                    </div>
                </div>
            </div>
        );
    }
}