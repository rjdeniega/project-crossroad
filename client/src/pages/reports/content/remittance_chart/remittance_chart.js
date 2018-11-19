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
import { Chart } from "react-charts";

const dateFormat = "YYYY-MM-DD";
const Option = Select.Option;


class ComponentToPrint extends React.Component {
    componentDidMount() {
        console.log(this.props.data)
    }

    render() {
        const options = {
            animationEnabled: true,
            exportEnabled: true,
            theme: "light2", // "light1", "dark1", "dark2"
            title: {
                text: "Bounce Rate by Week of Year"
            },
            axisY: {
                title: "Bounce Rate",
                includeZero: false,
                suffix: "%"
            },
            axisX: {
                title: "Week of Year",
                prefix: "W",
                interval: 2
            },
            data: [{
                type: "line",
                toolTipContent: "Week {x}: {y}%",
                dataPoints: [
                    { x: 1, y: 64 },
                    { x: 2, y: 61 },
                    { x: 3, y: 64 },
                    { x: 4, y: 62 },
                    { x: 5, y: 64 },
                    { x: 6, y: 60 },
                    { x: 7, y: 58 },
                    { x: 8, y: 59 },
                    { x: 9, y: 53 },
                    { x: 10, y: 54 },
                    { x: 11, y: 61 },
                    { x: 12, y: 60 },
                    { x: 13, y: 55 },
                    { x: 14, y: 60 },
                    { x: 15, y: 56 },
                    { x: 16, y: 60 },
                    { x: 17, y: 59.5 },
                    { x: 18, y: 63 },
                    { x: 19, y: 58 },
                    { x: 20, y: 54 },
                    { x: 21, y: 59 },
                    { x: 22, y: 64 },
                    { x: 23, y: 59 }
                ]
            }]
        }
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
                    <div className="chart-wrapper">

                    </div>
                </div>
            </div>
        );
    }
}
export class RemittanceChart extends Component {
    state = {};

    componentDidMount() {
    }

    fetchTransactions() {
        let data = {
            "start_date": this.state.start_date,
            "end_date": this.state.end_date,
        };
        postData('/remittance_versus_fuel/', data).then(data => {
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
    options = [
        {
            label: "Series 1",
            data: [{ x: 1, y: 10 }, { x: 2, y: 10 }, { x: 3, y: 10 }]
        },
        {
            label: "Series 2",
            data: [{ x: 1, y: 10 }, { x: 2, y: 10 }, { x: 3, y: 10 }]
        },
        {
            label: "Series 3",
            data: [{ x: 1, y: 10 }, { x: 2, y: 10 }, { x: 3, y: 10 }]
        }
    ];


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
                    <ComponentToPrint data={this.options} ref={el => (this.componentRef = el)}/>
                </div>
            </div>
        );
    }
}