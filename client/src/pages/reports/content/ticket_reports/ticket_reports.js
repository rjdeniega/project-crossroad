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
        const { data } = this.props
        return (
            <div className="container">
                <div className="report-labels">
                    {this.props.data &&
                    <Fragment>
                        {this.props.data.end_date &&
                        <p> Ticket Count Report for {this.props.data.start_date}</p>
                        }
                    </Fragment>
                    }
                </div>
                <div className="report-body">
                    <table cellSpacing="50" cellPadding="3px">
                        <thead>
                        <th>Shuttle #</th>
                        <th>Shift #</th>
                        <th>Monday</th>
                        <th>Tuesday</th>
                        <th>Wednesday</th>
                        <th>Thursday</th>
                        <th>Friday</th>
                        <th>Saturday</th>
                        <th>Sunday</th>
                        </thead>
                        <tbody>
                        {this.props.data &&
                        <Fragment>
                            {this.props.data.shuttles.map((item, index) => (
                                <Fragment>
                                    <tr>
                                        <td>{item.shuttle_number}</td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td>
                                            AM
                                        </td>
                                        <td>
                                            {item.days[0].am_count}
                                        </td>
                                        <td>
                                            {item.days[1].am_count}
                                        </td>
                                        <td>
                                            {item.days[2].am_count}
                                        </td>
                                        <td>
                                            {item.days[3].am_count}
                                        </td>
                                        <td>
                                            {item.days[4].am_count}
                                        </td>
                                        <td>
                                            {item.days[5].am_count}
                                        </td>
                                        <td>
                                            {item.days[6].am_count}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td>
                                            PM
                                        </td>

                                        <td>
                                            {item.days[0].pm_count}
                                        </td>
                                        <td>
                                            {item.days[1].pm_count}
                                        </td>
                                        <td>
                                            {item.days[2].pm_count}
                                        </td>
                                        <td>
                                            {item.days[3].pm_count}
                                        </td>
                                        <td>
                                            {item.days[4].pm_count}
                                        </td>
                                        <td>
                                            {item.days[5].pm_count}
                                        </td>
                                        <td>
                                            {item.days[6].pm_count}
                                        </td>

                                    </tr>
                                </Fragment>
                            ))}
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
export class TicketReport extends Component {
    state = {};

    componentDidMount() {
    }

    fetchTransactions() {
        let data = {
            "start_date": this.state.start_date,
            "end_date": this.state.end_date,
        };
        postData('tickets_count_report/', data).then(data => {
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