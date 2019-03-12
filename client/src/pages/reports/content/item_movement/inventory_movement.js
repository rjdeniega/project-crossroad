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
import { Line, Bar } from 'react-chartjs-2';



const dateFormat = "YYYY-MM-DD";
const Option = Select.Option;

class ComponentToPrint extends React.Component {
    renderChart = () => {
        let barChartData = {
            labels: this.props.data.categories,
            datasets: [{
                label: 'Bought',
                backgroundColor: '#ff6f74',
                stack: 'Stack 0',
                data: this.props.data.bought

            },
                {
                    label: 'Used',
                    backgroundColor: '#45fad0',
                    stack: 'Stack 1',
                    data: this.props.data.get
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

    render() {
        const { data } = this.props;
        return (
            <div className="container">
                <div className="report-labels">
                    {this.props.data &&
                    <Fragment>
                        {this.props.data.end_date &&
                        <p> Shuttle Revenue & Cost report for {this.props.data.start_date}
                            to {this.props.data.end_date} </p>
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
        postData('/inventory/item_movement_report', data).then(data => {
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