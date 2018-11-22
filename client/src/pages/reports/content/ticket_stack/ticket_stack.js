/**
 * Created by JasonDeniega on 22/11/2018.
 */
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

    renderBar = () => {
        console.log(this.props)

        let barChartData = {
            labels: this.props.dates,
            datasets: [{
                label: 'AM 10',
                backgroundColor: '#3366ff',
                stack: 'Stack 0',
                data: this.props.data.ten_am_stack

            }, {
                label: 'AM 12',
                backgroundColor: '#0033cc',
                stack: 'Stack 0',
                data: this.props.data.twelve_am_stack
            }, {
                label: 'AM 15',
                backgroundColor: '#002080',
                stack: 'Stack 0',
                data: this.props.data.fifteen_am_stack

            },
                {
                    label: 'PM 10',
                    backgroundColor: '#45fad0',
                    stack: 'Stack 1',
                    data: this.props.data.ten_pm_stack
                },
                {
                    label: 'PM 12',
                    backgroundColor: '#269680',
                    stack: 'Stack 1',
                    data: this.props.data.twelve_pm_stack
                },
                {
                    label: 'PM 15',
                    backgroundColor: '#114a40',
                    stack: 'Stack 1',
                    data: this.props.data.fifteen_pm_stack
                }
            ]
        }
        return <Bar data={barChartData} options={{
            title: {
                display: true,
                text: "Weekly Ticket Count for " + this.props.data2.start_date + " to " + this.props.data2.end_date
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
    };

    render() {
        return (
            <div className="container">
                <div className="report-labels">
                    {this.props.data &&
                    <Fragment>
                        {this.props.data.end_date &&
                        <p> Remittance Report for {this.props.data.start_date} to {this.props.data.end_date} </p>
                        }
                    </Fragment>
                    }
                </div>
                <div className="report-body">
                    {this.props.data && this.renderBar()}
                    {/*<div className="chart-wrapper">*/}
                </div>
            </div>
        );
    }
}

export class TicketStack extends Component {
    state = {};

    componentDidMount() {
    }

    fetchTransactions() {
        let data = {
            "start_date": this.state.start_date,
            "end_date": this.state.end_date,
        };
        postData('/tickets_count_report_range/', data).then(data => {
            console.log(data);
            if (!data.error) {
                this.setState({
                    data: data
                }, () => {
                    let ten_am_stack = [];
                    let twelve_am_stack = [];
                    let fifteen_am_stack = [];
                    let ten_pm_stack = [];
                    let twelve_pm_stack = [];
                    let fifteen_pm_stack = [];
                    let pm_stack = [];
                    this.state.data.am_stack.map(item => {
                        ten_am_stack.push(item[0]);
                        twelve_am_stack.push(item[1]);
                        fifteen_am_stack.push(item[2]);
                    })
                    this.state.data.pm_stack.map(item => {
                        ten_pm_stack.push(item[0]);
                        twelve_pm_stack.push(item[1]);
                        fifteen_pm_stack.push(item[2]);
                    });
                    this.setState({
                        start_date: this.state.data.start_date,
                        end_date: this.state.data.end_date,
                        data: {
                            ten_am_stack, twelve_am_stack, fifteen_am_stack,
                            ten_pm_stack, twelve_pm_stack, fifteen_pm_stack,
                        },
                        dates: this.state.data.dates,
                    })
                })
            }
        });


        ;
        // this.state.data.pm_stack.map(item => {
        //         pm_stack.push({
        //                 label: '10 Peso',
        //                 data: [item[0]],
        //                 backgroundColor: '#FAEBCC'
        //             },
        //             {
        //                 label: '12 Peso',
        //                 data: [item[1]],
        //                 backgroundColor: '#FAEBCC' // yellow
        //             },
        //             {
        //                 label: '15 Peso',
        //                 data: [item[2]],
        //                 backgroundColor: '#EBCCD1' // red
        //             })
        //     }
        // );

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
                <div className="report-modal-container">
                    <ReactToPrint
                        trigger={() => <a href="#">Print this out!</a>}
                        content={() => this.componentRef}
                    />
                    <ComponentToPrint
                        dates={this.state.dates}
                        data2={this.state} data={this.state.data} ref={el => (this.componentRef = el)}/>
                </div>
            </div>
        );
    }
}