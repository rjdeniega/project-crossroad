/**
 * Created by JasonDeniega on 07/03/2019.
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
import { Icon as AntIcon, Input, Card, Table, DatePicker, Select, Row, Col, Radio } from 'antd'
import { getData, postData } from '../../../../network_requests/general'
import { Icon } from 'react-icons-kit'
import { fileTextO } from 'react-icons-kit/fa/fileTextO'
import { money } from 'react-icons-kit/fa/money'
import moment from "moment";
import ReactToPrint from "react-to-print";
import { Line } from 'react-chartjs-2';


const dateFormat = "YYYY-MM-DD";
const Option = Select.Option;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;


class ComponentToPrint extends React.Component {
    componentDidMount() {
        console.log(this.props.data)
    }

    renderChart = () => {
        console.log(this.props.data);
        const data = {
            labels: ["12AM", "1AM", "2AM", "3AM", "4AM", "5AM", "6AM", "7AM", "8AM", "9AM",
                "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM",
                "10PM", "11PM"
            ],
            datasets: [
                {
                    label: "Main Road",
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
                    data: this.props.data.week1_main_road_values,
                },
                {
                    label: "Kaliwa",
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
                    data: this.props.data.week1_kaliwa_values,
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
                    data: this.props.data.week1_kanan_values,
                },
            ]
        };
        return <Line data={data} options={{
            title: {
                display: true,
                text: "Week 1 "
            }
        }}/>

    };
    renderChart2 = () => {
        console.log(this.props.data);
        const data = {
            labels: ["12AM", "1AM", "2AM", "3AM", "4AM", "5AM", "6AM", "7AM", "8AM", "9AM",
                "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM",
                "10PM", "11PM"
            ],
            datasets: [
                {
                    label: "Main Road",
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
                    data: this.props.data.week2_main_road_values,
                },
                {
                    label: "Kaliwa",
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
                    data: this.props.data.week2_kaliwa_values,
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
                    data: this.props.data.week2_kanan_values,
                },
            ]
        };
        return <Line data={data} options={{
            title: {
                display: true,
                text: "Week 2 "
            }
        }}/>

    };
    renderChart3 = () => {
        console.log(this.props.data);
        const data = {
            labels: ["12AM", "1AM", "2AM", "3AM", "4AM", "5AM", "6AM", "7AM", "8AM", "9AM",
                "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM",
                "10PM", "11PM"
            ],
            datasets: [
                {
                    label: "Main Road",
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
                    data: this.props.data.week3_main_road_values,
                },
                {
                    label: "Kaliwa",
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
                    data: this.props.data.week3_kaliwa_values,
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
                    data: this.props.data.week3_kanan_values,
                },
            ]
        };
        return <Line data={data} options={{
            title: {
                display: true,
                text: "Week 3"
            }
        }}/>

    };
    renderChart4 = () => {
        console.log(this.props.data);
        const data = {
            labels: ["12AM", "1AM", "2AM", "3AM", "4AM", "5AM", "6AM", "7AM", "8AM", "9AM",
                "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM",
                "10PM", "11PM"
            ],
            datasets: [
                {
                    label: "Main Road",
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
                    data: this.props.data.week4_main_road_values,
                },
                {
                    label: "Kaliwa",
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
                    data: this.props.data.week4_kaliwa_values,
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
                    data: this.props.data.week4_kanan_values,
                },
            ]
        };
        return <Line data={data} options={{
            title: {
                display: true,
                text: "Week 4 "
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
                        <p> Weekly Peak Hours from {this.props.data.start_date} to {this.props.data.end_date} </p>
                        }
                    </Fragment>
                    }
                </div>
                <div className="report-body">
                    {/*<div className="chart-wrapper">*/}
                    {this.props.data &&
                    <Fragment>
                        <Row>
                            <Col span={this.props.size}>
                                {this.renderChart()}
                            </Col>
                            <Col span={this.props.size}>
                                {this.renderChart2()}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={this.props.size}>
                                {this.renderChart3()}
                            </Col>
                            <Col span={this.props.size}>
                                {this.renderChart4()}
                            </Col>
                        </Row>
                    </Fragment>
                    }
                </div>
            </div>
        );
    }
}
export class PeakHours extends Component {
    state = {
        size : 12
    };

    componentDidMount() {
        this.fetchTransactions()
    }

    fetchTransactions() {
        let data = {
            "start_date": this.state.start_date,
        };
        postData('/peak_hours/', JSON.stringify(data)).then(data => {
            console.log(data);
            if (!data.error) {
                this.setState({
                    data: data
                })
            }
        });
    }

    handleStartDateChange = (date, dateString) => {
        console.log(dateString);
        console.log(date);
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
    handleSizeChange = (e) => {
        if(e.target.value == "small"){
            this.setState({ size: 12 });
        }else{
            this.setState({ size: 24 });
        }

    }

    render() {

        return (
            <div className="report-body">
                <DatePicker placeholder="date from" onChange={this.handleStartDateChange} format={dateFormat}/>
                <Radio.Group onChange={this.handleSizeChange}>
                    <Radio.Button value="small">Small</Radio.Button>
                    <Radio.Button value="large">Large</Radio.Button>
                </Radio.Group>
                <div className="report-modal-container">
                    <ReactToPrint
                        trigger={() => <a href="#">Print this out!</a>}
                        content={() => this.componentRef}
                    />
                    <ComponentToPrint size={this.state.size} data={this.state.data} ref={el => (this.componentRef = el)}/>
                </div>
            </div>
        );
    }
}