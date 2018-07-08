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
import {Table, Avatar, Dropdown, Menu, message} from 'antd';
import {Icon as AntIcon} from 'antd';
import {postData} from "../../../../network_requests/general";


const {MonthPicker, RangePicker, WeekPicker} = DatePicker;
//this defines the struvcture of the table and how its rendered, in this case I just have one column
const columns = [{
    title: 'Name',
    dataIndex: 'name',
    render: name => <div><Avatar style={{backgroundColor: '#4d9dd0', marginRight: '20px'}} icon="user"/>
        {name}</div>,
}];

export class ShiftManagementPane extends Component {
    state = {
        startDateObject: null,
        activeShift: null,
        startDate: null,
        endDate: null,
        endDateObject: null,
        am_shift_drivers: null,
        pm_shift_drivers: null,
        mn_shift_drivers: null,
        am_shift_supervisor: "select AM supervisor",
        pm_shift_supervisor: "select PM supervisor",
        mn_shift_supervisor: "select Midnight supervisor",
        supervisors: null
    };

    componentDidMount() {
        if (this.state.activeShift === null) {
            this.openNotification()
        }
        this.fetchDrivers();
        this.fetchSupervisors();

    }

    fetchDrivers() {
        return fetch('/members/drivers').then(response => response.json()).then(data => {
            if (!data["error"]) {
                //for each entry in drivers data, append data as a dictionary in tableData
                //ant tables accept values {"key": value, "column_name" : "value" } format
                //I cant just pass the raw array since its a collection of objects
                const tableData = [];
                //append drivers with their ids as key
                data["drivers"].forEach(item => tableData.push({
                    "key": item.id,
                    "name": item.name
                }));
                this.setState({drivers: tableData});
            } else {
                console.log(data["error"]);
            }
        });
    }

    fetchSupervisors() {
        console.log("entered here");
        return fetch('/members/supervisors').then(response => response.json()).then(data => {
            if (!data["error"]) {
                //Were not appending it to a table so no necessary adjustments needed
                this.setState({supervisors: data["supervisors"]},
                    () => console.log(this.state.supervisors));

            } else {
                console.log(data["error"]);
            }
        }, console.log(this.state.supervisors));
    }

    // rowSelection object indicates the need for row selection
    amRowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            this.setState({
                am_shift_drivers: selectedRowKeys
            }, () => {
                console.log(this.state.am_shift_drivers);
            })
        },
        getCheckboxProps: record => ({
            disabled: record.name === 'Disabled User', // Column configuration not to be checked
            name: record.name,
        }),
    };
    pmRowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            this.setState({
                pm_shift_drivers: selectedRowKeys
            }, () => {
                console.log(this.state.pm_shift_drivers);
            })
        },
        getCheckboxProps: record => ({
            disabled: record.name === 'Disabled User', // Column configuration not to be checked
            name: record.name,
        }),
    };
    mnRowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            this.setState({
                mn_shift_drivers: selectedRowKeys
            }, () => {
                console.log(this.state.mn_shift_drivers);
            })
        },
        getCheckboxProps: record => ({
            disabled: record.name === 'Disabled User', // Column configuration not to be checked
            name: record.name,
        }),
    };

    //normal action handlers
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
    //component change handlers
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
    handleSupervisorSelect = type => event => {
        console.log(event.item.props.children);
        if (type === "AM") {
            this.setState({
                am_shift_supervisor: event.item.props.children
            }, () => console.log("am" + this.state.am_shift_supervisor))
        } else if (type === "PM") {
            this.setState({
                pm_shift_supervisor: event.item.props.children
            }, () => console.log("pm" + this.state.pm_shift_supervisor))
        } else {
            this.setState({
                mn_shift_supervisor: event.item.props.children
            }, () => console.log("midnight" + this.state.mn_shift_supervisor))
        }
    };
    createForm = () => {
        const am_shift = {
            "supervisor": this.state.am_shift_supervisor,
            "type": "A",
            "drivers": this.state.am_shift_drivers
        };
        const pm_shift = {
            "supervisor": this.state.pm_shift_supervisor,
            "type": "P",
            "drivers": this.state.pm_shift_drivers
        };
        const mn_shift = {
            "supervisor": this.state.mn_shift_supervisor,
            "type": "M",
            "drivers": this.state.mn_shift_drivers
        };
        const formData = {
            "start_date": this.state.startDate,
            "end_date": this.state.endDate,
            "shifts": [am_shift, pm_shift, mn_shift],
        };
        return formDdata;
    };
    handleShiftCreate = () => {
        const data = this.createForm();
        postData('remittances/schedules', data)
            .then(({data, error}) => {
                if (error) {
                    message.error(error)
                } else {
                    console.log(data)
                }
            })
            .catch(error => message(error));
    };

    renderSupervisors = () => this.state.supervisors.map(supervisor =>
        <Menu.Item key={supervisor.id}>{supervisor.name}</Menu.Item>
    );
    supervisors = (type) => (
        <Menu onClick={this.handleSupervisorSelect(type)}>
            {/*append only when its fetched*/}
            {this.state.supervisors && this.renderSupervisors()}
        </Menu>
    );
//JSX rendering functions
    renderShiftTables = () => (
        <div className="tables-wrapper">
            <div className="am-shift-pane">
                <div className="shifts-label-div">
                    <div className="tab-label">AM</div>
                    <Dropdown overlay={this.supervisors("AM")}>
                        <Button className="supervisor-select" style={{marginLeft: 8}}>
                            {this.state.am_shift_supervisor} <AntIcon type="down"/>
                        </Button>
                    </Dropdown>
                </div>
                <Table rowSelection={this.amRowSelection} pagination={false} columns={columns}
                       dataSource={this.state.drivers}/>,
            </div>
            <div className="pm-shift-pane">
                <div className="shifts-label-div">
                    <div className="tab-label">PM</div>
                    <Dropdown overlay={this.supervisors("PM")}>
                        <Button className="supervisor-select" style={{marginLeft: 8}}>
                            {this.state.pm_shift_supervisor}<AntIcon type="down"/>
                        </Button>
                    </Dropdown>
                </div>
                <Table rowSelection={this.pmRowSelection} pagination={false} columns={columns}
                       dataSource={this.state.drivers}/>,

            </div>
            <div className="mn-shift-pane">
                <div className="shifts-label-div">
                    <div className="tab-label">Midnight</div>
                    <Dropdown overlay={this.supervisors("MN")}>
                        <Button className="supervisor-select" style={{marginLeft: 8}}>
                            {this.state.mn_shift_supervisor}<AntIcon type="down"/>
                        </Button>
                    </Dropdown>
                </div>
                <Table rowSelection={this.mnRowSelection} pagination={false} columns={columns}
                       dataSource={this.state.drivers}/>,
            </div>
        </div>
    );

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
                        <div className="create-shift-button">
                            <Button type="primary" onClick={this.handleShiftCreate}>Create this shift</Button>
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
                        {this.renderShiftTables()}
                    </div>
                </div>
            </div>
        )
    }
}
