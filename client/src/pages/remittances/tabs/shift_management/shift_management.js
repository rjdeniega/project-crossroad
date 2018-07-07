/**
 * Created by JasonDeniega on 05/07/2018.
 */
import React, {Component} from 'react';
import './style.css'
import emptyStateImage from '../../../../images/empty_state_construction.png'
import {Button, notification} from 'antd';
import {clockO} from 'react-icons-kit/fa/clockO'
import {Icon} from 'react-icons-kit'
import {DatePicker} from 'antd';
import moment from 'moment';
import {Table, Avatar} from 'antd';

const {MonthPicker, RangePicker, WeekPicker} = DatePicker;
//this defines the struvcture of the table and how its rendered, in this case I just have one column
const columns = [{
    title: 'Name',
    dataIndex: 'name',
    render: name => <div> <Avatar style={{backgroundColor: '#4d9dd0', marginRight: '20px'}} icon="user"/>
        {name}</div>,
}];

export class ShiftManagementPane extends Component {
    state = {
        startDateObject: null,
        activeShift: null,
        startDate: null,
        endDate: null,
        endDateObject: null,
        drivers: null
    };

    componentDidMount() {
        if (this.state.activeShift === null) {
            this.openNotification()
        }
        return fetch('/members/drivers').then(response => response.json()).then(data => {
            if (!data["error"]) {
                //for each entry in drivers data, append data as a dictionary in tableData
                //ant tables accept values {"key": value, "column_name" : "value" } format
                //I cant just pass the raw array since its a collection of objects
                const tableData = [];
                data["drivers"].forEach(item => tableData.push({
                    "key": item.id,
                    "name": item.name
                }));
                this.setState({drivers:tableData});
            } else {
                console.log(data["error"]);
            }
        });
    }

    // rowSelection object indicates the need for row selection
    rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        },
        getCheckboxProps: record => ({
            disabled: record.name === 'Disabled User', // Column configuration not to be checked
            name: record.name,
        }),
    };
    close = () => {
        console.log('Notification was closed. Either the close button was clicked or duration time elapsed.');
    };
    openNotification = () => {
        const key = `open${Date.now()}`;
        const btn = (
            <Button type="primary" size="small" onClick={() => notification.close(key)}>
                Confirm
            </Button>
        );
        notification.open({
            message: 'Please set shift',
            description: 'No shifts have been set for the next 15 days.',
            btn,
            key,
            onClose: this.close,
        });
    };

    renderShiftTables = () => {

    }
    handleDateChange = (date, dateString) => {
        const endDateString = moment(date).add(15, 'days').format('MM-DD-YYYY');
        const endDateObject = moment(date).add(15, 'days');
        const startDateString = moment(date).format('MM-DD-YYYY');

        this.setState({
            startDate: startDateString,
            startDateObject: moment(date),
            endDate: endDateString,
            endDateObject: endDateObject
        }, () => {
            console.log(this.state.startDate, this.state.endDate)
        });

    };

    render() {
        return (
            <div className="om-tab-body">
                <div className="content-body">
                    <div className="shift-creation-body">
                        <div className="label-div">
                            <div style={{color: 'var(--darkgreen)'}}>
                                <Icon icon={clockO} size={30} style={{marginRight: '10px', marginTop: '5px'}}/>
                            </div>
                            <div className="tab-label">
                                Create Shift
                            </div>
                        </div>
                        <div className="expiration-label">expiring in 7 days</div>

                        <div className="date-grid">
                            <DatePicker
                                className="date-picker"
                                format="MM-DD-YYYY"
                                value={this.state.startDateObject}
                                placeholder="Start Date"
                                onChange={() => this.handleDateChange()}
                            />
                            <DatePicker
                                className="date-picker"
                                disabled
                                placeholder="End Date"
                                format="MM-DD-YYYY"
                                value={this.state.endDateObject}
                            />
                        </div>
                        <div className="create-shift-button" >
                        <Button type="primary">Create this shift</Button>
                        </div>
                    </div>
                    <div className="driver-selection">
                        {/*<div className="table-label-div">*/}
                        {/*<div className="tab-label">*/}
                        {/*Select Drivers*/}
                        {/*</div>*/}
                        {/*<div className="guideline">*/}
                        {/*Select N drivers for each shift*/}
                        {/*</div>*/}
                        {/*</div>*/}
                        <div className="tables-wrapper">
                            <div className="am-shift-pane">
                                <div className="label-div">
                                    <div className="tab-label">AM</div>
                                </div>
                                <Table rowSelection={this.rowSelection} pagination={false} columns={columns}
                                       dataSource={this.state.drivers}/>,
                            </div>
                            <div className="pm-shift-pane">
                                <div className="label-div">
                                    <div className="tab-label">PM</div>
                                </div>
                                <Table rowSelection={this.rowSelection} pagination={false} columns={columns}
                                       dataSource={this.state.drivers}/>,

                            </div>
                            <div className="mn-shift-pane">
                                <div className="label-div">
                                    <div className="tab-label">Midnight</div>
                                </div>
                                <Table rowSelection={this.rowSelection} pagination={false} columns={columns}
                                       dataSource={this.state.drivers}/>,
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}