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
                        {this.props.data.date &&
                        <p> Ticket Count Per Shuttle for {this.props.data.date}</p>
                        }
                    </Fragment>
                    }
                </div>
                <div className="formatted-report-body">
                    {this.props.data &&
                    <table cellSpacing="50" cellPadding="3px">
                        <thead>
                        <th>Shuttle #</th>
                        <th>Shift #</th>
                        <th>10 Peso</th>
                        <th>12 Peso</th>
                        <th>15 Peso</th>
                        <th>Total</th>
                        </thead>
                        <tbody>
                        {this.props.data &&
                        <Fragment>
                            {this.props.data.shuttles.map(shuttle => (
                                <Fragment>
                                    <tr>
                                        <td>{shuttle.shuttle_id}</td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td>AM</td>
                                        <td>{shuttle.am_ten}</td>
                                        <td>{shuttle.am_twelve}</td>
                                        <td>{shuttle.am_fifteen}</td>
                                        <td>{shuttle.am_total}</td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td>PM</td>
                                        <td>{shuttle.pm_ten}</td>
                                        <td>{shuttle.pm_twelve}</td>
                                        <td>{shuttle.pm_fifteen}</td>
                                        <td>{shuttle.pm_total}</td>
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
                        </Fragment>
                        }
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
                                {this.props.data.grand_am_total}
                            </b></td>
                        </tr>
                        <tr>
                            <td><b> Grand PM Total </b></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td><b> {this.props.data.grand_pm_total}</b></td>
                        </tr>
                        <tr>
                            <td><b> Grand Total </b></td>
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
export class TicketShuttleBreakdown extends Component {
    state = {};

    componentDidMount() {
    }

    fetchTransactions() {
        let data = {
            "start_date": this.state.start_date,
            "end_date": this.state.end_date,
        };
        postData('ticket_type_per_shuttle/', data).then(data => {
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