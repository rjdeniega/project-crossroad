/**
 * Created by JasonDeniega on 30/07/2018.
 */
/**
 * Created by JasonDeniega on 29/07/2018.
 */

import React, { Component, Fragment } from 'react'
import '../../../../utilities/colorsFonts.css'
import './style.css'
import { Button } from 'antd'
import { Icon as AntIcon, Input, Card, Table, DatePicker, Select } from 'antd'
import { getData, postData } from '../../../../network_requests/general'
import { Icon } from 'react-icons-kit'
import { fileTextO } from 'react-icons-kit/fa/fileTextO'
import { money } from 'react-icons-kit/fa/money'
import moment from "moment";
const columns = [{
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
    render: (text) => (
        <div>
            {text}
        </div>
    )
}, {
    title: 'Day',
    dataIndex: 'day',
    key: 'day',
    render: (text) => (
        <div>
            {text}
        </div>
    ),
}, {
    title: 'AM Ticketing count',
    dataIndex: 'am_count',
    key: 'am_count',
    render: (text) => (
        <div>
            {text}
        </div>
    ),
}, {
    title: 'PM Ticketing count',
    dataIndex: 'pm_count',
    key: 'pm_count',
    render: (text) => (
        <div>
            {text}
        </div>
    ),
}, {
    title: 'AM Beep Count',
    dataIndex: 'am_beep',
    key: 'am_beep',
    render: (text) => (
        <div>
            {text}
        </div>
    ),
}, {
    title: 'PM Beep Count',
    dataIndex: 'pm_beep',
    key: 'pm_beep',
    render: (text) => (
        <div>
            {text}
        </div>
    ),
},];
const dateFormat = "YYYY-MM-DD";
const Option = Select.Option;

export class PassengerCount extends Component {
    state = {
        shares: [],
        members: [],
        filtered_shares: []
    };

    componentDidMount() {
        this.fetchShares()
    }

    handleStartDateChange = (date, dateString) => {
        const data = {
            "start_date": dateString
        };
        console.log("entered here");
        postData('/passengers_by_date/', data).then(data => {
            this.setState({
                filtered_transactions: data.report_items,
                am_total: data.am_total,
                pm_total: data.pm_total,
            })
        });
        this.setState({
            start_date: dateString
        });

    };
    handleEndDateChange = (date, dateString) => {
        const data = {
            "start_date": this.state.start_date,
            "end_date": dateString,
        };
        postData('/passengers_by_date/', data).then(data => {
            console.log(data);
            this.setState({
                filtered_transactions: data.report_items,
                am_total: data.am_total,
                pm_total: data.pm_total,
            })
        });
        this.setState({
            end_date: dateString
        });
    };

    fetchShares() {
        getData('/passengers/').then(data => {
            this.setState({
                all_transactions: data.report_items,
                am_total: data.am_total,
                pm_total: data.pm_total,
            }, () => this.setState({
                filtered_transactions: this.state.all_transactions
            }))
        });
    }

    resetFilters = () => {
        this.setState({
            filtered_transactions: this.state.all_transactions,
        }, () => this.setState({
            am_shift_total: this.getShiftTypeTotal("A"),
            pm_shift_total: this.getShiftTypeTotal("P"),
            grand_total: this.getGrandTotal("A")
        }));

    };
    filterBy = fieldName => value => {
        // this function is to handle drop-downs
        const state = { ...this.state };
        state[fieldName] = value;
        this.setState({
            ...state
        });
        const match = this.state.filtered_shares.filter(item => {
            if (item.member.card_number == value) {
                return item
            }
        });
        this.setState({
            filtered_shares: match,
        });

    };

    render() {
        return (
            <div className="shares-report-body">
                <DatePicker placeholder="date from" onChange={this.handleStartDateChange} format={dateFormat}/>
                <DatePicker placeholder="date to" onChange={this.handleEndDateChange} format={dateFormat}/>
                <p> AM Total: {this.state.am_total}</p>
                <p> PM Total: {this.state.pm_total}</p>
                <Table bordered size="medium"
                       pagination={false}
                       className="remittance-table"
                       columns={columns}
                       dataSource={this.state.filtered_transactions}
                />
            </div>
        );
    }
}