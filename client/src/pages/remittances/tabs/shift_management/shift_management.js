/**
 * Created by JasonDeniega on 05/07/2018.
 */
import React, { Component } from 'react';
import './style.css'
import emptyStateImage from '../../../../images/empty_state_construction.png'
import users from '../../../../images/default.png'
import { Modal, Button, notification, Divider } from 'antd';
import { clockO } from 'react-icons-kit/fa/clockO'
import { Icon } from 'react-icons-kit'
import { DatePicker } from 'antd';
import moment from 'moment';
import { Select, Table, Avatar, Dropdown, Menu, message } from 'antd';
import { Icon as AntIcon } from 'antd';
import { getData, postData } from "../../../../network_requests/general";

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

export class ShiftManagementPane extends Component {
    state = {
        startDateObject: null,
        activeShift: null,
        startDate: null,
        endDate: null,
        endDateObject: null,
        am_shift_drivers: [],
        pm_shift_drivers: [],
        mn_shift_drivers: [],
        am_shift_supervisor: "select AM supervisor",
        am_shift_supervisor_key: null,
        pm_shift_supervisor: "select PM supervisor",
        pm_shift_supervisor_key: null,
        mn_shift_supervisor: "select Midnight supervisor",
        mn_shift_supervisor_key: null,
        supervisors: null,
        shuttles: [],
        visible: false,
        assigned_shuttle: null,
        driver_selected: null,
        selected_shift_type: null,
    };

