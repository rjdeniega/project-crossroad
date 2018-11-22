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
    state = {
        day1: 0,
        day2: 0,
        day3: 0,
        day4: 0,
        day5: 0,
        day6: 0,
        day7: 0,
    }

    computeTotal = (index) => {
        if (this.props.data) {
            let value = 0;
            this.props.data.shuttles.map(shuttle => {
                value += shuttle.days[index].am_count + shuttle.days[index].pm_count
            });
            return value
        }
    };

    computeGrandTotal = (startindex, endindex) => {
        let grand_total = 0;
        while (startindex <= endindex) {
            grand_total += this.computeTotal(startindex)
            startindex++;
        }
        return grand_total;
    }

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
                    {this.props.data &&
                    <Fragment>
                        <p className="week-label"><b>Week 1</b></p>
                        <table cellSpacing="50" cellPadding="3px">
                            {this.props.data &&
                            <thead>
                            <th>Shuttle #</th>
                            <th>Shift</th>
                            <th>{this.props.data.shuttles[0].days[0].day}</th>
                            <th>{this.props.data.shuttles[0].days[1].day}</th>
                            <th>{this.props.data.shuttles[0].days[2].day}</th>
                            <th>{this.props.data.shuttles[0].days[3].day}</th>
                            <th>{this.props.data.shuttles[0].days[4].day}</th>
                            <th>{this.props.data.shuttles[0].days[5].day}</th>
                            <th>{this.props.data.shuttles[0].days[6].day}</th>
                            <th>Total</th>
                            </thead>
                            }
                            <tbody>
                            {this.props.data &&
                            <Fragment>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td className="report-date-label">{this.props.data.shuttles[0].days[0].date}</td>
                                    <td className="report-date-label">{this.props.data.shuttles[0].days[1].date}</td>
                                    <td className="report-date-label">{this.props.data.shuttles[0].days[2].date}</td>
                                    <td className="report-date-label">{this.props.data.shuttles[0].days[3].date}</td>
                                    <td className="report-date-label">{this.props.data.shuttles[0].days[4].date}</td>
                                    <td className="report-date-label">{this.props.data.shuttles[0].days[5].date}</td>
                                    <td className="report-date-label">{this.props.data.shuttles[0].days[6].date}</td>
                                </tr>
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
                                            <td>
                                                {
                                                    item.days[0].am_count +
                                                    item.days[1].am_count +
                                                    item.days[2].am_count +
                                                    item.days[3].am_count +
                                                    item.days[4].am_count +
                                                    item.days[5].am_count +
                                                    item.days[6].am_count
                                                }
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
                                            <td>
                                                {
                                                    item.days[0].pm_count +
                                                    item.days[1].pm_count +
                                                    item.days[2].pm_count +
                                                    item.days[3].pm_count +
                                                    item.days[4].pm_count +
                                                    item.days[5].pm_count +
                                                    item.days[6].pm_count
                                                }
                                            </td>
                                        </tr>
                                    </Fragment>
                                ))}
                            </Fragment>
                            }
                            <tr>
                                <td><b> Grand Total </b></td>
                                <td className="total-line"></td>
                                <td className="total-line"><b>
                                    <td>
                                        {this.computeTotal(0)}
                                    </td>
                                </b></td>
                                <td className="total-line"><b>
                                    <td>
                                        {this.computeTotal(1)}
                                    </td>
                                </b></td>
                                <td className="total-line"><b>
                                    <td>
                                        {this.computeTotal(2)}
                                    </td>
                                </b></td>
                                <td className="total-line"><b>
                                    <td>
                                        {this.computeTotal(3)}
                                    </td>
                                </b></td>
                                <td className="total-line"><b>
                                    <td>
                                        {this.computeTotal(4)}
                                    </td>
                                </b></td>
                                <td className="total-line"><b>
                                    <td>
                                        {this.computeTotal(5)}
                                    </td>
                                </b></td>
                                <td className="total-line"><b>
                                    <td>
                                        {this.computeTotal(6)}
                                    </td>
                                </b></td>
                                <td className="total-line"><b>
                                    <td>
                                        {this.computeGrandTotal(0, 6)}
                                    </td>
                                </b></td>

                            </tr>
                            </tbody>
                        </table>
                        {/*second table*/}
                        <p className="week-label"><b>Week 2</b></p>
                        {/*<table cellSpacing="50" cellPadding="3px">*/}
                            {/*{this.props.data &&*/}
                            {/*<thead>*/}
                            {/*<th>Shuttle #</th>*/}
                            {/*<th>Shift #</th>*/}
                            {/*<th>{this.props.data.shuttles[0].days[7].day}</th>*/}
                            {/*<th>{this.props.data.shuttles[0].days[8].day}</th>*/}
                            {/*<th>{this.props.data.shuttles[0].days[9].day}</th>*/}
                            {/*<th>{this.props.data.shuttles[0].days[10].day}</th>*/}
                            {/*<th>{this.props.data.shuttles[0].days[11].day}</th>*/}
                            {/*<th>{this.props.data.shuttles[0].days[12].day}</th>*/}
                            {/*<th>{this.props.data.shuttles[0].days[13].day}</th>*/}
                            {/*<th>Total</th>*/}
                            {/*</thead>*/}
                            {/*}*/}
                            {/*<tbody>*/}
                            {/*{this.props.data &&*/}
                            {/*<Fragment>*/}
                                 {/*<tr>*/}
                                    {/*<td></td>*/}
                                    {/*<td></td>*/}
                                    {/*<td className="report-date-label">{this.props.data.shuttles[7].days[0].date}</td>*/}
                                    {/*<td className="report-date-label">{this.props.data.shuttles[8].days[1].date}</td>*/}
                                    {/*<td className="report-date-label">{this.props.data.shuttles[9].days[2].date}</td>*/}
                                    {/*<td className="report-date-label">{this.props.data.shuttles[10].days[3].date}</td>*/}
                                    {/*<td className="report-date-label">{this.props.data.shuttles[11].days[4].date}</td>*/}
                                    {/*<td className="report-date-label">{this.props.data.shuttles[12].days[5].date}</td>*/}
                                    {/*<td className="report-date-label">{this.props.data.shuttles[13].days[6].date}</td>*/}
                                {/*</tr>*/}
                                {/*{this.props.data.shuttles.map((item, index) => (*/}
                                    {/*<Fragment>*/}
                                        {/*<tr>*/}
                                            {/*<td>{item.shuttle_number}</td>*/}
                                        {/*</tr>*/}
                                        {/*<tr>*/}
                                            {/*<td></td>*/}
                                            {/*<td>*/}
                                                {/*AM*/}
                                            {/*</td>*/}
                                            {/*<td>*/}
                                                {/*{item.days[7].am_count}*/}
                                            {/*</td>*/}
                                            {/*<td>*/}
                                                {/*{item.days[8].am_count}*/}
                                            {/*</td>*/}
                                            {/*<td>*/}
                                                {/*{item.days[9].am_count}*/}
                                            {/*</td>*/}
                                            {/*<td>*/}
                                                {/*{item.days[10].am_count}*/}
                                            {/*</td>*/}
                                            {/*<td>*/}
                                                {/*{item.days[11].am_count}*/}
                                            {/*</td>*/}
                                            {/*<td>*/}
                                                {/*{item.days[12].am_count}*/}
                                            {/*</td>*/}
                                            {/*<td>*/}
                                                {/*{item.days[13].am_count}*/}
                                            {/*</td>*/}
                                            {/*<td>*/}
                                                {/*{*/}
                                                    {/*item.days[7].am_count +*/}
                                                    {/*item.days[8].am_count +*/}
                                                    {/*item.days[9].am_count +*/}
                                                    {/*item.days[10].am_count +*/}
                                                    {/*item.days[11].am_count +*/}
                                                    {/*item.days[12].am_count +*/}
                                                    {/*item.days[13].am_count*/}
                                                {/*}*/}
                                            {/*</td>*/}
                                        {/*</tr>*/}
                                        {/*<tr>*/}
                                            {/*<td></td>*/}
                                            {/*<td>*/}
                                                {/*PM*/}
                                            {/*</td>*/}

                                            {/*<td>*/}
                                                {/*{item.days[7].pm_count}*/}
                                            {/*</td>*/}
                                            {/*<td>*/}
                                                {/*{item.days[8].pm_count}*/}
                                            {/*</td>*/}
                                            {/*<td>*/}
                                                {/*{item.days[9].pm_count}*/}
                                            {/*</td>*/}
                                            {/*<td>*/}
                                                {/*{item.days[10].pm_count}*/}
                                            {/*</td>*/}
                                            {/*<td>*/}
                                                {/*{item.days[11].pm_count}*/}
                                            {/*</td>*/}
                                            {/*<td>*/}
                                                {/*{item.days[12].pm_count}*/}
                                            {/*</td>*/}
                                            {/*<td>*/}
                                                {/*{item.days[13].pm_count}*/}
                                            {/*</td>*/}
                                            {/*<td>*/}
                                                {/*{*/}
                                                    {/*item.days[7].pm_count +*/}
                                                    {/*item.days[8].pm_count +*/}
                                                    {/*item.days[9].pm_count +*/}
                                                    {/*item.days[10].pm_count +*/}
                                                    {/*item.days[11].pm_count +*/}
                                                    {/*item.days[12].pm_count +*/}
                                                    {/*item.days[13].pm_count*/}
                                                {/*}*/}
                                            {/*</td>*/}
                                        {/*</tr>*/}
                                    {/*</Fragment>*/}
                                {/*))}*/}
                            {/*</Fragment>*/}
                            {/*}*/}
                            {/*<tr>*/}
                                {/*<td><b> Grand Total </b></td>*/}
                                {/*<td className="total-line"></td>*/}
                                {/*<td className="total-line"><b>*/}
                                    {/*<td>*/}
                                        {/*{this.computeTotal(7)}*/}
                                    {/*</td>*/}
                                {/*</b></td>*/}
                                {/*<td className="total-line"><b>*/}
                                    {/*<td>*/}
                                        {/*{this.computeTotal(8)}*/}
                                    {/*</td>*/}
                                {/*</b></td>*/}
                                {/*<td className="total-line"><b>*/}
                                    {/*<td>*/}
                                        {/*{this.computeTotal(9)}*/}
                                    {/*</td>*/}
                                {/*</b></td>*/}
                                {/*<td className="total-line"><b>*/}
                                    {/*<td>*/}
                                        {/*{this.computeTotal(10)}*/}
                                    {/*</td>*/}
                                {/*</b></td>*/}
                                {/*<td className="total-line"><b>*/}
                                    {/*<td>*/}
                                        {/*{this.computeTotal(11)}*/}
                                    {/*</td>*/}
                                {/*</b></td>*/}
                                {/*<td className="total-line"><b>*/}
                                    {/*<td>*/}
                                        {/*{this.computeTotal(12)}*/}
                                    {/*</td>*/}
                                {/*</b></td>*/}
                                {/*<td className="total-line"><b>*/}
                                    {/*<td>*/}
                                        {/*{this.computeTotal(13)}*/}
                                    {/*</td>*/}
                                {/*</b></td>*/}
                                {/*<td className="total-line"><b>*/}
                                    {/*<td>*/}
                                        {/*{this.computeGrandTotal(7, 13)}*/}
                                    {/*</td>*/}
                                {/*</b></td>*/}
                            {/*</tr>*/}
                            {/*</tbody>*/}
                        {/*</table>*/}
                    </Fragment>
                    }
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