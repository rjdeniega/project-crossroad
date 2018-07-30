/**
 * Created by JasonDeniega on 29/07/2018.
 */

import React, { Component, Fragment } from 'react'
import '../../../../utilities/colorsFonts.css'
import './style.css'
import { Button } from 'antd'
import { Icon as AntIcon, Input, Card, Table, DatePicker, Select } from 'antd'
import { getData } from '../../../../network_requests/general'
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
        title: 'Number of Transactions',
        dataIndex: 'no_of_transactions',
        key: 'no_of_transactions',
        render: (text, record) => (
            <div>
                {this.getNumberOfTransactions(record.member.id)}
            </div>
        ),
    },
        {
            title: 'Transaction Cost',
            dataIndex: 'total_transactions',
            key: 'total_transactions',
            render: (text) => (
                <div className="rem-status">
                    <p><b>Php {text}</b></p>
                </div>
            ),
        },];

    componentDidMount() {
        this.fetchTransactions()
    }

    getNumberOfTransactions = (id) => {
        const array = this.state.all_transactions.filter(item => item.member.id == id).map(item => item.transactions);
        const checker = array.filter(item => item!=null);
        console.log(checker);
        return checker.length
    };
    getGrandTotal = () => {
        console.log("enters here");
        const array = this.state.filtered_transactions.map(item => {
            return item.total
        });
        return array.reduce((a, b) => a + b, 0)
    };
    getShiftTypeTotal = (type) => {
        const array = this.state.filtered_transactions.filter(item => item.shift_type == type).map(item => item.total);
        return array.reduce((a, b) => a + b, 0)
    };

    fetchTransactions() {
        console.log("entered transactions");
        getData('/transaction_report/').then(data => {
            this.setState({
                all_transactions: data.report_items,
            }), this.setState({
                filtered_transactions: this.state.all_transactions,
            })
        });

    }

    handleStartDateChange = (date, dateString) => {
        const match = this.state.all_transactions.filter(item => {
            if (item.date == dateString) {
                return item;
            }
        });
        this.setState({
            filtered_transactions: match,
            start_date_object: date,
            start_date: dateString
        }, () => this.setState({
            am_shift_total: this.getShiftTypeTotal("A"),
            pm_shift_total: this.getShiftTypeTotal("P"),
            grand_total: this.getGrandTotal("A")
        }))
    };
    handleEndDateChange = (date, dateString) => {
        const match = this.state.all_transactions.filter(item => {
            let start_date = this.state.start_date;
            let end_date = dateString;
            let item_date = item.date;

            console.log(item_date, start_date, end_date);
            if (moment(item_date).isAfter(start_date) || moment(item_date).isSame(start_date) &&
                moment(item_date).isBefore(end_date) || moment(item_date).isSame(end_date)
            ) {
                return item;
            }
        });
        this.setState({
            filtered_transactions: match,
            start_date_object: date,
            start_date: dateString
        }, () => this.setState({
            am_shift_total: this.getShiftTypeTotal("A"),
            pm_shift_total: this.getShiftTypeTotal("P"),
            grand_total: this.getGrandTotal("A")
        }))
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