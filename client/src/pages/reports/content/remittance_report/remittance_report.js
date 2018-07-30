/**
 * Created by JasonDeniega on 29/07/2018.
 */

import React, { Component, Fragment } from 'react'
import '../../../../utilities/colorsFonts.css'
import './style.css'
import { Button } from 'antd'
import { Icon as AntIcon, Input, Card, Table, DatePicker } from 'antd'
import { getData } from '../../../../network_requests/general'
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
    title: 'Shift Type',
    dataIndex: 'shift_type',
    key: 'shift_type',
    render: (text) => (
        <div className="rem-status">
            {text == "A" &&
            <div className="shift-table-column"><AntIcon type="check-circle" className="status-icon"/> <p>AM</p></div>}
            {text == "P" &&
            <div className="shift-table-column"><AntIcon type="check-circle" className="status-icon"/> <p>PM</p></div>}
            {text == "MN" &&
            <div className="shift-table-column"><AntIcon type="check-circle" className="status-icon"/> <p>MN</p></div>}
        </div>
    ),
}, {
    title: 'Driver',
    dataIndex: 'driver',
    key: 'driver',
    render: (text) => (
        <div>
            {text}
        </div>
    )
},
    {
        title: 'Shuttle',
        dataIndex: 'shuttle',
        key: 'shuttle',
        render: (text) => (
            <div>
                {text}
            </div>
        )
    }, {
        title: 'Ticket Remittance',
        dataIndex: 'total',
        key: 'grand_total',
        render: (text, record) => (
            <div className="rem-status">
                <p><b>Php {text}</b></p>
            </div>
        ),
    }];
const dateFormat = "YYYY-MM-DD";

export class RemittanceReport extends Component {
    state = {
        all_transactions: [],
        transactions: [],
        start_date: null,
        start_date_object: moment('2015/01/01', dateFormat),
        end_date: null,
        end_date_object: moment('2015/01/01', dateFormat),
    };

    componentDidMount() {
        this.fetchTransactions()
    }

    fetchTransactions() {
        getData('/remittance_report/').then(data => {
            console.log(data);
            this.setState({
                all_transactions: data.report_items
            },() => this.setState({
                transactions: this.state.all_transactions
            }))
        })
    }

    handleDateFormChange = (date, dateString) => this.setState({
        birth_date_object: date,
        birth_date: dateString
    });

    handleStartDateChange = (date, dateString) => {
        const match = this.state.all_transactions.filter(item => {
            if(item.date == dateString) return item;
        });
        this.setState({
            transactions: match,
            start_date_object: date,
            start_date: dateString
        })
    };
    handleEndDateChange = (date, dateString) => {
        const match = this.state.all_transactions.filter(item => {
            let start_date = this.state.start_date;
            let end_date = dateString;
            let item_date = item.date;
            
            console.log(item_date, start_date, end_date);
            if(moment(item_date).isAfter(start_date)|| moment(item_date).isSame(start_date) &&
                    moment(item_date).isBefore(end_date)|| moment(item_date).isSame(end_date)
            ){
                return item;
            }
        });
        this.setState({
            transactions: match
        })
    };
    render() {
        return (
            <div className="report-body">
                <div className="report-filters">
                    <DatePicker placeholder="date from" onChange={this.handleStartDateChange} format={dateFormat}/>
                    <DatePicker placeholder="date to" onChange={this.handleEndDateChange} format={dateFormat}/>


                </div>
                <Table bordered size="medium"
                       className="remittance-table"
                       columns={columns}
                       dataSource={this.state.transactions}
                />
            </div>
        );
    }
}