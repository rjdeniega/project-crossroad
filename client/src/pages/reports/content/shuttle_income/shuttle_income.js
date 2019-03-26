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
                        <p> Shuttle Net Value Report for {this.props.data.start_date} to {this.props.data.end_date} </p>
                        }
                    </Fragment>
                    }
                </div>
                <div className="report-body">
                    <table cellSpacing="50" cellPadding="3px">
                        <thead>
                        <th>Shuttle</th>
                        <th>Purchase Date</th>
                        <th>Purchase Cost</th>
                        <th>Revenue</th>
                        <th>Fuel Costs</th>
                        <th>Major Repair Costs</th>
                        <th>Net Income</th>
                        <th>Depreciation</th>
                        <th>Net Value</th>
                        </thead>
                        <tbody>
                        {this.props.data &&
                        <Fragment>
                            {this.props.data.shuttles.map((item, index) => (
                                <Fragment>
                                    <tr>
                                        <td>{item.shuttle_id}</td>
                                        <td className="monetary">{item.purchase_date}</td>
                                        <td className="monetary">{item.purchase_cost}</td>
                                        <td className="monetary">{item.revenue}</td>
                                        <td className="monetary">{item.fuel_cost}</td>
                                        <td className="monetary">{item.cost}</td>
                                        <td className="monetary"><b>{item.value}</b></td>
                                        <td className="monetary"><b>{item.depreciation}</b></td>
                                        <td className="monetary"><b>{item.net_value}</b></td>

                                    </tr>
                                </Fragment>
                            ))}
                            <tr>
                                <td><b> Grand Total </b></td>
                                <td className="total-line monetary"><b></b></td>
                                <td className="total-line monetary"><b>{this.props.data.total_purchase_cost}</b></td>
                                <td className="total-line monetary"><b>{this.props.data.total_remittance}</b></td>
                                <td className="total-line monetary"><b>{this.props.data.total_fuel}</b></td>
                                <td className="total-line monetary"><b>{this.props.data.total_costs}</b></td>
                                <td className="total-line monetary"><b>{this.props.data.grand_total}</b></td>
                                <td className="total-line monetary"><b>{this.props.data.total_depreciation}</b></td>
                                <td className="total-line monetary"><b>{this.props.data.grand_net}</b></td>
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
export class ShuttleIncome extends Component {
    state = {};

    componentDidMount() {
    }

    fetchTransactions() {
        let data = {
            "start_date": this.state.start_date,
            "end_date": this.state.end_date,
        };
        postData('/shuttle_net_income_report/', data).then(data => {
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