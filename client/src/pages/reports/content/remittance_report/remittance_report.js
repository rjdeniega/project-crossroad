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
const Option = Select.Option;

export class RemittanceReport extends Component {
    state = {
        all_transactions: [],
        filtered_transactions: [],
        drivers: [],
        shuttles: [],
        driver: null,
        shuttle: null,
        start_date: null,
        start_date_object: moment('2015/01/01', dateFormat),
        end_date: null,
        end_date_object: moment('2015/01/01', dateFormat),
        grand_total: null,
        am_shift_total: null,
        pm_shift_total: null,
    };

    componentDidMount() {
        this.fetchTransactions()
    }

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
        getData('/remittance_report/').then(data => {
            console.log(data);
            this.setState({
                all_transactions: data.report_items,
            }), this.setState({
                filtered_transactions: this.state.all_transactions,
            }), this.setState({
                grand_total: this.getGrandTotal(),
                am_shift_total: this.getShiftTypeTotal("A"),
                pm_shift_total: this.getShiftTypeTotal("P"),
            })
        });
        getData('/inventory/shuttles').then(data => {
            this.setState({
                shuttles: data.shuttles
            });
        });
        getData('/members/drivers').then(data => {
            this.setState({
                drivers: data.drivers
            });
        })
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
    filterBy = fieldName => value => {
        // this function is to handle drop-downs
        const state = { ...this.state };
        state[fieldName] = value;
        this.setState({
            ...state
        });
        if (fieldName == "driver") {
            const match = this.state.filtered_transactions.filter(item => {
                if (item.driver == value) {
                    return item
                }
            });
             this.setState({
                 filtered_transactions: match,
             });
        }
        if(fieldName == "shuttle"){
            const match = this.state.filtered_transactions.filter(item => {
                if (item.shuttle == value) {
                    return item
                }
            });
             this.setState({
                 filtered_transactions: match,
             });
        }
    };

    render() {
        return (
            <div className="report-body">
                <div className="report-filters">
                    <p><b>grand total:</b> {this.state.grand_total} </p>
                    <p><b>AM shift total:</b> {this.state.am_shift_total} </p>
                    <p><b>PM shift total:</b> {this.state.pm_shift_total} </p>

                    <DatePicker placeholder="date from" onChange={this.handleStartDateChange} format={dateFormat}/>
                    <DatePicker placeholder="date to" onChange={this.handleEndDateChange} format={dateFormat}/>
                    <Select onSelect={this.filterBy("shuttle")} className="user-input" defaultValue="Select Shuttle">
                        {this.state.shuttles.map(item => (
                            <Option value={item.plate_number}>{item.plate_number}</Option>
                        ))}
                    </Select>
                    <Select className="user-input" defaultValue="Select Driver" onSelect={this.filterBy("driver")}>
                        {this.state.drivers.map(item => (
                            <Option value={item.name}>{item.name}</Option>
                        ))}
                    </Select>
                    <Button size="small" type="primary" icon="reload" onClick={this.resetFilters}>Reset Filters</Button>
                </div>
                <Table bordered size="small"
                       pagination={false}
                       className="remittance-table"
                       columns={columns}
                       dataSource={this.state.filtered_transactions}
                />
            </div>
        );
    }
}