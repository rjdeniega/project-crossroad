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
const dateFormat = "YYYY-MM-DD";
const Option = Select.Option;

export class TransactionReport extends Component {
    state = {
        all_transactions: [],
        filtered_transactions: [],
        start_date: null,
        start_date_object: moment('2015/01/01', dateFormat),
        end_date: null,
        end_date_object: moment('2015/01/01', dateFormat),
    };
    columns = [{
        title: 'Name',
        dataIndex: 'member.name',
        key: 'member.name',
        render: (text) => (
            <div>
                {text}
            </div>
        )
    }, {
        title: 'Beep Transactions',
        dataIndex: 'no_of_transactions',
        key: 'no_of_transactions',
        render: (text, record) => (
            <div>
                {"Php " + this.getNumberOfBeepTransactions(record.member.id)}
            </div>
        ),
    },
        {
            title: 'Carwash Transactions',
            dataIndex: 'no_of_transactions',
            key: 'no_of_transactions',
            render: (text, record) => (
                <div>
                    {"Php " + this.getNumberOfCarwashTransactions(record.member.id)}
                </div>
            ),
        },
        {
            title: 'Transactions Total',
            dataIndex: 'total_transactions',
            key: 'total_transactions',
            render: (text, record) => (
                <div className="rem-status">
                    <p><b>Php {this.getGrandTotal(record.member.id)}</b></p>
                </div>
            ),
        },];

    componentDidMount() {
        this.fetchTransactions()
    }

    getNumberOfBeepTransactions = (id) => {
        const array = this.state.all_transactions.filter(item => item.member.id == id).map(item => item.beep_transactions);
        // const checker = array.filter(item => item != null);
        // console.log(checker);
        // console.log(checker[0]);
        const values = array[0].map(item => item.total);
        return parseInt(values.reduce((a, b) => a + b, 0));
    };
    getNumberOfCarwashTransactions = (id) => {
        const array = this.state.all_transactions.filter(item => item.member.id == id).map(item => item.carwash_transactions);
        // const checker = array.filter(item => item != null);
        // console.log(checker);
        // console.log(checker[0]);
        const values = array[0].map(item => item.total);
        return parseInt(values.reduce((a, b) => a + b, 0));
    };
    getGrandTotal = (id) => {
        let beep = this.getNumberOfBeepTransactions(id);
        let carwash = this.getNumberOfCarwashTransactions(id);
        return parseInt(beep + carwash)
    };
    getShiftTypeTotal = (type) => {
        const array = this.state.filtered_transactions.filter(item => item.shift_type == type).map(item => item.total);
        return array.reduce((a, b) => a + b, 0)
    };

    fetchTransactions() {
        getData('/transaction_report/').then(data => {
            console.log(data.report_items);
            this.setState({
                all_transactions: data.report_items,
            }), this.setState({
                filtered_transactions: this.state.all_transactions,
            })
        });

    }

    handleStartDateChange = (date, dateString) => {
        const data = {
            "start_date": dateString
        };

        postData('/transaction_report_by_date/', data).then(data => {
            this.setState({
                all_transactions: data.report_items
            })
        });
        this.setState({
            start_date: dateString
        });

    };
    handleEndDateChange = (date, dateString) => {
        const data = {
            "start_date": this.state.start_date,
            "end_date": this.state.end_date,
        };
        postData('/transaction_report_by_date/', data).then(data => {
            this.setState({
                all_transactions: data.report_items
            })
        })
    };
    resetFilters = () => {
        this.setState({
            filtered_transactions: this.state.all_transactions,
        }, () => this.setState({
            am_shift_total: this.getShiftTypeTotal("A"),
            pm_shift_total: this.getShiftTypeTotal("P"),
            grand_total: this.getGrandTotal("A")
        }));

    };

    render() {
        return (
            <div className="transaction-report-body">
                {/*<div className="report-filters">*/}
                {/*<DatePicker placeholder="date from" onChange={this.handleStartDateChange} format={dateFormat}/>*/}
                {/*<DatePicker placeholder="date to" onChange={this.handleEndDateChange} format={dateFormat}/>*/}
                {/*</div>*/}
                <DatePicker placeholder="date from" onChange={this.handleStartDateChange} format={dateFormat}/>
                <DatePicker placeholder="date to" onChange={this.handleEndDateChange} format={dateFormat}/>
                <Table bordered size="small"
                       pagination={false}
                       className="remittance-table"
                       columns={this.columns}
                       dataSource={this.state.filtered_transactions}
                />
            </div>
        );
    }
}