import React from 'react';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);

export class PassengerPerRoute extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let chart = am4core.create("chartdiv", am4charts.XYChart);

        let data = [];
        let visits = 10;
        
        for (let i = 0; i < 7; i++) {
            visits += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
            let weekday = null;
            switch(i){
                case 0:
                    weekday = 'Sunday';
                    break;
                case 1:
                    weekday = 'Monday';
                    break;
                case 2:
                    weekday = 'Tuesday';
                    break;
                case 3:
                    weekday = 'Wednesday';
                    break;
                case 4:
                    weekday = 'Thursday';
                    break;
                case 5:
                    weekday = 'Friday';
                    break;
                default:
                    weekday = 'Saturday';
                    break;
            }
            data.push({ day: weekday, name: "name" + i, value: visits });
        }

        chart.data = data;

        let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "day";
        categoryAxis.title.text = "Day of the Week";

        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.title.text = "Passenger Count";

        let series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.valueY = "value";
        series.dataFields.categoryX = "day";

        series.tooltip.text = "{valueY.value}";
        chart.cursor = new am4charts.XYCursor();

        this.chart = chart;
    }

    componentWillUnmount(){
        if(this.chart) {
            this.chart.dispose();
        }
    }

    render() {
        return(
            <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
        );
    }
}

export default PassengerPerRoute;