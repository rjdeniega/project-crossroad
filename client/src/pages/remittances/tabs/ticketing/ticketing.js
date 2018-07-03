/**
 * Created by JasonDeniega on 02/07/2018.
 */
import React, {Component} from 'react';
import './style.css'
import emptyStateImage from '../../../../images/empty_state_construction.png'
import {RemittanceList} from '../../components/remittance_list/remittance_list'
import {List, Table, Divider, Button, Avatar, Icon} from 'antd'
import {eye} from 'react-icons-kit/fa/eye'

const columns = [{
    title: 'Supervisor',
    dataIndex: 'name',
    key: 'name',
    render: (text, record) => (
        <div>
            <Avatar size="large" className="table-avatar"
                    src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"/>
            <b className="name">{text}</b>
        </div>
    ),
}, {
    title: 'Deployed Drivers',
    dataIndex: 'age',
    key: 'age',
}, {
    title: 'Status',
    dataIndex: 'address',
    key: 'address',
    render: (text) => (
        <div className="rem-status">
            <Icon type="check-circle" className="status-icon"/>{text}
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
    key: '1',
    name: 'John Brown',
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
},{
    key: '4',
    name: 'Joe Black',
    age: 32,
    address: 'Completed',
},{
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
                    <Divider orientation="left">Left Text</Divider>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista
                        probare, quae sunt a te dicta? Refert tamen, quo modo.</p>
                </div>
                <Table bordered size="medium" className="remittance-table" columns={columns} dataSource={data}/>
            </div>
        );
    }
}