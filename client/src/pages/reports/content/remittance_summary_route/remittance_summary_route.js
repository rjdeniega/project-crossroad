/**
 * Created by JasonDeniega on 11/03/2019.
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
import LBATSCLogo from '../../../../images/LBATSCLogo.png'


const dateFormat = "YYYY-MM-DD";
const Option = Select.Option;

class ComponentToPrint extends React.Component {
    render() {
        const { data } = this.props;
        return (
            <div className="container">
                <div className="lbatsc-container">
                    <img className="lbatsc" src={LBATSCLogo}/>
                </div>
                <div className="report-labels">
                    {this.props.data &&
                    <Fragment>
                        {this.props.data.end_date &&
                        <p><b>Remittance Per Route Report for {this.props.data.start_date}
                            to {this.props.data.end_date}</b></p>
                        }
                    </Fragment>
                    }
                </div>
                <div className="report-body">
                    <table cellSpacing="50" cellPadding="3px">
                        <thead>
                        <th>Date</th>
                        <th>Route</th>
                        <th>Shift</th>
                        <th>Actual Remittances</th>
                        <th>Total Per Day</th>
                        <th>Fuel</th>
                        <th>Total after Fuel</th>
                        <th>Beep Remittance</th>
                        <th>Total</th>
                        </thead>
                        <tbody>
                        {this.props.data && this.props.data.rows.map(item => (
                            <Fragment>
                                <tr>
                                    <td>
                                        <b>{item.date}</b>
                                    </td>
                                </tr>
                                {item.routes.map(item => (
                                    <Fragment>
                                        <tr>
                                            <td></td>
                                            <td>{item.route}</td>
                                        </tr>
                                        {item.shifts.map(item => (
                                            <Fragment>
                                                <tr>
                                                    <td></td>
                                                    <td></td>
                                                    <td>{item.type}</td>
                                                    <td className="monetary">{item.remittance}</td>
                                                    {(item.type == "A" || item.type == "AM") &&
                                                    <td></td>
                                                    }
                                                    {(item.type == "P" || item.type == "PM") &&
                                                    <td className="monetary"><b>{item.total_per_day}</b></td>
                                                    }
                                                    <td className="monetary">{item.fuel}</td>
                                                    <td className="monetary"><b>{item.remittance_minus_fuel}</b></td>
                                                    <td className="monetary">{item.beep_total}</td>
                                                    <td className="monetary">{item.beep_ticket_total}</td>
                                                </tr>
                                            </Fragment>
                                        ))}
                                    </Fragment>
                                ))}
                                <tr>
                                    <td></td>
                                    <td className="total-line"><b> Main Road Total </b></td>
                                    <td className="total-line"></td>
                                    <td className="total-line"></td>
                                    <td className="total-line"></td>
                                    <td className="total-line"></td>
                                    <td className="total-line"></td>
                                    <td className="total-line"></td>
                                    <td className="total-line monetary"><b>{item.mr_route_total}</b></td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td><b> Kanan Total </b></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td className="monetary"><b>{item.r_route_total}</b></td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td><b> Kaliwa Total </b></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td className="monetary"><b>{item.l_route_total}</b></td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td><b> Day Total </b></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td className="monetary"><b>{item.grand_route_total}</b></td>
                                </tr>
                            </Fragment>
                        ))}
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td colSpan={3}>
                                <Pagination onChange={this.props.handlePagination} defaultCurrent={1}
                                            total={this.props.length}/>
                            </td>
                        </tr>
                        {this.props.data &&
                        <Fragment>
                            <tr>
                                <td></td>
                                <td className="total-line"><b> Main Road Grand Total </b></td>
                                <td className="total-line"></td>
                                <td className="total-line"></td>
                                <td className="total-line"></td>
                                <td className="total-line"></td>
                                <td className="total-line"></td>
                                <td className="total-line"></td>
                                <td className="total-line monetary"><b>{this.props.data.mr_grand_remit_total}</b></td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><b> Kanan Grand Total </b></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td className="monetary"><b>{this.props.data.r_grand_remit_total}</b></td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><b> Kaliwa Grand Total </b></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td className="monetary"><b>{this.props.data.l_grand_remit_total}</b></td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><b> Grand Total </b></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td className="monetary"><b>{this.props.data.grand_route_total}</b></td>
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
export class RemittanceSummaryRoute extends Component {
    state = {
        start: 1
    };

    componentDidMount() {
    }

    fetchTransactions() {
        let data = {
            "start_date": this.state.start_date,
            "end_date": this.state.end_date,
        };
        postData('/beep_tickets_per_route/', data).then(data => {
            console.log(data);
            if (!data.error) {
                console.log(data);
                console.log(data.rows.length);
                let length = Math.ceil(data.rows.length / 3);

                if (!data.error) {
                    this.setState({
                        original_data: data,
                        data: data,
                    });
                    if (data.rows.length < 4) {
                        this.setState({
                            data: data,
                            length: length * 10,
                        })
                    }
                    else {
                        let new_data = { ...data };
                        new_data.rows = this.changeContents([...this.state.original_data.rows]);
                        console.log(new_data.rows);
                        this.setState({
                            data: new_data,
                            length: length * 10,
                        });
                        console.log(this.state.original_data.rows.length)
                    }
                }
            }
        });
    }

    handlePagination = (current) => {
        let new_array = { ...this.state.original_data };
        this.setState({
            start: current
        }, () => {
            new_array.rows = this.changeContents([...this.state.original_data.rows]);
            console.log(new_array.rows);
            this.setState({
                data: new_array
            })
        })
        console.log(this.state.data)
    }

    changeContents = (array) => {
        console.log(this.state.start);
        let index = (this.state.start * 3) - 3;
        let new_array = [];
        for (let i = index; i <= index + 2; i++) {
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
                    <ComponentToPrint length={this.state.length} handlePagination={this.handlePagination}
                                      data={this.state.data} ref={el => (this.componentRef = el)}/>
                </div>
            </div>
        );
    }
}