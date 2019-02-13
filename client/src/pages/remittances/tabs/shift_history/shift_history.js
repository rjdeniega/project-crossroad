/**
 * Created by JasonDeniega on 27/09/2018.
 */
import React, { Fragment, Component } from 'react';
import './style.css'
import emptyStateImage from '../../../../images/empty_state_construction.png'
import users from '../../../../images/default.png'
import { Modal, Button, notification, Divider } from 'antd';
import { clockO } from 'react-icons-kit/fa/clockO'
import { Icon } from 'react-icons-kit'
import { DatePicker } from 'antd';
import moment from 'moment';
import { Select, Table, Avatar, Dropdown, Menu, message, List } from 'antd';
import { Icon as AntIcon } from 'antd';
import { getData, postData } from "../../../../network_requests/general";
import ReactToPrint from "react-to-print";

const Option = Select.Option;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
//this defines the struvcture of the table and how its rendered, in this case I just have one column
const columns = [{
    title: 'Name',
    dataIndex: 'name',
    render: (text, record) => <div><Avatar className="driver-icon"
                                           style={{ marginRight: '20px' }}
                                           src={record.photo ? record.photo : users}/>
        {record.name}</div>
}];

export class ShiftHistoryPane extends Component {
    state = {
        schedules: [],
        startDateObject: null,
        activeShift: null,
        startDate: null,
        endDate: null,
        endDateObject: null,
        am_shift_drivers: [],
        pm_shift_drivers: [],
        mn_shift_drivers: [],
        supervisors: null,
        shuttles: [],
        visible: false,
        create_visible: false,
        assigned_shuttle: null,
        driver_selected: null,
        selected_shift_type: null,
        activeSchedule: null,

    };

    componentDidMount() {
        if (this.state.activeShift === null) {
            this.openNotification()
        }
        this.fetchDrivers();
        this.fetchSupervisors();
        this.fetchShuttles();
        this.fetchSchedules()


    }

    fetchSchedules() {
        return getData('/remittances/schedules/history').then(data => {
            if (!data["error"]) {
                //for each entry in drivers data, append data as a dictionary in tableData
                //ant tables accept values {"key": value, "column_name" : "value" } format
                //I cant just pass the raw array since its a collection of objects
                const tableData = [];
                //append drivers with their ids as key
                data["schedule_history"].forEach(item => tableData.push({
                    "id": item.id,
                    "start_date": item.start_date,
                    "end_date": item.end_date
                }));
                this.setState({ schedules: tableData });
                console.log(tableData);
                console.log(data);
            }
            else {
                console.log(data["error"]);
            }
        });
    }

    fetchDrivers() {
        return getData('/members/drivers').then(data => {
            if (!data["error"]) {
                //for each entry in drivers data, append data as a dictionary in tableData
                //ant tables accept values {"key": value, "column_name" : "value" } format
                //I cant just pass the raw array since its a collection of objects
                const tableData = [];
                //append drivers with their ids as key
                console.log(data);
                data["drivers"].forEach(item => tableData.push({
                    "key": item.id,
                    "name": item.name,
                    "photo": item.photo
                }));
                this.setState({ drivers: tableData });
            }
            else {
                console.log(data["error"]);
            }
        });
    }

    fetchSupervisors() {
        console.log("entered here");
        return fetch('/members/supervisors').then(response => response.json()).then(data => {
            if (!data["error"]) {
                //Were not appending it to a table so no necessary adjustments needed
                this.setState({ supervisors: data["supervisors"] },
                    () => console.log(this.state.supervisors));
            }
            else {
                console.log(data["error"]);
            }
        }, console.log(this.state.supervisors));
    };

    fetchShuttles() {
        return fetch('/inventory/shuttles').then(response => response.json()).then(data => {

            //Were not appending it to a table so no necessary adjustments needed
            this.setState({ shuttles: data["shuttles"] },
                () => console.log(this.state.shuttles));
        });
    }

    showModal = event => {
        this.setState({
            visible: true
        })
    };

