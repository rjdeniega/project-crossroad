import React, { Fragment } from 'react';
import moment from 'moment';

import { postData } from '../../../../network_requests/general';
import './style.css';

import { Select, Divider, DatePicker, Pagination } from 'antd';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

Date.prototype.minusDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() - days);
    return date;
}

export class PassengerPerRoute extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            "chart_data": [],
            "start_date": null,
            "end_date": null,
            "start": 1
        };

        this.fetchChartData = this.fetchChartData.bind(this);
        this.onDateChange = this.onDateChange.bind(this);
    }

    componentDidMount() {
        let dt = new Date();
        dt.setDate(dt.getDate() - 6);
        this.fetchChartData(dt);
    }

    fetchChartData(date) {
        let start_date = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        console.log(start_date);
        let request = { "start_date": start_date };
        console.log("fetching this date: " + date);

        let to_date = date;
        console.log(to_date);
        to_date = to_date.addDays(6);
        console.log(to_date);
        let end_date = to_date.getFullYear() + "-" + (to_date.getMonth() + 1) + "-" + to_date.getDate();

        console.log(start_date, " - ", end_date);

        this.setState({
            start_date: start_date,
            end_date: end_date
        })

        // Add data
        postData('passenger_per_route/', request)
            .then(data => {
                if (!data.error) {
                    this.setState({
                        chart_data: data.values
                    });
                    console.log(this.state.chart_data);
                }
            });
    }

    fetchTransactions(date) {
        let start_date = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        console.log(start_date);
        let request = { "start_date": start_date };
        console.log("fetching this date: " + date);

        let to_date = date;
        console.log(to_date);
        to_date = to_date.addDays(6);
        console.log(to_date);
        let end_date = to_date.getFullYear() + "-" + (to_date.getMonth() + 1) + "-" + to_date.getDate();
        console.log(date);
        let data = {
            "start_date": start_date,
            "end_date": end_date,
        };
        postData('ticket_type_per_day/', data).then(data => {
            console.log(data);
            if (!data.error) {
               console.log(data);
            console.log(data.days.length);
            let length = Math.round(data.days.length);

            if (!data.error) {
                this.setState({
                    original_data: data,
                    data:data,
                });
                if (data.days.length < 2) {
                    this.setState({
                        data: data,
                        length: length * 10,
                    })
                }
                else {
                    let new_data = {...data};
                    new_data.days = this.changeContents([...this.state.original_data.days]);
                    console.log(new_data);
                    this.setState({
                        data: new_data,
                        length: length * 10,
                    });
                    console.log(this.state.original_data)
                }
            }
            }
        });
    }

    onDateChange = (date) => {
        console.log("entered onDateChange: " + date)
        this.fetchChartData(date);
        this.fetchTransactions(date)
    }
    handlePagination = (current) => {
        let new_array = {...this.state.original_data};
        this.setState({
            start: current
        }, () => {
            new_array.days = this.changeContents([...this.state.original_data.days]);
            console.log(new_array.days);
            this.setState({
                data: new_array
            })
        })
        console.log(this.state.data)
    }

    changeContents = (array) => {
        console.log(this.state.start);
        let index = this.state.start - 1;
        let new_array = [];
        new_array.push(array[index]);
        return new_array;
    }
    renderTable = () => (
        <div className="formatted-container">
            <div className="report-labels">
                {this.state.data &&
                <Fragment>
                    {this.state.data.start_date &&
                    <p> Ticket Count Report for {this.state.data.start_date}</p>
                    }
                </Fragment>
                }
            </div>
            <div className="formatted-report-body">
                {this.state.data &&
                <table className="ticket-day-table" cellSpacing="50" cellPadding="3px">
                    <thead>
                    <th>Date</th>
                    <th>Shuttle</th>
                    <th>Route</th>
                    <th>Shift</th>
                    <th>10 Peso</th>
                    <th>12 Peso</th>
                    <th>15 Peso</th>
                    <th>Total</th>
                    <th>Day total</th>
                    </thead>
                    <tbody>
                    {this.state.data &&
                    <Fragment>
                        {this.state.data.days.map(item => (
                            <Fragment>
                                <tr>
                                    <td>{item.date}</td>
                                </tr>
                                {item.shuttles.map(item => (
                                    <Fragment>
                                        <tr>
                                            <td></td>
                                            <td>{item.shuttle_id} - {item.shuttle_plate}</td>
                                            <td>{item.shuttle_route}</td>
                                            <td>AM</td>
                                            <td>{item.am_ten}</td>
                                            <td>{item.am_twelve}</td>
                                            <td>{item.am_fifteen}</td>
                                            <td>{item.am_total}</td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td>PM</td>
                                            <td>{item.pm_ten}</td>
                                            <td>{item.pm_twelve}</td>
                                            <td>{item.pm_fifteen}</td>
                                            <td>{item.pm_total}</td>
                                            <td><b>{item.day_total}</b></td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div>&nbsp;</div>
                                            </td>
                                            <td>
                                                <div>&nbsp;</div>
                                            </td>
                                            <td>
                                                <div>&nbsp;</div>
                                            </td>
                                            <td>
                                                <div>&nbsp;</div>
                                            </td>
                                            <td>
                                                <div>&nbsp;</div>
                                            </td>
                                            <td>
                                                <div>&nbsp;</div>
                                            </td>
                                        </tr>
                                    </Fragment>
                                ))}
                                <tr>
                                    <td>
                                    </td>
                                    <td>
                                    </td>
                                    <td>
                                    </td>
                                    <td><b> Main Road Total </b></td>
                                    <td></td>
                                    <td ></td>
                                    <td></td>
                                    <td><b>{item.mr_total}</b></td>
                                    <td><b> {item.mr_total}
                                    </b></td>
                                </tr>
                                <tr>
                                    <td>
                                    </td>
                                    <td>
                                    </td>
                                    <td>
                                    </td>
                                    <td><b> Kaliwa Total </b></td>
                                    <td></td>
                                    <td ></td>
                                    <td></td>
                                    <td><b>{item.kaliwa_total}</b></td>
                                    <td><b> {item.kaliwa_total}
                                    </b></td>
                                </tr>
                                <tr>
                                    <td>
                                    </td>
                                    <td>
                                    </td>
                                    <td>
                                    </td>
                                    <td><b> Kanan Total </b></td>
                                    <td></td>
                                    <td ></td>
                                    <td></td>
                                    <td><b>{item.kanan_total}</b></td>
                                    <td><b> {item.kanan_total}
                                    </b></td>
                                </tr>
                                <tr>
                                    <td>
                                    </td>
                                    <td>
                                    </td>
                                    <td>

                                    </td>
                                    <td><b> Day Total </b></td>
                                    <td className="total-line"><b> {item.ten_total}
                                    </b></td>
                                    <td className="total-line"><b> {item.twelve_total}
                                    </b></td>
                                    <td className="total-line"><b> {item.fifteen_total}
                                    </b></td>
                                    <td className="total-line"><b> {item.day_total}
                                    </b></td>
                                    <td className="total-line"><b> {item.day_total}
                                    </b></td>
                                </tr>


                            </Fragment>

                        ))}
                    </Fragment>
                    }
                    <tr>
                        <Pagination size="small" onChange={this.handlePagination} defaultCurrent={1}
                                    total={this.state.length}/>

                    </tr>
                    <tr>
                        <td>
                            <div>&nbsp;</div>
                        </td>
                        <td>
                            <div>&nbsp;</div>
                        </td>
                        <td>
                            <div>&nbsp;</div>
                        </td>
                        <td>
                            <div>&nbsp;</div>
                        </td>
                        <td>
                            <div>&nbsp;</div>
                        </td>
                        <td>
                            <div>&nbsp;</div>
                        </td>
                    </tr>
                    <tr>
                        <td><b> Grand AM Total </b></td>
                        <td className="total-line"><b>
                        </b></td>
                        <td className="total-line"><b>
                        </b></td>
                        <td className="total-line"><b>
                        </b></td>
                        <td className="total-line"><b>
                        </b></td>
                        <td className="total-line"><b>
                        </b></td>
                        <td className="total-line"><b>
                        </b></td>
                        <td className="total-line"><b>
                            {this.state.data.grand_am_total}
                        </b></td>
                    </tr>
                    <tr>
                        <td><b> Grand PM Total </b></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td><b> {this.state.data.grand_pm_total}</b></td>
                    </tr>
                    <tr>
                        <td><b> Grand Total </b></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td><b>
                            {this.state.data.grand_ten_total}
                        </b></td>
                        <td><b>
                            {this.state.data.grand_twelve_total}
                        </b></td>
                        <td><b>
                            {this.state.data.grand_fifteen_total}
                        </b></td>
                        <td><b>
                            {this.state.data.grand_total}
                        </b></td>
                    </tr>
                    </tbody>
                </table>
                }
                <p className="end-label">END OF REPORT</p>
            </div>
        </div>
    )

    render() {
        return (
            <div style={{ padding: "10px" }}>
                <DateSelect onDateChange={this.onDateChange}/>
                <Divider />
                <ReportTitle
                    report_title="Passenger Count Per Route"
                    start_date={ this.state.start_date }
                    end_date={ this.state.end_date }
                />
                <ReportBody data={this.state.chart_data}/>
                {this.renderTable()}
            </div>
        );
    }
}

