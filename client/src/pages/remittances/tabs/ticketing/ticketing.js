/**
 * Created by JasonDeniega on 02/07/2018.
 */
import React, { Component } from 'react';
import './style.css'
import emptyStateImage from '../../../../images/empty_state_construction.png'
import { RemittanceList } from '../../components/remittance_list/remittance_list'
import { List, Table, Divider, Button, Avatar, Icon } from 'antd'
import { eye } from 'react-icons-kit/fa/eye'

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
    dataIndex: 'date',
    key: 'date',
    render: (text) => (
        <div>
            <p>{text}</p>
        </div>
    )
}, {
    title: 'Shift Type',
    dataIndex: 'shift_type',
    key: 'shift_type',
    render: (text) => (
        <div className="rem-status">
            <Icon type="check-circle" className="status-icon"/>{text}
        </div>
    ),
}, {
    title: 'Total Remittances',
    dataIndex: 'total_remittance',
    key: 'total_remittance',
    render: (text) => (
        <div className="rem-status">
            <p><b>Php 1000</b></p>
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

const data = [{
    date: '2013/11/10',
    shift_type: 'AM',
    age: 32,
    address: 'Completed',
}, {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'Completed',
}, {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Completed',
}, {
    key: '4',
    name: 'Joe Black',
    age: 32,
    address: 'Completed',
}, {
    key: '5',
    name: 'Joe Black',
    age: 32,
    address: 'Completed',
}];
export class TicketingPane extends Component {


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
                <Table bordered size="medium" className="remittance-table" columns={columns} dataSource={data}/>
            </div>
        );
    }
}