    handleCancel = (e) => {
        console.log(e);
        this.setState({
            visible: false,
        });
    };
    handleSelectChange = fieldName => value => {
        // this function is to handle drop-downs
        const state = { ...this.state };
        state[fieldName] = value;
        console.log(value);
        console.log(fieldName);
        this.setState({
            ...state
        });
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
        const endDateString = moment(date).add(15, 'days').format('YYYY-MM-DD');
        const endDateObject = moment(date).add(15, 'days');
        const startDateString = moment(date).format('YYYY-MM-DD');

        console.log(date);
        console.log(dateString);

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
        //.children gives name
        //.eventKey gives PK
        console.log(event.item.props.eventKey);
        if (type === "AM") {
            this.setState({
                am_shift_supervisor: event.item.props.children,
                am_shift_supervisor_key: event.item.props.eventKey
            }, () => console.log("am" + this.state.am_shift_supervisor))
        }
        else if (type === "PM") {
            this.setState({
                pm_shift_supervisor: event.item.props.children,
                pm_shift_supervisor_key: event.item.props.eventKey
            }, () => console.log("pm" + this.state.pm_shift_supervisor))
        }
        else {
            this.setState({
                mn_shift_supervisor: event.item.props.children,
                mn_shift_supervisor_key: event.item.props.eventKey
            }, () => console.log("midnight" + this.state.mn_shift_supervisor))
        }
    };
    transformToDict = array => {
        const array_dict = [];
        array.map(item => {
            array_dict.push({
                "driver": item
            })
        });
        return array_dict
    };
    createForm = () => {
        const am_shift = {
            "supervisor": this.state.am_shift_supervisor_key,
            "type": "A",
            "drivers_assigned": this.state.am_shift_drivers
        };
        const pm_shift = {
            "supervisor": this.state.pm_shift_supervisor_key,
            "type": "P",
            "drivers_assigned": this.state.pm_shift_drivers
        };
        const mn_shift = {
            "supervisor": this.state.mn_shift_supervisor_key,
            "type": "M",
            "drivers_assigned": this.state.mn_shift_drivers
        };
        return {
            "start_date": this.state.startDate,
            "end_date": this.state.endDate,
            "shifts": [am_shift, pm_shift, mn_shift],
        };
    };
    handleShiftCreate = () => {
        const data = this.createForm();
        console.log(JSON.stringify(data));
        postData('remittances/schedules/', data)
            .then((data) => {
                console.log(data["error"]);
                if (data['errors']) {
                    console.log(data);
                    message.error(data['errors']['non_field_errors'])
                }
                else {
                    console.log(data['start_date']);
                    message.success("Shift creation successful for " + data['start_date'] + "to" + data['end_date']);
                }
            })
            .catch(error => console.log(error));
    };
    handleSelectSchedule = (id) => {
        console.log(id);
        this.getSchedule(id)

    };

    getSchedule(id) {
        return getData('remittances/schedules/' + id).then(data => {
            if (!data["error"]) {
                //for each entry in drivers data, append data as a dictionary in tableData
                //ant tables accept values {"key": value, "column_name" : "value" } format
                //I cant just pass the raw array since its a collection of objects
                const tableData = [];
                //append drivers with their ids as key
                console.log(data);
                this.setState({
                    am_shift_drivers: data.shifts[0].drivers,
                    amSupervisor: data.shifts[0].supervisor_name,
                    pm_shift_drivers: data.shifts[1].drivers,
                    pmSupervisor: data.shifts[1].supervisor_name,
                    activeSchedule: data.id,
                })
            }
            else {
                console.log(data["error"]);
            }
        });
    }

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

    renderShiftTables = (amSupervisor, pmSupervisor, mnSupervisor) => (
        <Fragment>
            <div className="buttons-container">
                <Button>Edit Schedule </Button>
                <ReactToPrint
                    trigger={() => <a href="#">Print this out!</a>}
                    content={() => this.componentRef}
                />
                <ShiftPrint data={this.state} ref={el => (this.componentRef = el)}/>
            </div>
        </Fragment>
    );
    renderScheduleList = () => (
        <div className="sched-wrapper">
            <List
                className="sched-list"
                itemLayout="horizontal"
                dataSource={(() => {
                    console.log(this.state.schedules);
                    return this.state.schedules;
                })()}
                renderItem={item => (
                    <List.Item className="list-item" onClick={() => this.handleSelectSchedule(item.id)}
                    >
                        <List.Item.Meta
                            title={<p className="list-title">{item.start_date} - {item.end_date}</p>}
                        />
                        <AntIcon type="check-circle" className="status-icon"/> <p>Current</p>
                    </List.Item>
                )}
            />
        </div>
    );
    renderAddScheduleModal = () => (
        <Modal
            title="Assign this driver to a shuttle"
            visible={this.state.visible}
            onOk={this.handleConfirm}
            onCancel={this.handleCancel}
        >
            <Select onChange={this.handleSelectChange("assigned_shuttle")} className="user-input"
                    defaultValue="Please select shuttle">
                {this.state.shuttles.map(item => (
                    <Option value={item.id}>{item.plate_number}</Option>
                ))}
            </Select>
        </Modal>
    );

