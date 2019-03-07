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


const dateFormat = "YYYY-MM-DD";
const Option = Select.Option;

class ComponentToPrint extends React.Component {
    render() {
        const { data } = this.props;
        return (
            <div className="container">
                <div className="report-labels">
                    {this.props.data &&
                    <Fragment>
                        {this.props.data.date &&
                        <p> Inventory Count as of {this.props.data.date}</p>
                        }
                    </Fragment>
                    }
                </div>
                <div className="report-body">
                    <table cellSpacing="50" cellPadding="3px">
                        <thead>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        </thead>
                        <tbody>
                        {this.props.data.items &&
                        <Fragment>
                            {this.props.data.items.map((item, index) => (
                                <Fragment>
                                    <tr>
                                        <td>{item.name}</td>
                                        <td>{item.quantity}</td>
                                    </tr>
                                </Fragment>
                            ))}
                            <tr>
                                {/*<td><b> Grand Total </b></td>*/}
                                {/*<td className="total-line"><b>{this.props.data.total_remittance}</b></td>*/}
                                {/*<td className="total-line"><b>{this.props.data.total_fuel}</b></td>*/}
                                {/*<td className="total-line"><b>{this.props.data.total_costs}</b></td>*/}
                                {/*<td className="total-line"><b>{this.props.data.grand_total}</b></td>*/}
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
        postData('/driver_performance/',data).then(data => {
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
                <div className="report-modal-container">
                    <DatePicker placeholder="date from" onChange={this.handleStartDateChange} format={dateFormat}/>
                    <DatePicker placeholder="date to" onChange={this.handleEndDateChange} format={dateFormat}/>
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