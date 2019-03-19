/**
 * Created by JasonDeniega on 21/11/2018.
 */
/**
 * Created by JasonDeniega on 16/11/2018.
 */
/**
 * Created by JasonDeniega on 13/11/2018.
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
        const { data } = this.props;
        return (
            <div className="formatted-container">
                <div className="report-labels">
                    {this.props.data &&
                    <Fragment>
                        {this.props.data.start_date &&
                        <p> Ticket Count Report for {this.props.data.start_date}</p>
                        }
                    </Fragment>
                    }
                </div>
                <div className="formatted-report-body">
                    {this.props.data &&
                    <table className="ticket-day-table" cellSpacing="50" cellPadding="3px">
                        <thead>
                        <th>Date</th>
                        <th>Shuttle</th>
                        <th>Route</th>
                        <th>Shift</th>
                        <th>10 Peso</th>
                        <th>12 Peso</th>
                        <th>15 Peso</th>
                        <th>Total</th>
                        <th>Day total</th>
                        </thead>
                        <tbody>
                        {this.props.data &&
                        <Fragment>
                            {this.props.data.days.map(item => (
                                <Fragment>
                                    <tr>
                                        <td>{item.date}</td>
                                    </tr>
                                    {item.shuttles.map(item => (
                                        <Fragment>
                                            <tr>
                                                <td></td>
                                                <td>{item.shuttle_id} - {item.shuttle_plate}</td>
                                                <td>{item.shuttle_route}</td>
                                                <td>AM</td>
                                                <td>{item.am_ten}</td>
                                                <td>{item.am_twelve}</td>
                                                <td>{item.am_fifteen}</td>
                                                <td>{item.am_total}</td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td>PM</td>
                                                <td>{item.pm_ten}</td>
                                                <td>{item.pm_twelve}</td>
                                                <td>{item.pm_fifteen}</td>
                                                <td>{item.pm_total}</td>
                                                <td><b>{item.day_total}</b></td>
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
                                        </Fragment>
                                    ))}
                                    <tr>
                                        <td>
                                        </td>
                                        <td>
                                        </td>
                                        <td>
                                        </td>
                                        <td><b> Main Road Total </b></td>
                                        <td></td>
                                        <td ></td>
                                        <td></td>
                                        <td><b>{item.mr_total}</b></td>
                                        <td><b> {item.mr_total}
                                        </b></td>
                                    </tr>
                                    <tr>
                                        <td>
                                        </td>
                                        <td>
                                        </td>
                                        <td>
                                        </td>
                                        <td><b> Kaliwa Total </b></td>
                                        <td></td>
                                        <td ></td>
                                        <td></td>
                                        <td><b>{item.kaliwa_total}</b></td>
                                        <td><b> {item.kaliwa_total}
                                        </b></td>
                                    </tr>
                                    <tr>
                                        <td>
                                        </td>
                                        <td>
                                        </td>
                                        <td>
                                        </td>
                                        <td><b> Kanan Total </b></td>
                                        <td></td>
                                        <td ></td>
                                        <td></td>
                                        <td><b>{item.kanan_total}</b></td>
                                        <td><b> {item.kanan_total}
                                        </b></td>
                                    </tr>
                                    <tr>
                                        <td>
                                        </td>
                                        <td>
                                        </td>
                                        <td>

                                        </td>
                                        <td><b> Day Total </b></td>
                                        <td className="total-line"><b> {item.ten_total}
                                        </b></td>
                                        <td className="total-line"><b> {item.twelve_total}
                                        </b></td>
                                        <td className="total-line"><b> {item.fifteen_total}
                                        </b></td>
                                        <td className="total-line"><b> {item.day_total}
                                        </b></td>
                                        <td className="total-line"><b> {item.day_total}
                                        </b></td>
                                    </tr>


                                </Fragment>

                            ))}
                        </Fragment>
                        }
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
                            <td><b> Grand AM Total </b></td>
                            <td className="total-line"><b>
                            </b></td>
                            <td className="total-line"><b>
                            </b></td>
                            <td className="total-line"><b>
                            </b></td>
                            <td className="total-line"><b>
                            </b></td>
                            <td className="total-line"><b>
                            </b></td>
                            <td className="total-line"><b>
                            </b></td>
                            <td className="total-line"><b>
                                {this.props.data.grand_am_total}
                            </b></td>
                        </tr>
                        <tr>
                            <td><b> Grand PM Total </b></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td><b> {this.props.data.grand_pm_total}</b></td>
                        </tr>
                        <tr>
                            <td><b> Grand Total </b></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td><b>
                                {this.props.data.grand_ten_total}
                            </b></td>
                            <td><b>
                                {this.props.data.grand_twelve_total}
                            </b></td>
                            <td><b>
                                {this.props.data.grand_fifteen_total}
                            </b></td>
                            <td><b>
                                {this.props.data.grand_total}
                            </b></td>
                        </tr>
                        </tbody>
                    </table>
                    }
                    <p className="end-label">END OF REPORT</p>
                </div>
            </div>
        );
    }
}
export class TicketPerDay extends Component {
    state = {};

    componentDidMount() {
    }

    fetchTransactions() {
        let data = {
            "start_date": this.state.start_date,
            "end_date": this.state.end_date,
        };
        postData('ticket_type_per_day/', data).then(data => {
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


    render() {
        return (
            <div className="report-body">
                <DatePicker placeholder="date from" onChange={this.handleStartDateChange} format={dateFormat}/>
                <DatePicker placeholder="date to" onChange={this.handleEndDateChange} format={dateFormat}/>
                <div className="formatted-report-modal-container">
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