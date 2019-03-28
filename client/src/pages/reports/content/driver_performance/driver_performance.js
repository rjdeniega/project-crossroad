/**
 * Created by JasonDeniega on 08/03/2019.
 */
/**
 * Created by JasonDeniega on 22/11/2018.
 */
/**
 * Created by JasonDeniega on 21/11/2018.
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
                        <p> Driver Remittance, Absences, and Payables as from {this.props.data.start_date} to {this.props.data.end_date}</p>
                        }
                    </Fragment>
                    }
                </div>
                <div className="report-body">
                    <table cellSpacing="50" cellPadding="3px">
                        <thead>
                        <th>Driver Name</th>
                        <th>Remittance</th>
                        <th>Discrepancy Frequency</th>
                        <th>Discrepancies</th>
                        <th>Lates</th>
                        <th>Absences</th>
                        </thead>
                        <tbody>
                        {this.props.data &&
                        <Fragment>
                            {this.props.data.data.map((item, index) => (
                                <Fragment>
                                    <tr>
                                        <td>{item.driver.name}</td>
                                        <td>{item.remittance}</td>
                                         <td>{item.discrepancy_freq}</td>
                                        <td>{item.payables}</td>
                                        <td>{item.lates}</td>
                                        <td>{item.absences}</td>
                                    </tr>
                                </Fragment>
                            ))}
                            <tr>
                                <td><b> Total </b></td>
                                <td className="total-line"><b>{this.props.data.remittance_total}</b></td>
                                 <td className="total-line"><b>{this.props.data.discrepancy_freq_total}</b></td>
                                <td className="total-line"><b>{this.props.data.payables_total}</b></td>
                                <td className="total-line"><b>{this.props.data.lates_total}</b></td>
                                <td className="total-line"><b>{this.props.data.absences_total}</b></td>
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
export class DriverPerformance extends Component {
    state = {};

    componentDidMount() {
    }

    fetchTransactions() {
        console.log("fetching transactions")
        let data = {
            "start_date": this.state.start_date,
            "end_date": this.state.end_date,
        };
        postData('/driver_performance/', data).then(data => {
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
                    {this.state.data &&
                    <ComponentToPrint data={this.state.data} ref={el => (this.componentRef = el)}/>
                    }
                </div>
            </div>
        );
    }
}