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
                        <p><b> Member Transactions Report for {this.props.data.start_date}
                            to {this.props.data.end_date}</b> </p>
                        }
                    </Fragment>
                    }
                </div>
                {this.props.data &&
                <Fragment>
                    <div className="tag-div">
                        <p style={{ 'margin-right': '7px' }}><b> Tags: </b></p>
                        <AntIcon style={{ 'margin-top': '3px' }} type="credit-card" theme="twoTone"/>
                        <p>Has Beep Card</p>
                    </div>
                </Fragment>
                }
                <div className="report-body">
                    <table cellSpacing="50" cellPadding="3px">
                        <thead>
                        <th>Member ID</th>
                        <th>Name</th>
                        <th># of Beep</th>
                        <th>Beep Total</th>
                        <th># of Carwash</th>
                        <th>Carwash Total</th>
                        <th>Total</th>
                        </thead>
                        <tbody>
                        {this.props.data &&
                        <Fragment>
                            {this.props.data.report_items.map((item, index) => (
                                <Fragment>
                                    <tr>
                                        <td>{item.has_beep ?
                                            <p><AntIcon type="credit-card" theme="twoTone"/> {item.member_id}</p> :
                                            <p>{item.member_id}</p>} </td>
                                        <td>{item.member.name}</td>
                                        <td>{item.no_of_beep}</td>
                                        <td className="monetary">{item.beep_total_decimal}</td>
                                        <td>{item.no_of_carwash}</td>
                                        <td className="monetary">{item.carwash_total_decimal}</td>
                                        <td className="monetary"><b>{item.total_transactions_decimal}</b></td>

                                    </tr>
                                </Fragment>
                            ))}
                            <tr>
                                <td><b> Grand Total </b></td>
                                <td className="total-line"><b></b></td>
                                <td className="total-line"><b>{this.props.data.no_of_beep_total}</b></td>
                                <td className="total-line monetary"><b>{this.props.data.beep_grand_total}</b></td>
                                <td className="total-line"><b>{this.props.data.no_of_carwash_total}</b></td>
                                <td className="total-line monetary"><b>{this.props.data.carwash_grand_total}</b></td>
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
export class MemberTransactions extends Component {
    state = {};

    componentDidMount() {
    }

    fetchTransactions() {
        let data = {
            "start_date": this.state.start_date,
            "end_date": this.state.end_date,
        };
        postData('/member_transaction_report/', data).then(data => {
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