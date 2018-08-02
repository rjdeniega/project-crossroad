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
    title: 'Name',
    dataIndex: 'member.name',
    key: 'mamber.name',
    render: (text) => (
        <div>
            {text}
        </div>
    )
}, {
    title: 'Shares',
    dataIndex: 'total_shares',
    key: 'total_shares',
    render: (text) => (
        <div>
            {text}
        </div>
    ),
}, {
    title: 'Share Value (in Php)',
    dataIndex: 'total_peso_value',
    key: 'total_peso_value',
    render: (text) => (
        <div className="rem-status">
            <p><b>Php {text}</b></p>
        </div>
    )
},];
const dateFormat = "YYYY-MM-DD";
const Option = Select.Option;

export class SharesReport extends Component {
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

        postData('/shares_by_date/', data).then(data => {
            console.log(data);
            this.setState({
                filtered_shares: data.report_items,
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
        postData('/shares_by_date/', data).then(data => {
            this.setState({
                filtered_shares: data.report_items
            })
        })
    };

    fetchShares() {
        getData('/shares_report/').then(data => {
            console.log(data);
            this.setState({
                shares: data.report_items,
            }, () => this.setState({
                filtered_shares: this.state.shares
            }))
        });
        getData('/members/').then(data => {
            console.log(data.members);
            this.setState({
                members: data.members,
            })
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
                <Select onSelect={this.filterBy("member")} className="user-input" defaultValue="Select Member">
                    {this.state.members.map(item => (
                        <Option value={item.card_number}>{item.name + " - " + item.card_number}</Option>
                    ))}
                </Select>
                <Table bordered size="medium"
                       pagination={false}
                       className="remittance-table"
                       columns={columns}
                       dataSource={this.state.filtered_shares}
                />
            </div>
        );
    }
}