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
                        <th>Member</th>
                        <th>Initial Shares</th>
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
                        <th>Accumulated Shares</th>
                        <th>Total</th>
                        </thead>
                        <tbody>
                        {this.props.data &&
                        <Fragment>
                            {this.props.data.members.map((item, index) => (
                                <Fragment>
                                    <tr>
                                        <td>{item.name}</td>
                                        <td><b>{item.prior_shares}</b></td>
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
                                        <td><b>{item.total_shares}</b></td>
                                    </tr>
                                </Fragment>
                            ))}

                            <tr>
                                <td><b> Grand Total </b></td>                                <td className="total-line"><b>{this.props.data.prev_total}</b></td>
                                <td className="total-line"><b>{this.props.data.prev_total}</b></td>
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
                                <td className="total-line"><b>{this.props.data.grand_total}</b></td>




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
            start_date: this.state.start_date
        };
        postData('/accumulated_shares_report/', data).then(data => {
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

    handleChange = (date) => {
        this.setState({
            year: date,
        }, () => this.fetchTransactions())
    }


    render() {
        return (
            <div className="report-body">
                <DatePicker placeholder="date from" onChange={this.handleStartDateChange} format={dateFormat}/>
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