class ReportBody extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        // Create chart instance
        let chart = am4core.create("chartdiv", am4charts.XYChart);

        // Add data
        chart.data = this.props.data

        // Create category axis
        let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "day";

        // Create value axis
        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.title.text = "Passenger Per Route";

        // Create series
        let series1 = chart.series.push(new am4charts.LineSeries());
        series1.dataFields.valueY = "main_road";
        series1.dataFields.categoryX = "day";
        series1.name = "Main Road";
        series1.strokeWidth = 3;
        series1.stroke = am4core.color('blue');
        series1.legendSettings.valueText = "{valueY}";

        let circleBullet1 = series1.bullets.push(new am4charts.CircleBullet());
        circleBullet1.fill = am4core.color('blue');
        circleBullet1.strokeWidth = 2;

        let labelBullet1 = series1.bullets.push(new am4charts.LabelBullet());
        labelBullet1.label.text = "{main_road}";
        labelBullet1.label.dy = -20;

        let series2 = chart.series.push(new am4charts.LineSeries());
        series2.dataFields.valueY = "kaliwa";
        series2.dataFields.categoryX = "day";
        series2.name = 'Kaliwa';
        series2.strokeWidth = 3;
        series2.stroke = am4core.color('orange');
        series2.legendSettings.valueText = "{valueY}";

        let circleBullet2 = series2.bullets.push(new am4charts.CircleBullet());
        circleBullet2.fill = am4core.color('orange');
        circleBullet2.strokeWidth = 2;

        let labelBullet2 = series2.bullets.push(new am4charts.LabelBullet());
        labelBullet2.label.text = "{kaliwa}";
        labelBullet2.label.dy = -20;

        let series3 = chart.series.push(new am4charts.LineSeries());
        series3.dataFields.valueY = "kanan";
        series3.dataFields.categoryX = "day";
        series3.name = 'Kanan';
        series3.strokeWidth = 3;
        series3.stroke = am4core.color('green');
        series3.legendSettings.valueText = "{valueY}";

        let circleBullet3 = series3.bullets.push(new am4charts.CircleBullet());
        circleBullet3.fill = am4core.color('green');
        circleBullet3.strokeWidth = 2;

        let labelBullet3 = series3.bullets.push(new am4charts.LabelBullet());
        labelBullet3.label.text = "{kanan}";
        labelBullet3.label.dy = -20;

        chart.cursor = new am4charts.XYCursor();
        chart.cursor.behavior = "zoomY";

        // Add legend
        chart.legend = new am4charts.Legend();

        this.chart = chart;
    }

    componentWillUnmount() {
        if (this.chart) {
            this.chart.dispose();
        }
    }

    componentDidUpdate(oldProps) {
        if (oldProps.data != this.props.data) {
            this.chart.data = this.props.data;
        }
    }

    render() {
        return (
            <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
        );
    }
}

class DateSelect extends React.Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
    }

    onChange = (date, dateString) => {
        let new_date = new Date(date);
        this.props.onDateChange(new_date);
    }

    disabledDate = (current) => {
        return current > moment().endOf('day');
    }

    render() {
        return (
            <div>
                <label className="date-select-label">Start Date: </label>
                <DatePicker
                    onChange={this.onChange}
                    placeholder="Select Date"
                    disabledDate={this.disabledDate}
                />
            </div>
        );
    }
}

function ReportTitle(props) {
    return (
        <div className="report-title-container">
            <span className="report-header">{ props.report_title }</span>
            <span className="report-date">({props.start_date} - {props.end_date})</span>
        </div>
    );
}

export default PassengerPerRoute;