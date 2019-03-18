/**
 * Created by JasonDeniega on 22/11/2018.
 */
/**
 * Created by JasonDeniega on 08/11/2018.
 */
/**
 * Created by JasonDeniega on 29/07/2018.
 */

import React, { Component, Fragment } from 'react'
import '../../../../utilities/colorsFonts.css'
import './style.css'
import { Button } from 'antd'
import { Icon as AntIcon, Input, Card, Table, DatePicker, Select, Pagination } from 'antd'
import { getData, postData } from '../../../../network_requests/general'
import { Icon } from 'react-icons-kit'
import { fileTextO } from 'react-icons-kit/fa/fileTextO'
import { money } from 'react-icons-kit/fa/money'
import moment from "moment";
import ReactToPrint from "react-to-print";


const dateFormat = "YYYY-MM-DD";
const Option = Select.Option;

class ComponentToPrint extends React.Component {
    componentDidMount() {
        if (this.props.data) {
            console.log(this.props.length)
        }
    }

    render() {
        const { data } = this.props
        return (
            <div className="container">
                <div className="report-labels">
                    {this.props.data &&
                    <Fragment>
                        {this.props.data.end_date &&
                        <p> Beep + Ticket Remittance Report for {this.props.data.start_date}
                            to {this.props.data.end_date} </p>
                        }
                    </Fragment>
                    }
                </div>
                <div className="report-body">
                    <table cellSpacing="50" cellPadding="3px">
                        <thead>
                        <th>Date</th>
                        <th>Shift</th>
                        <th>Ticket Remittances</th>
                        <th>Total Per Day</th>
                        <th>Fuel</th>
                        <th>Total after Fuel</th>
                        <th>Beep Remittance</th>
                        <th>Total</th>
                        </thead>
                        <tbody>
                        {this.props.data &&
                        <Fragment>
                            {this.props.data.rows.map((item, index) => (
                                <Fragment>
                                    <tr>
                                        <td>{item.date}</td>
                                    </tr>
                                    {item.shifts.map((item) => (
                                        <Fragment>
                                            <tr>
                                                <td></td>
                                                <td>{item.type}</td>
                                                <td className="monetary">{item.remittance}</td>
                                                {(item.type == "A" || item.type == "AM") &&
                                                <Fragment>
                                                    <td></td>
                                                </Fragment>
                                                }
                                                {(item.type == "P" || item.type == "PM") &&
                                                <Fragment>
                                                    <td className="monetary"><b>{item.total_per_day}</b></td>
                                                </Fragment>
                                                }
                                                <td>{item.fuel}</td>
                                                <td className="monetary"><b>{item.remittance_minus_fuel}</b></td>
                                                <td className="monetary">{item.beep_total}</td>
                                                <td className="monetary"><b>{item.beep_ticket_total}</b></td>
                                            </tr>
                                            {/*{index%11 == 0 &&*/}
                                            {/*<p className="page-break"></p>*/}
                                            {/*}*/}

                                        </Fragment>
                                    ))}
                                </Fragment>
                            ))}
                            <tr>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td colSpan={3}>
                                    <Pagination size="small" onChange={this.props.handlePagination} defaultCurrent={1}
                                                total={this.props.length}/>

                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div>&nbsp;</div>
                                </td>
                                <td>
                                    <div>&nbsp;</div>
                                </td>
                                <td>
                                    <div>&nbsp;</div>
                                </td>
                                <td>
                                    <div>&nbsp;</div>
                                </td>
                                <td>
                                    <div>&nbsp;</div>
                                </td>
                                <td>
                                    <div>&nbsp;</div>
                                </td>
                            </tr>
                            <tr>

                                <td><b> Grand Total </b></td>
                                <td className="total-line"></td>
                                <td className="total-line monetary"><b>{this.props.data.grand_remit_total}</b></td>
                                <td className="total-line monetary"><b>{this.props.data.grand_remit_total}</b></td>
                                <td className="total-line monetary"><b>{this.props.data.grand_fuel_total}</b></td>
                                <td className="total-line monetary"><b>{this.props.data.grand_remit_minus_fuel}</b></td>
                                <td className="total-line monetary"><b>{this.props.data.beep_grand_total}</b></td>
                                <td className="total-line monetary"><b>{this.props.data.grandest_total}</b></td>


                            </tr>
                        </Fragment>
                        }
                        </tbody>
                    </table>
                    <p className="end-label">END OF REPORT</p>
                </div>
            </div>
        );
    }
}
export class BeepTickets extends Component {
    state = {
        start: 0
    };

    componentDidMount() {
    }

    fetchTransactions() {
        let data = {
            "start_date": this.state.start_date,
            "end_date": this.state.end_date,
        };
        postData('/beep_tickets/', data).then(data => {
            console.log(data);
            console.log(data.rows.length);
            let length = Math.round(data.rows.length / 7)

            if (!data.error) {
                if (data.rows.length < 8) {
                    this.setState({
                        data: data,
                        original_data: data,
                        length: length * 10,
                    })
                }
                else {
                    let new_data = data;
                    new_data.rows = this.changeContents(data.rows);
                    console.log(new_data);
                    this.setState({
                        data: new_data,
                        original_data: data,
                        length: length * 10,
                    })
                }
                console.log(this.state.length)
            }
        });

    }

    handlePagination = (current) => {
        let new_array = this.state.data;
        this.setState({
            start: current
        }, () => {
            new_array.rows = this.changeContents(this.state.original_data);
            this.setState({
                data: new_array
            })
        })
        console.log(this.state.data)
    }

    changeContents = (array) => {
        console.log(this.state.start);
        console.log(array.length)
        let index = this.state.start * 7
        let new_array = [];
        for (let i = index; i <= index + 6; i++) {
            if (i < array.length) {
                new_array.push(array[i])
            }
        }
        return new_array;
    }

    handleStartDateChange = (date, dateString) => {
        this.setState({
            start_date_object: date,
            start_date: dateString
        }, () => this.fetchTransactions())
    };
    handleEndDateChange = (date, dateString) => {
        this.setState({
            end_date_object: date,
            end_date: dateString
        }, () => this.fetchTransactions())
    };


    render() {
        return (
            <div className="report-body">
                <DatePicker placeholder="date from" onChange={this.handleStartDateChange} format={dateFormat}/>
                <DatePicker placeholder="date to" onChange={this.handleEndDateChange} format={dateFormat}/>
                <div className="report-modal-container">
                    <ReactToPrint
                        trigger={() => <a href="#">Print this out!</a>}
                        content={() => this.componentRef}
                    />
                    <ComponentToPrint length={this.state.length}
                                      handlePagination={this.handlePagination} data={this.state.data}
                                      ref={el => (this.componentRef = el)}/>

                </div>
            </div>
        );
    }
}