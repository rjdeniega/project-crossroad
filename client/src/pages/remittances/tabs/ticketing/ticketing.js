/**
 * Created by JasonDeniega on 02/07/2018.
 */
import React, { Component } from 'react';
import './style.css'
import emptyStateImage from '../../../../images/empty_state_construction.png'
import { RemittanceList } from '../../components/remittance_list/remittance_list'
import { List, Table, Divider, Button, Avatar, Icon } from 'antd'
import { eye } from 'react-icons-kit/fa/eye'
import { getData } from '../../../../network_requests/general'

const ButtonGroup = Button.Group;
// {
//     title: 'Supervisor',
//     dataIndex: 'name',
//     key: 'name',
//     render: (text, record) => (
//         <div>
//             <Avatar size="large" className="table-avatar"
//                     src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"/>
//             <b className="name">{text}</b>
//         </div>
//     ),
// },
const columns = [{
    title: 'Date',
    dataIndex: 'date_of_iteration',
    key: 'date_of_iteration',
    render: (text) => (
        <div>
            {text}
        </div>
    )
}, {
    title: 'Shift Type',
    dataIndex: 'shift_type',
    key: 'shift_type',
    render: (text) => (
        <div className="rem-status">
            {text == "A" &&
            <div className="shift-table-column"><Icon type="check-circle" className="status-icon"/> <p>AM</p></div>}
            {text == "P" &&
            <div className="shift-table-column"><Icon type="check-circle" className="status-icon"/> <p>PM</p></div>}
            {text == "MN" &&
            <div className="shift-table-column"><Icon type="check-circle" className="status-icon"/> <p>MN</p></div>}
        </div>
    ),
}, {
    title: 'Total Remittances',
    dataIndex: 'grand_total',
    key: 'grand_total',
    render: (text) => (
        <div className="rem-status">
            <p><b>Php {text}</b></p>
        </div>
    ),
}, {
    title: 'Action',
    key: 'action',
    render: (text, record) => (
        <Button className="view-button" type="ghost" icon="eye">
            View Report
        </Button>
    ),
}];

export class TicketingPane extends Component {
    state = {
        shifts: []
    };

    componentDidMount() {
        getData('remittances/reports/shift_iterations/').then(data => {
            if (!data.errors) {
                console.log(data);
                this.setState({
                    shifts: data.shift_iterations
                })
            }
        }).catch(error => console.log(error))
    }

    fetchShiftData = (details) => {
        console.log(details)
    };

    render() {
        return (
            <div className="ticketing-tab-body">
                <div className="filters">
                    <ButtonGroup>
                        <Button type="primary" className="shift-type">AM</Button>
                        <Button className="shift-type">PM</Button>
                        <Button className="shift-type">Midnight</Button>
                    </ButtonGroup>
                    <Divider orientation="left">Filters</Divider>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista
                        probare, quae sunt a te dicta? Refert tamen, quo modo.</p>
                </div>
                <Table bordered size="medium"
                       className="remittance-table"
                       columns={columns}
                       dataSource={this.state.shifts}
                       onRow={(record) => {
                           return {
                               onClick: () => {
                                   console.log(record.shift_iteration.id);
                                   this.fetchShiftData(record.details);
                               },       // click row
                           };
                       }}
                />
            </div>
        );
    }
}