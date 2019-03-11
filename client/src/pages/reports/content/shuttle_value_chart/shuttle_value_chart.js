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


const dateFormat = "YYYY-MM-DD";
const Option = Select.Option;


class ComponentToPrint extends React.Component {
    state = {
        data: []
    }

    componentDidMount() {
        console.log(this.props.data);
    }
    renderChart = () => {
          let barChartData = {
            labels: ['Shuttle # 1', 'Shuttle # 2', 'Shuttle # 3', 'Shuttle # 4', 'Shuttle # 5',
                'Shuttle # 6', 'Shuttle # 7', 'Shuttle # 8', 'Shuttle # 9'],
            datasets: [{
                label: 'Shuttle Revenue',
                backgroundColor: '#ff6f74',
                stack: 'Stack 0',
                data: this.props.data.shuttle_revenues

            },
                {
                    label: 'Depreciation',
                    backgroundColor: '#45fad0',
                    stack: 'Stack 1',
                    data: this.props.data.shuttles.shuttle_depreciations
                },
                {
                    label: 'Major Repairs',
                    backgroundColor: '#269680',
                    stack: 'Stack 1',
                    data: this.props.data.shuttles.shuttle_major_repairs
                },
                {
                    label: 'Fuel Costs',
                    backgroundColor: '#114a40',
                    stack: 'Stack 1',
                    data: this.props.data.shuttles.shuttle_fuel_costs
                }
            ]
        }
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
                <div className="report-labels">
                    {this.props.data &&
                    <Fragment>
                        {this.props.data.end_date &&
                        <p> Shuttle Revenue & Cost report for {this.props.data.start_date} to {this.props.data.end_date} </p>
                        }
                    </Fragment>
                    }
                </div>
                <div className="report-body">
                    {this.props.data && this.renderChart()}
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
                        trigger={() => <a href="#">Print this out!</a>}
                        content={() => this.componentRef}
                    />
                    <ComponentToPrint data={this.state.data} ref={el => (this.componentRef = el)}/>
                </div>
            </div>
        );
    }
}