    componentDidMount() {
        if (this.state.activeShift === null) {
            this.openNotification()
        }
        this.fetchDrivers();
        this.fetchSupervisors();
        this.fetchShuttles()

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
    handleConfirm = (e) => {
        const assignment = {
            "driver": this.state.driver_selected,
            "shuttle": this.state.assigned_shuttle,
            "deployment_type": this.state.deployment_type,
        };
        if (this.state.selected_shift_type == "AM") {
            this.setState({
                am_shift_drivers: [...this.state.am_shift_drivers, assignment]
            }, () => console.log(this.state.am_shift_drivers));
        }
        else if (this.state.selected_shift_type == "PM") {
            this.setState({
                pm_shift_drivers: [...this.state.pm_shift_drivers, assignment]
            }, () => {
                console.log(this.state.pm_shift_drivers);
            });
        }
        // else if (this.state.selected_shift_type == "MN") {
        //     this.setState({
        //         mn_shift_drivers: [...this.state.mn_shift_drivers, assignment]
        //     }, () => {
        //         console.log(this.state.mn_shift_drivers);
        //     });
        // }
        this.setState({
            visible: false,
        });
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

    // rowSelection object indicates the need for row selection
    isChecked = false;
    amRowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            // get the last selected item
            const current = selectedRowKeys[selectedRowKeys.length - 1];
            this.state.am_shift_drivers.map((item) => {
                if (item["driver"] == current) {
                    this.isChecked = true;
                    console.log("checked became true")
                }
            });
            console.log(this.isChecked);
            if (!this.isChecked) {
                this.setState({
                    driver_selected: current,
                    selected_shift_type: "AM"
                });
                this.showModal()
            }
            else {
                let index = this.state.am_shift_drivers.indexOf(this.state.driver_selected);
                let array = this.state.am_shift_drivers.splice(index);
                this.setState({
                    am_shift_drivers: array
                }, console.log(this.state.am_shift_drivers))
            }
        },
    };
    pmRowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            const current = selectedRowKeys[selectedRowKeys.length - 1];
            //check if item is already checked
            this.state.pm_shift_drivers.map((item) => {
                if (item["driver"] == current) {
                    this.isChecked = true
                }
            });
            if (!this.isChecked) {
                this.setState({
                    driver_selected: current,
                    selected_shift_type: "PM"
                }, () => console.log(this.state.selected_shift_type));

                this.showModal()
            }
            else {
                let index = this.state.pm_shift_drivers.indexOf(this.state.driver_selected);
                let array = this.state.pm_shift_drivers.splice(index);
                this.setState({
                    pm_shift_drivers: array
                }, console.log(this.state.pm_shift_drivers))
            }
        },
    };
    // mnRowSelection = {
    //     onChange: (selectedRowKeys, selectedRows) => {
    //         const current = selectedRowKeys[selectedRowKeys.length - 1];
    //
    //         //check if item is already checked
    //         this.state.mn_shift_drivers.map((item) => {
    //             if (item["driver"] == current) {
    //                 this.isChecked = true
    //             }
    //         });
    //         if (!this.isChecked) {
    //             this.setState({
    //                 driver_selected: current,
    //                 selected_shift_type: "MN"
    //             });
    //             this.showModal();
    //         }
    //         else {
    //             console.log("entered here");
    //             let index = this.state.mn_shift_drivers.indexOf(this.state.driver_selected);
    //             let array = this.state.mn_shift_drivers.splice(index);
    //             this.setState({
    //                 mn_shift_drivers: array
    //             }, console.log(this.state.mn_shift_drivers))
    //         }
    //     },
    // };

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
        // else {
        //     this.setState({
        //         mn_shift_supervisor: event.item.props.children,
        //         mn_shift_supervisor_key: event.item.props.eventKey
        //     }, () => console.log("midnight" + this.state.mn_shift_supervisor))
        // }
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
        // const mn_shift = {
        //     "supervisor": this.state.mn_shift_supervisor_key,
        //     "type": "M",
        //     "drivers_assigned": this.state.mn_shift_drivers
        // };

        //removed mn shift in shifts dict
        return {
            "start_date": this.state.startDate,
            "end_date": this.state.endDate,
            "shifts": [am_shift, pm_shift],
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
//     renderDeploymentOptions = () => {
//         if (this.state.selected_shift_type = "AM") {
//             return <Select className="user-input">
//                 <Option value="E">Early</Option>
//                 <Option value="R">Regular</Option>
//             </Select>
//         }
//         else {
//             return <Select className="user-input">
//                 <Option value="L">Late</Option>
//                 <Option value="R">Regular</Option>
//             </Select>
//         }
//
//     }
    renderShiftTables = () => (
        <div className="tables-wrapper">
            <Modal
                title="Assign this driver to a shuttle"
                visible={this.state.visible}
                onOk={this.handleConfirm}
                onCancel={this.handleCancel}

            >
                {this.state.selected_shift_type == "AM" &&
                <Select onChange={this.handleSelectChange("deployment_type")} className="user-input"  defaultValue="Please select deployment type">
                    <Option value="E">Early</Option>
                    <Option value="R">Regular</Option>
                </Select>
                }
                {this.state.selected_shift_type == "PM" &&
                <Select onChange={this.handleSelectChange("deployment_type")} className="user-input" defaultValue="Please select deployment type">
                    <Option value="L">Late</Option>
                    <Option value="R">Regular</Option>
                </Select>
                }
                <Select onChange={this.handleSelectChange("assigned_shuttle")} className="user-input"
                        defaultValue="Please select shuttle">
                    {this.state.shuttles.map(item => (
                        <Option value={item.id}>{item.plate_number}</Option>
                    ))}
                </Select>
            </Modal>
            <div className="am-shift-pane">
                <div className="shifts-label-div">
                    <div className="tab-label-type">AM</div>
                    <Dropdown overlay={this.supervisors("AM")}>
                        <Button className="supervisor-select" style={{ marginLeft: 8 }}>
                            {this.state.am_shift_supervisor} <AntIcon type="down"/>
                        </Button>
                    </Dropdown>
                </div>
                <Table showHeader={false} rowSelection={this.amRowSelection} pagination={false} columns={columns}
                       dataSource={this.state.drivers}/>,
            </div>
            <div className="pm-shift-pane">
                <div className="shifts-label-div">
                    <div className="tab-label-type">PM</div>
                    <Dropdown overlay={this.supervisors("PM")}>
                        <Button className="supervisor-select" style={{ marginLeft: 8 }}>
                            {this.state.pm_shift_supervisor}<AntIcon type="down"/>
                        </Button>
                    </Dropdown>
                    {/*<Divider orientation="left">Select Drivers</Divider>*/}
                </div>
                <Table showHeader={false} rowSelection={this.pmRowSelection} pagination={false} columns={columns}
                       dataSource={this.state.drivers}/>,

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

    render() {
        return (
            <div className="om-tab-body">
                <div className="content-body">
                    <div className="shift-creation-body">
                        <div className="label-div">
                            {/*<div style={{ color: 'var(--darkgreen)' }}>*/}
                            <div>
                                <Icon icon={clockO} size={30} style={{ marginRight: '10px', marginTop: '5px' }}/>
                            </div>
                            <div className="tab-label">
                                Create Shift
                            </div>
                        </div>
                        <div className="expiration-label">expiring in 7 days</div>

                        <div className="date-grid">
                            <DatePicker
                                className="date-picker"
                                format="YYYY-MM-DD"
                                value={this.state.startDateObject}
                                placeholder="Start Date"
                                onChange={() => this.handleDateChange()}
                            />
                            <DatePicker
                                className="date-picker"
                                disabled
                                placeholder="End Date"
                                format="YYYY-MM-DD"
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
