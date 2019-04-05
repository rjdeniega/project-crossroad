/**
 * Created by JasonDeniega on 22/11/2018.
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
import { Icon as AntIcon, Input, Card, Table, DatePicker, Select, Form } from 'antd'
import { getData, postData } from '../../../../network_requests/general'
import { Icon } from 'react-icons-kit'
import { fileTextO } from 'react-icons-kit/fa/fileTextO'
import { money } from 'react-icons-kit/fa/money'
import moment from "moment";
import ReactToPrint from "react-to-print";
import LBATSCLogo from '../../../../images/LBATSCLogo.png'
import YearPicker from "react-year-picker";


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
                        {this.props.data.start_date &&
                        <p><b> Patronage Refund for the year {this.props.data.start_date}</b></p>
                        }
                    </Fragment>
                    }
                </div>
                <div className="report-body">
                    <table cellSpacing="50" cellPadding="3px">
                        <thead>
                        <th>Member ID</th>
                        <th>Name</th>
                        <th>Shares</th>
                        <th>Rate of Refund</th>
                        <th>Patronage Refund (Php)</th>
                        </thead>
                        <tbody>
                        {this.props.data &&
                        <Fragment>
                            {this.props.data.report_items.map((item, index) => (
                                <Fragment>
                                    <tr>
                                        <td>{item.member.id}</td>
                                        <td>{item.member.name}</td>
                                        <td>{item.number_of_shares}</td>
                                        <td>{item.rate_of_refund}</td>
                                        <td className="monetary">{item.patronage_refund}</td>

                                    </tr>
                                </Fragment>
                            ))}
                            <tr>
                                <td><b></b></td>
                                <td><b></b></td>
                                <td><b></b></td>
                                <td><b></b></td>
                                <td className="total-line monetary"><b>
                                    Total : {this.props.data.grand_total}
                                </b></td>

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
export class PatronageRefund extends Component {
    state = {};

    componentDidMount() {
    }

    fetchTransactions() {
        let data = {
            "start_date": this.state.start_date,
            "end_date": this.state.end_date,
            "surplus": this.state.surplus,
        };
        postData('/patronage_refund/', data).then(data => {
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
    handleChange = (event) => {
        this.setState({
            'surplus': event.target.value
        })
    }
    handleYearChange = (date) => {
        this.setState({
            start_date: date,
        }, () => this.fetchTransactions())
    }


    render() {
        return (
            <div className="report-body">
                <Input placeholder="Enter Net Surplus" onChange={this.handleChange}/>
                <Form>
                    <Form.Item label="select year">
                        <YearPicker className="yearpicker" onChange={this.handleYearChange}/>
                    </Form.Item>
                </Form>
                <div className="report-modal-container">
                    <ReactToPrint
                        trigger={() => <Button style={{ 'margin-top': '5px' }} size="small" type="primary">Print
                            Report</Button>}
                        content={() => this.componentRef}
                    />
                    <ComponentToPrint data={this.state.data} ref={el => (this.componentRef = el)}/>
                </div>
            </div>
        );
    }
}