    render() {
        return (
            <div className="om-tab-body">
                <div className="history-content-body">
                    <div className="shift-creation-body">
                        <div className="label-div">
                            {/*<div style={{ color: 'var(--darkgreen)' }}>*/}
                            <div>
                                <Icon icon={clockO} size={30} style={{ marginRight: '10px', marginTop: '5px' }}/>
                            </div>
                            <div className="tab-label">
                                Schedules
                            </div>
                        </div>
                        <div className="expiration-label">select schedule to view details</div>
                        {this.renderScheduleList()}
                        {this.renderAddScheduleModal()}

                    </div>
                    <div className="history-pane-content">
                        {this.state.activeSchedule &&
                        <Fragment>
                            {/*<div className="table-label-div">*/}
                            {/*<div className="tab-label">*/}
                            {/*Select Drivers*/}
                            {/*</div>*/}
                            {/*<div className="guideline">*/}
                            {/*Select N drivers for each shift*/}
                            {/*</div>*/}
                            {/*</div>*/}
                            {this.renderShiftTables()}
                        </Fragment>
                        }
                        {!this.state.activeSchedule &&
                        <div>
                            <img className="empty-image" src={emptyStateImage}/>
                            <p className="empty-message"> Please select a schedule to view details </p>
                        </div>
                        }

                    </div>

                </div>
            </div>
        )
    }
}
export class ShiftPrint extends Component {
    render() {
        return (
            <div className="history-tables-wrapper">
                <div className="am-shift-pane">
                    <div className="shifts-label-div">
                        <div className="tab-label-type">AM</div>
                        <p className="supervisor-select"><b>{this.props.data.amSupervisor}</b></p>
                    </div>
                    <List
                        itemLayout="horizontal"
                        dataSource={this.props.data.am_shift_drivers}
                        renderItem={item => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Avatar src={item.driver_photo ? item.driver_photo : users}/>}
                                    title={<b>{item.driver_name}</b>}
                                    description={item.shuttle_plate_number + "-" + item.deployment_type}
                                />
                            </List.Item>
                        )}
                    />
                </div>
                <div className="pm-shift-pane">
                    <div className="shifts-label-div">
                        <div className="tab-label-type">PM</div>
                        <p className="supervisor-select"><b>{this.props.data.pmSupervisor}</b></p>
                    </div>
                    <List
                        itemLayout="horizontal"
                        dataSource={this.props.data.pm_shift_drivers}
                        renderItem={item => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Avatar src={item.driver_photo ? item.driver_photo : users}/>}
                                    title={<b>{item.driver_name}</b>}
                                    description={item.shuttle_plate_number + "-" + item.deployment_type}
                                />
                            </List.Item>
                        )}
                    />

                </div>
                {/*<div className="mn-shift-pane">*/}
                {/*<div className="shifts-label-div">*/}
                {/*<div className="tab-label-type">Midnight</div>*/}
                {/*<Dropdown overlay={this.supervisors("MN")}>*/}
                {/*<Button className="supervisor-select" style={{ marginLeft: 8 }}>*/}
                {/*{this.state.mn_shift_supervisor}<AntIcon type="down"/>*/}
                {/*</Button>*/}
                {/*</Dropdown>*/}
                {/*</div>*/}
                {/*<Table showHeader={false} rowSelection={this.mnRowSelection} pagination={false} columns={columns}*/}
                {/*dataSource={this.state.drivers}/>,*/}
                {/*</div>*/}
            </div>
        );
    }
}
