/**
 * Created by JasonDeniega on 19/11/2018.
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
import { Icon as AntIcon, Input, Card, Table, DatePicker, Select , Form, Radio} from 'antd'
import { getData, postData } from '../../../../network_requests/general'
import { Icon } from 'react-icons-kit'
import { fileTextO } from 'react-icons-kit/fa/fileTextO'
import { money } from 'react-icons-kit/fa/money'
import moment from "moment";
import ReactToPrint from "react-to-print";
import LBATSCLogo from '../../../../images/LBATSCLogo.png'
import YearPicker from "react-year-picker";

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const dateFormat = "YYYY-MM-DD";
const Option = Select.Option;


class ComponentToPrint extends React.Component {
    render() {
        return (
            <div className="container">
                <div className="lbatsc-container">
                    <img className="lbatsc" src={LBATSCLogo}/>
                </div>
                <div className="report-labels">
                    {this.props.data &&
                    <Fragment>
                        {this.props.data &&
                        <Fragment>
                            <p><b> Shares Accumulation Report for {this.props.data.year}</b></p>
                        </Fragment>
                        }
                    </Fragment>
                    }
                </div>
                {this.props.data &&
                <Fragment>
                    <div className="tag-div">
                        <p style={{ 'margin-right': '7px' }}><b> Tags: </b></p>
                        <AntIcon type="warning" theme="twoTone"
                                 twoToneColor="#eb2f96"/>
                        <p>Not enough accumulated shares</p>
                    </div>
                </Fragment>
                }
                <div className="report-body">
                    <table cellSpacing="50" cellPadding="3px">
                        <thead>
                        <th>Member</th>
                        <th>Date Accepted</th>
                        <th>Initial</th>
                        <th>Jan</th>
                        <th>Feb</th>
                        <th>Mar</th>
                        <th>Apr</th>
                        <th>May</th>
                        <th>Jun</th>
                        <th>Jul</th>
                        <th>Aug</th>
                        <th>Sep</th>
                        <th>Oct</th>
                        <th>Nov</th>
                        <th>Dec</th>
                        <th>Accumulated</th>
                        <th>Total</th>
                        </thead>
                        <tbody>
                        {this.props.data &&
                        <Fragment>
                            {this.props.data.members.map((item, index) => (
                                <Fragment>
                                    <tr>
                                        <td>{item.name}</td>
                                        <td>{item.accepted_date}</td>
                                        <td><b>{item.prior_shares}</b></td>
                                        <td>{item.months[0].added_amount}</td>
                                        <td>{item.months[1].added_amount}</td>
                                        <td>{item.months[2].added_amount}</td>
                                        <td>{item.months[3].added_amount}</td>
                                        <td>{item.months[4].added_amount}</td>
                                        <td>{item.months[5].added_amount}</td>
                                        <td>{item.months[6].added_amount}</td>
                                        <td>{item.months[7].added_amount}</td>
                                        <td>{item.months[8].added_amount}</td>
                                        <td>{item.months[9].added_amount}</td>
                                        <td>{item.months[10].added_amount}</td>
                                        <td>{item.months[11].added_amount}</td>
                                        <td><b>{item.accumulated_shares}</b></td>
                                        <td><b>{(item.total_shares < 50 && !item.is_new) ?
                                            <p><AntIcon type="warning" theme="twoTone"
                                                        twoToneColor="#eb2f96"/> {item.total_shares}
                                            </p> : item.total_shares }</b></td>
                                    </tr>
                                </Fragment>
                            ))}

                            <tr>
                                <td><b> Grand Total </b></td>
                                <td className="total-line"></td>
                                <td className="total-line"><b>{this.props.data.prev_total}</b></td>
                                <td className="total-line"><b>{this.props.data.months_sum[0]}</b></td>
                                <td className="total-line"><b>{this.props.data.months_sum[1]}</b></td>
                                <td className="total-line"><b>{this.props.data.months_sum[2]}</b></td>
                                <td className="total-line"><b>{this.props.data.months_sum[3]}</b></td>
                                <td className="total-line"><b>{this.props.data.months_sum[4]}</b></td>
                                <td className="total-line"><b>{this.props.data.months_sum[5]}</b></td>
                                <td className="total-line"><b>{this.props.data.months_sum[6]}</b></td>
                                <td className="total-line"><b>{this.props.data.months_sum[7]}</b></td>
                                <td className="total-line"><b>{this.props.data.months_sum[8]}</b></td>
                                <td className="total-line"><b>{this.props.data.months_sum[9]}</b></td>
                                <td className="total-line"><b>{this.props.data.months_sum[10]}</b></td>
                                <td className="total-line"><b>{this.props.data.months_sum[11]}</b></td>
                                <td className="total-line"><b>{this.props.data.acc_total}</b></td>
                                <td className="total-line"><b>{this.props.data.grand_total}</b></td>
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


export class SharesAccumulationReport extends Component {
    state = {
        filter:"name"
    };

    componentDidMount() {
    }

    fetchTransactions() {
        let data = {
            start_date: this.state.start_date,
            filter: this.state.filter,
        };
        postData('/accumulated_shares_report/', data).then(data => {
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

    handleChange = (date) => {
        this.setState({
            year: date,
        }, () => this.fetchTransactions())
    }
    handleYearChange = (date) => {
        this.setState({
            start_date: date,
        }, () => this.fetchTransactions())
    }
    onChange = (e) => {
        this.setState({
            filter: e.target.value
        }, () => this.fetchTransactions())
        console.log(`radio checked:${e.target.value}`);
    }

    render() {
        return (
            <div className="report-body">
                {/*<DatePicker placeholder="date from" onChange={this.handleStartDateChange} format={dateFormat}/>*/}
                <Form>
                    <Form.Item label="select year">
                        <YearPicker className="yearpicker" onChange={this.handleYearChange}/>
                    </Form.Item>
                    <Form.Item label="Sort by">
                        <RadioGroup size="small" onChange={this.onChange} defaultValue="add">
                            <RadioButton value="name">Name</RadioButton>
                            <RadioButton value="date">Application Date</RadioButton>
                        </RadioGroup>
                    </Form.Item>
                </Form>
                <div className="report-modal-container">
                    <ReactToPrint
                        trigger={() => <Button style={{'margin-top': '5px'}} size="small" type="primary">Print Report</Button>}
                        content={() => this.componentRef}
                    />
                    <ComponentToPrint data={this.state.data} ref={el => (this.componentRef = el)}/>
                </div>
            </div>
        );
    }
}