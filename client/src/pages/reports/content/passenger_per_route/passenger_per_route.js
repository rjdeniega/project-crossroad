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