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
import { Icon as AntIcon, Input, Card, Table, DatePicker, Select, Form, Radio } from 'antd'
import { getData, postData } from '../../../../network_requests/general'
import { Icon } from 'react-icons-kit'
import { fileTextO } from 'react-icons-kit/fa/fileTextO'
import { money } from 'react-icons-kit/fa/money'
import moment from "moment";
import ReactToPrint from "react-to-print";
import { Line } from 'react-chartjs-2';
import LBATSCLogo from '../../../../images/LBATSCLogo.png'


const dateFormat = "YYYY-MM-DD";
const Option = Select.Option;
const MonthPicker = DatePicker.MonthPicker
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
    },
};

class ComponentToPrint extends React.Component {
    componentDidMount() {
        console.log(this.props.data)
    }

    renderChart = () => {
        console.log(this.props.data);
        const data = {
            labels: this.props.data.days,
            datasets: [
                {
                    label: "Main Road",
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: 'red',
                    borderColor: 'red',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: 'red',
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'red',
                    pointHoverBorderColor: 'red',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: this.props.data.main_road_values,
                },
                {
                    label: "Kaliwa",
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: 'rgba(75,192,192,0.4)',
                    borderColor: 'rgba(75,192,192,1)',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: 'rgba(75,192,192,1)',
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                    pointHoverBorderColor: 'rgba(220,220,220,1)',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: this.props.data.kaliwa_values,
                },
                {
                    label: "Kanan",
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: 'blue',
                    borderColor: 'blue',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: 'blue',
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'blue',
                    pointHoverBorderColor: 'blue',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: this.props.data.kanan_values,
                },
            ]
        };
        return <Line data={data} options={{

        }}/>

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
                        <p> Remittance Report for {this.props.data.start_date} to {this.props.data.end_date} </p>
                        }
                    </Fragment>
                    }
                </div>
                <div className="report-body">
                    {/*<div className="chart-wrapper">*/}
                    {this.props.data &&
                    this.renderChart()
                    }
                </div>
            </div>
        );
    }
}
export class RemittanceChart extends Component {
    state = {
        interval: "day"
    };

    componentDidMount() {
    }

    fetchTransactions() {
        let data = {
            "start_date": this.state.start_date,
            "end_date": this.state.end_date,
            "interval": this.state.interval,
        };
        postData('/remittance_for_the_month/', data).then(data => {
            console.log(data);
            if (!data.error) {
                this.setState({
                    data: data
                })
            }
        });
    }

    handleSelectChange = fieldName => value => {
        // this function is to handle drop-downs
        const state = { ...this.state };
        state[fieldName] = value;
        this.setState({
            ...state
        });
    };

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
    onChange = (e) => {
        this.setState({
            interval: e.target.value
        })
        console.log(`radio checked:${e.target.value}`);
    }


    render() {

        return (
            <div className="report-body">
                <Form>
                    <Form.Item
                        {...formItemLayout}
                        label="Select Time Interval"
                    >
                        <RadioGroup onChange={this.onChange} defaultValue="add">
                            <RadioButton value="day">Day</RadioButton>
                            <RadioButton value="week">Week</RadioButton>
                            <RadioButton value="month">Month</RadioButton>
                            <RadioButton value="quarter">Quarter</RadioButton>
                            <RadioButton value="year">Year</RadioButton>
                        </RadioGroup>
                    </Form.Item>
                    {this.state.interval == "day" &&
                    <Fragment>
                        <Form.Item
                            {...formItemLayout}
                            label="Select Start Date"
                        >
                            <DatePicker placeholder="date from" onChange={this.handleStartDateChange}
                                        format={dateFormat}/>
                        </Form.Item>
                        < Form.Item
                            {...formItemLayout}
                            label="Select End Date"
                        >
                            <DatePicker placeholder="date to" onChange={this.handleEndDateChange} format={dateFormat}/>
                        </Form.Item>
                    </Fragment>
                    }
                    {(this.state.interval == "week" || this.state.interval == "month" || this.state.interval == "year" || this.state.interval == "quarter") &&
                    <Fragment>
                        <Form.Item
                            {...formItemLayout}
                            label="Select Month/Year"
                        >
                            <MonthPicker placeholder="date from" onChange={this.handleStartDateChange}
                                         format={dateFormat}/>
                        </Form.Item>
                    </Fragment>
                    }


                </Form>

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