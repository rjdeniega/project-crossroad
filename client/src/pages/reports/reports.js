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
import { RemittanceSummaryRoute} from './content/remittance_summary_route/remittance_summary_route'
import { PeakHours } from './content/peak_hours/peak_hours'
import { SharesReport } from './content/shares_report/shares_report'
import { TransactionReport } from './content/transactions_report/transactions_report'
import { RemittanceSummary } from './content/remittance_summary/remittance_summary'
import { RemittanceChart} from './content/remittance_chart/remittance_chart'
import { RemittancePerYear} from './content/remittance_per_year/remittance_per_year'
import { TicketReport } from './content/ticket_reports/ticket_reports'
import { TicketShuttleBreakdown } from './content/ticket_breakdown_shuttle/ticket_breakdown_shuttle'
import { WeeklySupervisorReport } from './content/weekly_supervisor_report/weekly_supervisor_report'
import { PassengerCount } from './content/passenger_count/passenger_count'
import {MaintenanceReport  } from './content/maintenance_report/maintenance_report'
import {SharesAccumulationReport  } from './content/shares_accumulation/shares_accumulation'
import {ShuttleIncome  } from './content/shuttle_income/shuttle_income'
import {TicketPerDay } from './content/ticket_per_day/ticket_per_day'
import {MemberTransactions} from './content/member_transactions/member_transactions'
import {BeepTickets} from './content/beep_tickets/beep_tickets'
import {PatronageRefund} from './content/patronage_refund/patronage_refund'
import {ShuttleValueChart} from './content/shuttle_value_chart/shuttle_value_chart'
import {TicketStack} from './content/ticket_stack/ticket_stack'
import {InventoryReport} from './content/inventory_report/inventory_report'
import {ItemMovementReport} from './content/item_movement/inventory_movement'
import { PassengerPerRoute } from './content/passenger_per_route/passenger_per_route';
import { DriverPerformance } from './content/driver_performance/driver_performance';





const { Meta } = Card;
const REMITTANCE_CARDS = [{
    'title': 'Remittance Report',
    'description': 'view beep and ticketing passenger count',
    'icon': money,
    'content': <RemittanceSummary/>
},{
    'title': 'Supervisor Report',
    'description': 'view beep and ticketing passenger count',
    'icon': money,
    'content': <WeeklySupervisorReport/>
},{
    'title': 'Remittance Per Route',
    'description': 'view remittances per route',
    'icon': money,
    'content': <RemittanceSummaryRoute/>
},{
    'title': 'Remittance Per Year',
    'description': 'view monthly remittances per year',
    'icon': money,
    'content': <RemittancePerYear/>
},{
    'title': 'Driver Remittance & Payables',
    'description': 'view driver deployment information',
    'icon': money,
    'content': <DriverPerformance/>
},{
    'title': 'Tickets Report',
    'description': 'view beep and ticketing passenger count',
    'icon': money,
    'content': <TicketReport/>
},{
    'title': 'Ticket Per Day',
    'description': 'view beep and ticketing passenger count',
    'icon': money,
    'content': <TicketPerDay/>
},{
    'title': 'Beep + Tickets',
    'description': 'view beep and ticketing passenger count',
    'icon': money,
    'content': <BeepTickets/>
},{
    'title': 'Remittance Trend',
    'description': 'view beep and ticketing passenger count',
    'icon': money,
    'content': <RemittanceChart/>
},{
    'title': 'Passenger Per Route',
    'description': 'view the remittance per route comparison',
    'icon': money,
    'content': <PassengerPerRoute />
},{
    'title': 'Peak Hours',
    'description': 'view peak hours for beep transactions',
    'icon': money,
    'content': <PeakHours />
},{
    'title': 'Ticket chart per week',
    'description': 'view beep and ticketing passenger count',
    'icon': money,
    'content': <TicketStack/>
},];


const MAINTENANCE_CARDS = [{
    'title': 'Maintenance Report',
    'description': 'view maintenance cost per shuttle',
    'icon': wrench,
    'content': <MaintenanceReport/>
},{
    'title': 'Shuttle Net Value',
    'description': 'view accumulated value of shuttle',
    'icon': wrench,
    'content': <ShuttleIncome/>
},{
    'title': 'Revenue & Cost per Shuttle',
    'description': 'view maintenance cost per shuttle',
    'icon': wrench,
    'content': <ShuttleValueChart/>
},{
    'title': 'Item Movement Report',
    'description': 'view maintenance cost per shuttle',
    'icon': wrench,
    'content': <ItemMovementReport/>
}];
const MEMBER_CARDS = [{
    'title': 'Shares Report',
    'description': 'View Shares of every member of the transport cooperative',
    'icon': driversLicenseO,
    'content': <SharesReport/>
},
{
    'title': 'Transaction Queries',
    'description': 'View transactions of members over a period of time',
    'icon': driversLicenseO,
    'content': <TransactionReport/>
},{
    'title': 'Shares Accumulation Report',
    'description': 'View transactions of members over a period of time',
    'icon': driversLicenseO,
    'content': <SharesAccumulationReport/>
},{
    'title': 'Member Transactions',
    'description': 'View transactions of members over a period of time',
    'icon': driversLicenseO,
    'content': <MemberTransactions/>
},{
    'title': 'Patronage Refund',
    'description': 'View transactions of members over a period of time',
    'icon': driversLicenseO,
    'content': <PatronageRefund/>
},];
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
            style={{ width: 240, marginBottom: 20 }}
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
