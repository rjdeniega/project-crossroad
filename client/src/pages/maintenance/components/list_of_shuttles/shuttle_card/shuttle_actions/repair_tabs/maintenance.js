import React, { Component } from "react";
import { DatePicker, Button, message } from "antd";
import moment from "moment";
import { postData } from "../../../../../../../network_requests/general";

class MaintenanceHistory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      days: "",
      date: "",
      previous: ""
    };
  }

  componentDidMount() {
    fetch("inventory/shuttles/latestmaintenance/" + this.props.shuttle_id)
      .then(response => response.json())
      .then(data => {
        if (!data.error) {
          this.setState({
            days: data.days,
            date: data.date,
            previous: data.previous
          });
        } else {
          console.log(data.error);
        }
      });
  }

  render() {
    let { date, days, previous } = this.state;
    return (
      <div>
        <br />
        {previous === "" ? "" : (<p><b>Previous Maintenance: </b>{previous}</p>)}
        <p>
          <b>Maintenance Schedule: </b>
          {date}
        </p>
        <br />
        {days > 0
          ? days + " days left before maintenance schedule"
          : (days * -1) + " days behind maintenance schedule!"}
      </div>
    );
  }
}

export class Maintenance extends Component {
  constructor(props) {
    super(props);

    this.state = { date: new Date() };
  }

  handleDatechange = (event, date) => {
    this.setState({ date: date });
  };

  setMaintenance = id => {
    const data = {
      date: this.state.date
    };
    postData("inventory/shuttles/setmaintenance/" + id, data).then(
      response => response
    );

    this.props.reloadMaintenance();
    message.success("Initial maintenance schedule has been set!");
  };

  render() {
    let { shuttle } = this.props;
    return (
      <div align="center">
        {shuttle.maintenance_sched === null ? (
          <div>
            <br />
            <h2>This shuttle has no maintenance schedule</h2>
            <DatePicker
              autoOk={true}
              onChange={this.handleDatechange}
              value={moment(this.state.date)}
            />
            &nbsp;
            <Button
              type="primary"
              onClick={() => this.setMaintenance(shuttle.id)}
            >
              Set Initial Maintenance Schedule
            </Button>
          </div>
        ) : (
          <div align="left">
            <MaintenanceHistory shuttle_id={shuttle.id} />
          </div>
        )}
      </div>
    );
  }
}
