/**
 * Created by JasonDeniega on 11/03/2019.
 */
/**
 * Created by JasonDeniega on 11/03/2019.
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
                        {/*{this.props.data &&*/}
                        {/*<p> Remittance Per Year Report for {this.props.data.start_date}</p>*/}
                        {/*}*/}
                    </Fragment>
                    }
                </div>
                <div className="report-body">
                    <table cellSpacing="50" cellPadding="3px">
                        {this.props.data &&
                        <Fragment>
                            <thead>
                            <th></th>
                            <th>{this.props.data.years[3].year}</th>
                            <th>{this.props.data.years[2].year}</th>
                            <th>{this.props.data.years[1].year}</th>
                            <th>{this.props.data.years[0].year}</th>
                            </thead>
                        </Fragment>
                        }
                        <tbody>
                        {this.props.data &&
                        <Fragment>
                            <tr>
                                <td>January</td>
                                <td className="monetary">{this.props.data.years[3].months[0]}</td>
                                <td className="monetary">{this.props.data.years[2].months[0]}</td>
                                <td className="monetary">{this.props.data.years[1].months[0]}</td>
                                <td className="monetary">{this.props.data.years[0].months[0]}</td>
                            </tr>
                            <tr>
                                <td>February</td>
                                <td className="monetary">{this.props.data.years[3].months[1]}</td>
                                <td className="monetary">{this.props.data.years[2].months[1]}</td>
                                <td className="monetary">{this.props.data.years[1].months[1]}</td>
                                <td className="monetary">{this.props.data.years[0].months[1]}</td>
                            </tr>
                            <tr>
                                <td>March</td>
                                <td className="monetary">{this.props.data.years[3].months[2]}</td>
                                <td className="monetary">{this.props.data.years[2].months[2]}</td>
                                <td className="monetary">{this.props.data.years[1].months[2]}</td>
                                <td className="monetary">{this.props.data.years[0].months[2]}</td>
                            </tr>
                            <tr>
                                <td>April</td>
                                <td className="monetary">{this.props.data.years[3].months[3]}</td>
                                <td className="monetary">{this.props.data.years[2].months[3]}</td>
                                <td className="monetary">{this.props.data.years[1].months[3]}</td>
                                <td className="monetary">{this.props.data.years[0].months[3]}</td>
                            </tr>
                            <tr>
                                <td>May</td>
                                <td className="monetary">{this.props.data.years[3].months[4]}</td>
                                <td className="monetary">{this.props.data.years[2].months[4]}</td>
                                <td className="monetary">{this.props.data.years[1].months[4]}</td>
                                <td className="monetary">{this.props.data.years[0].months[4]}</td>
                            </tr>
                            <tr>
                                <td>June</td>
                                <td className="monetary">{this.props.data.years[3].months[5]}</td>
                                <td className="monetary">{this.props.data.years[2].months[5]}</td>
                                <td className="monetary">{this.props.data.years[1].months[5]}</td>
                                <td className="monetary">{this.props.data.years[0].months[5]}</td>
                            </tr>
                            <tr>
                                <td className="monetary">July</td>
                                <td className="monetary">{this.props.data.years[3].months[6]}</td>
                                <td className="monetary">{this.props.data.years[2].months[6]}</td>
                                <td className="monetary">{this.props.data.years[1].months[6]}</td>
                                <td className="monetary">{this.props.data.years[0].months[6]}</td>
                            </tr>
                            <tr>
                                <td>August</td>
                                <td className="monetary">{this.props.data.years[3].months[7]}</td>
                                <td className="monetary">{this.props.data.years[2].months[7]}</td>
                                <td className="monetary">{this.props.data.years[1].months[7]}</td>
                                <td className="monetary">{this.props.data.years[0].months[7]}</td>
                            </tr>
                            <tr>
                                <td>September</td>
                                <td className="monetary">{this.props.data.years[3].months[8]}</td>
                                <td className="monetary">{this.props.data.years[2].months[8]}</td>
                                <td className="monetary">{this.props.data.years[1].months[8]}</td>
                                <td className="monetary">{this.props.data.years[0].months[8]}</td>
                            </tr>
                            <tr>
                                <td>October</td>
                                <td className="monetary">{this.props.data.years[3].months[9]}</td>
                                <td className="monetary">{this.props.data.years[2].months[9]}</td>
                                <td className="monetary">{this.props.data.years[1].months[9]}</td>
                                <td className="monetary">{this.props.data.years[0].months[9]}</td>
                            </tr>
                            <tr>
                                <td>November</td>
                                <td className="monetary">{this.props.data.years[3].months[10]}</td>
                                <td className="monetary">{this.props.data.years[2].months[10]}</td>
                                <td className="monetary">{this.props.data.years[1].months[10]}</td>
                                <td className="monetary">{this.props.data.years[0].months[10]}</td>
                            </tr>
                            <tr>
                                <td>December</td>
                                <td className="monetary">{this.props.data.years[3].months[11]}</td>
                                <td className="monetary">{this.props.data.years[2].months[11]}</td>
                                <td className="monetary">{this.props.data.years[1].months[11]}</td>
                                <td className="monetary">{this.props.data.years[0].months[11]}</td>
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
export class RemittancePerYear extends Component {
    state = {};

    componentDidMount() {
    }

    fetchTransactions() {
        let data = {
            "start_date": this.state.start_date,
            "end_date": this.state.end_date,
        };
        postData('/remittance_per_year/', data).then(data => {
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
                <DatePicker.MonthPicker placeholder="date from" onChange={this.handleStartDateChange}
                                        format={dateFormat}/>
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