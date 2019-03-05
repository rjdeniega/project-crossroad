import React from 'react';

import { postData } from '../../../../network_requests/general'

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);

export class PassengerPerRoute extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        }
    }

    componentDidMount() {

        // Create chart instance
        let chart = am4core.create("chartdiv", am4charts.XYChart);

        let request = { "start_date": "2019-02-25" };

        

        // Add data
        postData('passenger_per_route/', request)
            .then(data => {
                if (!data.error) {
                    chart.data = data.values;
                }
            });


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
        series1.bullets.push(new am4charts.CircleBullet());
        series1.tooltipText = "Passenger Count in {name} on {categoryX}:{valueY}";
        series1.legendSettings.valueText = "{valueY}";

        let series2 = chart.series.push(new am4charts.LineSeries());
        series2.dataFields.valueY = "kaliwa";
        series2.dataFields.categoryX = "day";
        series2.name = 'Kaliwa';
        series2.strokeWidth = 3;
        series2.bullets.push(new am4charts.CircleBullet());
        series2.tooltipText = "Passenger Count in {name} on {categoryX}:{valueY}";
        series2.legendSettings.valueText = "{valueY}";

        let series3 = chart.series.push(new am4charts.LineSeries());
        series3.dataFields.valueY = "kanan";
        series3.dataFields.categoryX = "day";
        series3.name = 'Kanan';
        series3.strokeWidth = 3;
        series3.bullets.push(new am4charts.CircleBullet());
        series3.tooltipText = "Passenger Count in {name} on {categoryX}:{valueY}";
        series3.legendSettings.valueText = "{valueY}";

        // Add chart cursor
        chart.cursor = new am4charts.XYCursor();
        chart.cursor.behavior = "panXY";
        chart.cursor.xAxis = categoryAxis;

        // Add legend
        chart.legend = new am4charts.Legend();

        this.chart = chart;
    }

    componentWillUnmount() {
        if (this.chart) {
            this.chart.dispose();
        }
    }

    fetchChartData() {
        let request = { "start_date": "2019-02-25" };

        postData('passenger_per_route/', request)
            .then(data => {
                if (!data.error) {
                    this.setState({
                    })
                    console.log(data)
                    console.log(this.state.main_road)
                    console.log(this.state.kaliwa)
                    console.log(this.state.kanan)
                }
            });
    }


    render() {
        return (
            <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
        );
    }
}

export default PassengerPerRoute;