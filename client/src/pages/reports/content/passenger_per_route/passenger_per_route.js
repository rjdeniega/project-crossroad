import React from 'react';

import { postData } from '../../../../network_requests/general';

import { Select, Divider, DatePicker } from 'antd';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);

export class PassengerPerRoute extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            "chart_data": []
        };

        this.fetchChartData = this.fetchChartData.bind(this);
        this.onDateChange = this.onDateChange.bind(this);
    }

    componentDidMount() {
        let dt = new Date();
        dt.setDate( dt.getDate() - 6 );
        this.fetchChartData(dt);
    }
        
    fetchChartData(date) {
        let start_date = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
        console.log(start_date);
        let request = { "start_date": start_date };
        console.log("fetching this date: " + date);

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
    
    onDateChange = (date) => {
        console.log("entered onDateChange: " + date)
        this.fetchChartData(date);
    }

    render() {
        return (
            <div style={{ padding: "10px" }}>  
                <DateSelect onDateChange={this.onDateChange} />
                <Divider />
                <span className="report-title">Passenger Count Per Day</span>
                <ReportBody data={this.state.chart_data}/>
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
        if(oldProps.data != this.props.data){
            this.chart.data = this.props.data;
        }
    } 

    render() {
        return(
            <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
        );
    }
}

class DateSelect extends React.Component {
    constructor(props){
        super(props);

        this.onChange = this.onChange.bind(this);
    }

    onChange = (date, dateString) => {
        let new_date = new Date(date);
        this.props.onDateChange(new_date);
    }

    render() {
        return (
            <div>
                <label>Start Date: </label>
                <DatePicker onChange={this.onChange} placeholder="Select Date"/>
            </div>
        );
    }
}

function ReportTitle(props){
}

export default PassengerPerRoute;