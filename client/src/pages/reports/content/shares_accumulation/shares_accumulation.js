/**
 * Created by JasonDeniega on 19/11/2018.
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
import { Icon as AntIcon, Input, Card, Table, DatePicker, Select } from 'antd'
import { getData, postData } from '../../../../network_requests/general'
import { Icon } from 'react-icons-kit'
import { fileTextO } from 'react-icons-kit/fa/fileTextO'
import { money } from 'react-icons-kit/fa/money'
import moment from "moment";
import ReactToPrint from "react-to-print";


const dateFormat = "YYYY-MM-DD";
const Option = Select.Option;

class ComponentToPrint extends React.Component {
    render() {
        const { data } = this.props
        return (
            <div className="container">
                <div className="report-labels">
                    {this.props.data &&
                    <Fragment>
                        {this.props.data &&
                        <p><b> Shares Accumulation Report for {this.props.data.year}</b></p>
                        }
                    </Fragment>
                    }
                </div>
                <div className="report-body">
                    <table cellSpacing="50" cellPadding="3px">
                        <thead>
<<<<<<< HEAD
                        <th>Member</th>
                        <th>Jan</th>
                        <th>Feb</th>
                        <th>Mar</th>
                        <th>Apr</th>
                        <th>May</th>
                        <th>Jun</th>
                        <th>Jul</th>
                        <th>Aug</th>
                        <th>Sep</th>
                        <th>Oct</th>
                        <th>Nov</th>
                        <th>Dec</th>
                        <th>Acc</th>
                        <th>Prev</th>
                        <th>Total</th>
=======
                        <th>Date</th>
                        <th>Shift</th>
                        <th>Actual Remittances</th>
                        <th>Total Per Day</th>
                        <th>Fuel</th>
                        <th>Total after Fuel</th>
>>>>>>> parent of 9712ca5... set-up shares accumulation report
                        </thead>
                        <tbody>
                        {this.props.data &&
                        <Fragment>
<<<<<<< HEAD
                            {this.props.data.members.map((item, index) => (
                                <Fragment>
                                    <tr>
                                        <td>{item.name}</td>
                                        <td>{item.months[0].added_amount}</td>
                                        <td>{item.months[1].added_amount}</td>
                                        <td>{item.months[2].added_amount}</td>
                                        <td>{item.months[3].added_amount}</td>
                                        <td>{item.months[4].added_amount}</td>
                                        <td>{item.months[5].added_amount}</td>
                                        <td>{item.months[6].added_amount}</td>
                                        <td>{item.months[7].added_amount}</td>
                                        <td>{item.months[8].added_amount}</td>
                                        <td>{item.months[9].added_amount}</td>
                                        <td>{item.months[10].added_amount}</td>
                                        <td>{item.months[11].added_amount}</td>
                                        <td><b>{item.accumulated_shares}</b></td>
                                        <td><b>{item.prior_shares}</b></td>
                                        <td><b>{item.total_shares}</b></td>
                                    </tr>
                                </Fragment>
                            ))}

                            <tr>
                                <td><b> Grand Total </b></td>
                                <td className="total-line"><b>{this.props.data.months_sum[0]}</b></td>
                                <td className="total-line"><b>{this.props.data.months_sum[1]}</b></td>
                                <td className="total-line"><b>{this.props.data.months_sum[2]}</b></td>
                                <td className="total-line"><b>{this.props.data.months_sum[3]}</b></td>
                                <td className="total-line"><b>{this.props.data.months_sum[4]}</b></td>
                                <td className="total-line"><b>{this.props.data.months_sum[5]}</b></td>
                                <td className="total-line"><b>{this.props.data.months_sum[6]}</b></td>
                                <td className="total-line"><b>{this.props.data.months_sum[7]}</b></td>
                                <td className="total-line"><b>{this.props.data.months_sum[8]}</b></td>
                                <td className="total-line"><b>{this.props.data.months_sum[9]}</b></td>
                                <td className="total-line"><b>{this.props.data.months_sum[10]}</b></td>
                                <td className="total-line"><b>{this.props.data.months_sum[11]}</b></td>
                                <td className="total-line"><b>{this.props.data.acc_total}</b></td>
                                <td className="total-line"><b>{this.props.data.prev_total}</b></td>
                                <td className="total-line"><b>{this.props.data.grand_total}</b></td>




=======
                            {this.props.data.rows.map((item,index) => (
                                <Fragment>
                                    <tr>
                                        <td>{item.date}</td>
                                    </tr>
                                    {item.shifts.map((item) => (
                                        <Fragment>
                                            <tr>
                                                <td></td>
                                                <td>{item.type}</td>
                                                <td>{item.remittance}</td>
                                                {(item.type == "A" || item.type == "AM") &&
                                                <td></td>
                                                }
                                                {(item.type == "P" || item.type == "PM") &&
                                                <td><b>{item.total_per_day}</b></td>
                                                }
                                                <td>{item.fuel}</td>
                                                <td><b>{item.remittance_minus_fuel}</b></td>
                                            </tr>
                                            {/*{index%11 == 0 &&*/}
                                                {/*<p className="page-break"></p>*/}
                                            {/*}*/}

                                        </Fragment>
                                    ))}
                                </Fragment>
                            ))}
                            <tr>
                                <td><div>&nbsp;</div></td>
                                <td><div>&nbsp;</div></td>
                                <td><div>&nbsp;</div></td>
                                <td><div>&nbsp;</div></td>
                                <td><div>&nbsp;</div></td>
                                <td><div>&nbsp;</div></td>
                            </tr>
                            <tr>
                                <td><b> Grand Total </b></td>
                                <td className="total-line"></td>
                                <td className="total-line"><b>{this.props.data.grand_remit_total}</b></td>
                                <td className="total-line"><b>{this.props.data.grand_remit_total}</b></td>
                                <td className="total-line"><b>{this.props.data.grand_fuel_total}</b></td>
                                <td className="total-line"><b>{this.props.data.grand_remit_minus_fuel}</b></td>
>>>>>>> parent of 9712ca5... set-up shares accumulation report
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
export class SharesAccumulationReport extends Component {
    state = {};

    componentDidMount() {
    }

    fetchTransactions() {
        let data = {
<<<<<<< HEAD
            start_date: this.state.start_date
        }
        postData('/accumulated_shares_report/', data).then(data => {
=======
            "start_date": this.state.start_date,
            "end_date": this.state.end_date,
        };
        postData('/remittance_versus_fuel/', data).then(data => {
>>>>>>> parent of 9712ca5... set-up shares accumulation report
            console.log(data);
            if (!data.error) {
                this.setState({
                    data: data
                })
            }
        });
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

<<<<<<< HEAD
    handleChange = (date) => {
        this.setState({
            year: date,
        }, () => this.fetchTransactions())
    }

=======
>>>>>>> parent of 9712ca5... set-up shares accumulation report

    render() {
        return (
            <div className="report-body">
                <DatePicker placeholder="date from" onChange={this.handleStartDateChange} format={dateFormat}/>
<<<<<<< HEAD
=======
                <DatePicker placeholder="date to" onChange={this.handleEndDateChange} format={dateFormat}/>
>>>>>>> parent of 9712ca5... set-up shares accumulation report
                <div className="report-modal-container">
                    <ReactToPrint
                        trigger={() => <a href="#">Print this out!</a>}
                        content={() => this.componentRef}
                    />
                    <ComponentToPrint data={this.state.data} ref={el => (this.componentRef = el)}/>
                </div>
            </div>
        );
    }
}