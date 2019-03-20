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
                <div classname="lbatsc-container">
                    <img className="lbatsc" src={LBATSCLogo}/>
                </div>
                <div className="report-labels">
                    {this.props.data &&
                    <Fragment>
                        {this.props.data.end_date &&
                        <p> Remittance Report for {this.props.data.start_date} to {this.props.data.end_date} </p>
                        }
                    </Fragment>
                    }
                </div>
                <div className="report-body">
                    <table cellSpacing="50" cellPadding="3px">
                        <thead>
                        <tr>
                            <th>Shuttle #</th>
                            <th>Acquired</th>
                            <th>Mileage</th>
                            <th colSpan={3}>M. Frequency</th>
                            <th colSpan={3}>M. Cost</th>
                            <th colSpan={3}>Ave. M. Cost</th>
                             <th>Cost Total</th>
                        </tr>
                        <tr>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th>MN</th>
                            <th>INT</th>
                            <th>MJ</th>
                            <th>MN</th>
                            <th>INT</th>
                            <th>MJ</th>
                            <th>MN</th>
                            <th>INT</th>
                            <th>MJ</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.props.data &&
                        <Fragment>
                            {this.props.data.rows.map((item, index) => (
                                <Fragment>
                                    <tr>
                                        <td>{item.shuttle}</td>
                                        <td>{item.year_purchased}</td>
                                        <td>{item.mileage}</td>
                                        {/*here*/}
                                        <td>{item.number_of_minor_maintenance}</td>
                                        <td>{item.number_of_intermediate_maintenance}</td>
                                        <td>{item.number_of_major_maintenance}</td>
                                        <td className="monetary">{item.minor_maintenance_cost}</td>
                                        <td className="monetary">{item.intermediate_maintenance_cost}</td>
                                        <td className="monetary">{item.major_maintenance_cost}</td>
                                        <td className="monetary">{item.minor_average_cost}</td>
                                        <td className="monetary">{item.intermediate_average_cost}</td>
                                        <td className="monetary">{item.major_average_cost}</td>
                                        <td className="monetary"><b>{item.total}</b></td>
                                    </tr>
                                </Fragment>
                            ))}
                            <tr>
                                <td><b> Grand Total </b></td>
                                <td className="total-line"><b></b></td>
                                <td className="total-line"><b></b></td>
                                <td className="total-line"><b>{this.props.data.minor_count}</b></td>
                                <td className="total-line"><b>{this.props.data.intermediate_count}</b></td>
                                <td className="total-line"><b>{this.props.data.major_count}</b></td>
                                <td className="total-line monetary"><b>{this.props.data.minor_total_maintenance_cost}</b></td>
                                <td className="total-line monetary"><b>{this.props.data.intermediate_total_maintenance_cost}</b></td>
                                <td className="total-line monetary"><b>{this.props.data.major_total_maintenance_cost}</b></td>
                                <td className="total-line monetary"><b>{this.props.data.minor_average_maintenance_cost}</b></td>
                                <td className="total-line monetary"><b>{this.props.data.intermediate_average_maintenance_cost}</b></td>
                                <td className="total-line monetary"><b>{this.props.data.major_average_maintenance_cost}</b></td>
                                <td className="total-line monetary"><b>{this.props.data.grand_total}</b></td>
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
export class MaintenanceReport extends Component {
    state = {};

    componentDidMount() {
    }

    fetchTransactions() {
        let data = {
            "start_date": this.state.start_date,
            "end_date": this.state.end_date,
        };
        postData('/inventory/shuttles/maintenance_report/',data).then(data => {
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