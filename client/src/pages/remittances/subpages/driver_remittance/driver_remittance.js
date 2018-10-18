/**
 * Created by JasonDeniega on 04/07/2018.
 */
/**
 * Created by JasonDeniega on 27/06/2018.
 */

import React, { Component } from 'react';
import { Icon } from 'react-icons-kit'
import { groupOutline } from 'react-icons-kit/typicons/groupOutline'
import { users } from 'react-icons-kit/feather/'
import { u1F46E } from 'react-icons-kit/noto_emoji_regular/u1F46E'
import { driversLicenseO } from 'react-icons-kit/fa/driversLicenseO'
import { cube } from 'react-icons-kit/fa/cube'
import { UserAvatar } from "../../../../components/avatar/avatar"
import { Avatar, List, Radio, Tabs, Steps, Button, InputNumber, Divider, Input, Modal, message } from 'antd'
import { DatePicker } from 'antd';
import { money } from 'react-icons-kit/fa/money'
import './style.css'
import { RemittanceForm } from "../../components/remittance_form/remittance_form"
import { getData } from "../../../../network_requests/general"
import { clockO } from 'react-icons-kit/fa/clockO'
import { data } from '../../../users/users'
import emptyStateImage from '../../../../images/empty_state_construction.png'

const TabPane = Tabs.TabPane;
const Step = Steps.Step;
const ButtonGroup = Button.Group;

export class DriverRemittancePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 0,
            ten_peso_start_first: null,
            twelve_peso_start_first: null,
            fifteen_peso_start_first: null,
            ten_peso_start_second: null,
            twelve_peso_start_second: null,
            fifteen_peso_start_second: null,
            ten_peso_end_first: null,
            twelve_peso_end_first: null,
            fifteen_peso_end_first: null,
            ten_peso_end_second: null,
            twelve_peso_end_second: null,
            fifteen_peso_end_second: null,
            ten_peso_first_id: null,
            ten_peso_second_id: null,
            twelve_peso_first_id: null,
            twelve_peso_second_id: null,
            fifteen_peso_first_id: null,
            fifteen_peso_second_id: null,
            deployment_id: null
        };
    }

    componentDidMount() {
        this.fetchRemittanceData();
    }

    fetchRemittanceData = () => {
        const { id } = JSON.parse(localStorage.user_staff);
        getData('/remittances/remittance_form/driver/' + id).then(data => {
            console.log(data);
            console.log(data.assigned_tickets[0]["range_to"]);
            if (!data.error) {
                this.setState({
                    ten_peso_start_first: data.assigned_tickets[0]["range_from"],
                    ten_peso_start_second: data.assigned_tickets[1]["range_from"] ?  data.assigned_tickets[1]["range_from"] : null,
                    twelve_peso_start_first: data.assigned_tickets[2]["range_from"] ,
                    twelve_peso_start_second: data.assigned_tickets[3]["range_from"] ? data.assigned_tickets[3]["range_from"] : null,
                    fifteen_peso_start_first: data.assigned_tickets[4]["range_from"] ,
                    fifteen_peso_start_second: data.assigned_tickets[5]["range_from"]  ? data.assigned_tickets[5]["range_from"] : null,
                    ten_peso_end_first: data.assigned_tickets[0]["range_to"],
                    ten_peso_end_second: data.assigned_tickets[1]["range_to"] ? data.assigned_tickets[1]["range_to"] : null,
                    twelve_peso_end_first: data.assigned_tickets[2]["range_to"],
                    twelve_peso_end_second: data.assigned_tickets[3]["range_to"] ? data.assigned_tickets[3]["range_to"] : null,
                    fifteen_peso_end_first: data.assigned_tickets[4]["range_to"],
                    fifteen_peso_end_second: data.assigned_tickets[5]["range_to"] ? data.assigned_tickets[5]["range_to"] : null,
                    ten_peso_first_id: data.assigned_tickets[0]["ticket_id"],
                    ten_peso_second_id: data.assigned_tickets[1]["ticket_id"],
                    twelve_peso_first_id: data.assigned_tickets[2]["ticket_id"],
                    twelve_peso_second_id: data.assigned_tickets[3]["ticket_id"],
                    fifteen_peso_first_id: data.assigned_tickets[4]["ticket_id"],
                    fifteen_peso_second_id: data.assigned_tickets[5]["ticket_id"],
                    deployment_id: data.deployment_details.id
                }, () => console.log(this.state.ten_peso_start_first))
            }
            else {
                console.log(data);
            }
        }).catch(error => console.log(error))
    };

    render() {
        return (
            <div className="remittance-page-body">
                <div className="driver-remittance-header">
                    <div className="header-text">
                        <Icon className="page-icon" icon={money} size={42}/>
                        <div className="page-title"> Remittances</div>
                        <div className="rem-page-description"> Create Remittance Forms</div>
                    </div>
                    <UserAvatar/>
                </div>
                <div className="driver-rem-content">
                    <div className="dv-transactions">
                        {/*<Divider orientation="left">Create Remittance Form</Divider>*/}
                        <RemittanceForm {...this.state}/>
                    </div>
                    {/*<div className="dv-pending-requests">*/}
                    {/*<Divider orientation="left">Pending Requests</Divider>*/}
                    {/*<img className="empty-image" src={emptyStateImage}/>*/}
                    {/*<p>Under Construction</p>*/}
                    {/*</div>*/}
                    {/*<div className="dv-history">*/}
                    {/*<Divider orientation="left">My Remittances</Divider>*/}
                    {/*<img className="empty-image" src={emptyStateImage}/>*/}
                    {/*<p>Under Construction</p>*/}
                    {/*</div>*/}
                </div>
            </div>
        );
    }
}
