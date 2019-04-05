/**
 * Created by JasonDeniega on 22/11/2018.
 */
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
import { Icon as AntIcon, Input, Card, Table, DatePicker, Select } from 'antd'
import { getData, postData } from '../../../../network_requests/general'
import { Icon } from 'react-icons-kit'
import { fileTextO } from 'react-icons-kit/fa/fileTextO'
import { money } from 'react-icons-kit/fa/money'
import moment from "moment";
import ReactToPrint from "react-to-print";
import { Line, Bar } from 'react-chartjs-2';
import LBATSCLogo from '../../../../images/LBATSCLogo.png'


const dateFormat = "YYYY-MM-DD";
const Option = Select.Option;


class ComponentToPrint extends React.Component {
    state = {
        data: []
    };


    componentDidMount() {
        console.log(this.props.data);
    }

    renderTable = () => (
        <div className="container">
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
                    <th>Cost + Depr</th>
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
                                    <td className="monetary"><b>{item.cost_depreciation}</b></td>
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
                            <td className="total-line monetary"><b>{this.props.data.grand_cost_depreciation}</b></td>
                            <td className="total-line monetary"><b>{this.props.data.grand_net}</b></td>
                        </tr>
                    </Fragment>
                    }
                    </tbody>
                </table>
                <p className="end-label">END OF REPORT</p>
            </div>
        </div>
    )


    renderChart = () => {
        let barChartData = {
            labels: ['Shuttle # 1', 'Shuttle # 2', 'Shuttle # 3', 'Shuttle # 4', 'Shuttle # 5',
                'Shuttle # 6', 'Shuttle # 7', 'Shuttle # 8', 'Shuttle # 9'],
            datasets: [{
                label: 'Shuttle Revenue',
                backgroundColor: '#00ffac',
                stack: 'Stack 0',
                data: this.props.data.shuttle_revenues

            },
                {
                    label: 'Depreciation',
                    backgroundColor: '#faa89c',
                    stack: 'Stack 1',
                    data: this.props.data.shuttle_depreciations
                },
                {
                    label: 'Major Repairs',
                    backgroundColor: '#cb4047',
                    stack: 'Stack 1',
                    data: this.props.data.shuttle_major_repairs
                },
                {
                    label: 'Fuel Costs',
                    backgroundColor: '#8f1b1f',
                    stack: 'Stack 1',
                    data: this.props.data.shuttle_fuel_costs
                }
            ]
        };
        return <Bar data={barChartData} options={{
            title: {
                display: true,
                text: "Shuttle Revenue Vs Accumulated Cost Chart " + this.props.data.start_date + " to " + this.props.data.end_date
            },
            tooltips: {
                mode: 'index',
                intersect: false
            },
            responsive: true,
            scales: {
                xAxes: [{
                    stacked: true,
                }],
                yAxes: [{
                    stacked: true
                }]
            }
        }}/>
    }

    renderBar = () => {
        const revenue = {
            label: 'Shuttle Revenue',
            data: this.props.data.shuttle_revenues,
            backgroundColor: 'rgba(0, 99, 132, 0.6)',
            borderColor: 'rgba(255,99,132,1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(255,99,132,0.4)',
            hoverBorderColor: 'rgba(255,99,132,1)',
        };

        const costs = {
            label: 'Shuttle Costs',
            data: this.props.data.shuttle_maintenance_costs,
            backgroundColor: 'rgba(255,99,132,0.2)',
            borderColor: 'rgba(255,99,132,1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(255,99,132,0.4)',
            hoverBorderColor: 'rgba(255,99,132,1)',
        };

        let data = {
            labels: ['Shuttle # 1', 'Shuttle # 2', 'Shuttle # 3', 'Shuttle # 4', 'Shuttle # 5',
                'Shuttle # 6', 'Shuttle # 7', 'Shuttle # 8', 'Shuttle # 9'
            ], datasets: [revenue, costs]
        };
        return <Bar data={data}/>
    };

    render() {

        return (
            <div className="container">
                <div className="lbatsc-container">
                    <img className="lbatsc" src={LBATSCLogo}/>
                </div>
                <div className="report-labels">
                    {this.props.data &&
                    <Fragment>
                        {this.props.data.end_date &&
                        <p> Shuttle Value, Revenue & Cost report for {this.props.data.start_date}
                            to {this.props.data.end_date} </p>
                        }
                    </Fragment>
                    }
                </div>
                <div className="report-body">
                    {this.props.data && this.renderChart()}
                    {this.props.data && this.renderTable()}
                    {/*<div className="chart-wrapper">*/}
                </div>
            </div>
        );
    }
}

export class ShuttleValueChart extends Component {
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