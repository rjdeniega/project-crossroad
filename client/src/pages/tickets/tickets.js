/**
 * Created by JasonDeniega on 11/10/2018.
 */

import React, { Component } from 'react';
import logo from '../../images/crossroad_logo.png'
import colors from '../../utilities/colorsFonts.css'
import { Icon } from 'react-icons-kit'
import { groupOutline } from 'react-icons-kit/typicons/groupOutline'
import { users } from 'react-icons-kit/feather/'
import { Table, Button, Avatar, List, Tag, Tabs, TimePicker } from 'antd'
import './style.css'
import { money } from 'react-icons-kit/fa/money'
import { UserAvatar } from "../../components/avatar/avatar"
import { ic_receipt } from 'react-icons-kit/md/ic_receipt'
import { getData } from "../../network_requests/general";

const dataSource = [{
    key: '1',
    name: 'Mike',
    date: '10/11/14',
    range_from: '10101',
    range_to: '20202'
}, {
    key: '2',
    name: 'Mike',
    date: '10/11/14',
    range_from: '10101',
    range_to: '20202'
}];

const columns = [{
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
}, {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
}, {
    title: 'Range from',
    dataIndex: 'range_from',
    key: 'range_from',
}, {
    title: 'Range to',
    dataIndex: 'range_to',
    key: 'range_to',
}];
export class TicketsPage extends Component {
    componentDidMount() {
        this.fetchTicketHistory();
    }

    fetchTicketHistory(){
        getData('/remittances/tickets/').then(data => {
            console.log(data);
            if (!data.error) {
                console.log(data);
            }
            else {
                console.log(data);
            }
        }).catch(error => console.log(error.message))
    }

    render() {
        return (
            <div className="body-wrapper">
                <div className="tickets-page-wrapper">
                    <div className="driver-remittance-header">
                        <div className="header-text">
                            <Icon className="page-icon" icon={ic_receipt} size={42}/>
                            <div className="page-title"> Tickets</div>
                            <div className="rem-page-description"> Assign and Monitor Tickets</div>
                        </div>
                        <UserAvatar/>
                    </div>
                    <div className="ticket-panels-wrapper">
                        <div className="driver-ticket-list">
                            remaining tickets
                        </div>
                        <div className="tickets-panel">
                            <Table bordered size="medium"
                                   className="tickets-table"
                                   columns={columns}
                                   dataSource={dataSource}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}