/**
 * Created by JasonDeniega on 23/11/2018.
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
                        {this.props.data.end_date &&
                        <p> Item Movement Report from {this.props.data.start_date} to {this.props.data.end_date}</p>
                        }
                    </Fragment>
                    }
                </div>
                <div className="report-body">
                    <table cellSpacing="50" cellPadding="3px">
                        <thead>
                        <th>Item Name</th>
                        <th>Date Used</th>
                        <th>Movement Type</th>
                        <th>Quantity</th>
                        </thead>
                        <tbody>
                        {this.props.data &&
                        <Fragment>
                            {this.props.data.rows.map((item, index) => (
                                <Fragment>
                                    <tr>
                                        <td>{item.item}</td>
                                        <td>{item.date}</td>
                                        <td>{item.type}</td>
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
export class ItemMovementReport extends Component {
    state = {};

    componentDidMount() {
        this.fetchTransactions()
    }

    fetchTransactions() {
        let data = {
            "start_date": this.state.start_date,
            "end_date": this.state.end_date,
        };
        postData('/inventory/items/item_movement_report',data).then(data => {
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
        })
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