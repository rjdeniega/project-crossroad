/**
 * Created by JasonDeniega on 11/10/2018.
 */

import React, { Component } from 'react';
import logo from '../../images/crossroad_logo.png'
import colors from '../../utilities/colorsFonts.css'
import { Icon } from 'react-icons-kit'
import { groupOutline } from 'react-icons-kit/typicons/groupOutline'
import { Icon as AntIcon, message, Select, Input,InputNumber, Modal, Table, Button, Avatar, List, Tag, Tabs, TimePicker } from 'antd'
import './style.css'
import { money } from 'react-icons-kit/fa/money'
import { UserAvatar } from "../../components/avatar/avatar"
import { ic_receipt } from 'react-icons-kit/md/ic_receipt'
import { getData, postData } from "../../network_requests/general";
import users from '../../images/default.png'

const Option = Select.Option;


const columns = [{
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
}, {
    title: 'Name',
    dataIndex: 'driver_name',
    key: 'driver_name',
}, {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
}, {
    title: 'Range from',
    dataIndex: 'range_from',
    key: 'range_from',
}, {
    title: 'Range to',
    dataIndex: 'range_to',
    key: 'range_to',
}];
export class TicketsPage extends Component {
    state = {
        tickets: [],
        visible: false,
        selectedDriver: null,
        selectedDriverId: null,
        void_visible: false,
        void_tickets: [],
    };

    componentDidMount() {
        this.fetchTicketHistory();
        this.fetchDrivers();
    }

    fetchTicketHistory() {
        getData('/remittances/tickets/').then(data => {
            console.log(data);
            if (!data.error) {
                console.log(data);
                this.setState({
                    tickets: data.ticket_assignments
                })
            }
            else {
                console.log(data);
            }
        }).catch(error => console.log(error.message))
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

    showModal = (id, name) => {
        this.setState({
            selectedDriver: name,
            selectedDriverId: id,
            ticket_type: null,
            range_from: null,
            void_tickets: [],

        }, () => this.setState({
            visible: true,
        }) );
    };

    handleOk = (e) => {
        console.log(e);
        this.setState({
            visible: false,
        });
        let data = {
            "ticket_type": this.state.ticket_type,
            "range_from": this.state.range_from,
            "driver_id": this.state.selectedDriverId,
            "void_tickets": this.state.void_tickets
        };
        postData('remittances/tickets/assign', data)
            .then((data) => {
                console.log(data["error"]);
                if (data['errors']) {
                    console.log(data);
                    message.error("Failed to assign tickets")
                }
                else {
                    console.log(data);
                    message.success("Successfully assigned tickets to " + this.state.selectedDriver);
                    this.setState({
                        tickets: [data.assigned_ticket_object, ...this.state.tickets]
                    })
                }
            })
            .catch(error => {
                console.log(error);
                message.error("Failed to assign tickets")
            });
    };

    handleSelectChange = (e) => {
        console.log(e);
        this.setState({ ticket_type: e })
    };
    handleRangeChange = (e) => {
        console.log(e.target.value);
        this.setState({ range_from: e.target.value })
    };

    handleCancel = (e) => {
        console.log(e);
        this.setState({
            visible: false,
        });
    };
    showAddVoid = () => {
        this.setState({
            void_visible: true,
        })
    };
    handleVoidCancel = (e) => {
        console.log(e);
        this.setState({
            void_visible: false,
        });
    };
    handleAddVoidChange = (e) => {
        if (isNaN(e)) {
            message.error("Please enter numeric value");
        }
        else {
            this.setState({
                add_void_value: e
            }, () => console.log(this.state.add_void_value))
        }
    };
    handleAddVoid = () => {
        this.setState({
            void_tickets: [...this.state.void_tickets, this.state.add_void_value],
            void_visible: false,
        });
    };
    renderDriverList = () => (
        <List
            className="ticket-drivers-list"
            itemLayout="horizontal"
            dataSource={this.state.drivers}
            renderItem={item => (
                <List.Item>
                    <List.Item.Meta
                        avatar={<Avatar src={item.driver_photo ? item.driver_photo : users}/>}
                        title={<b>{item.name}</b>}
                    />
                    <Button type="primary" size="small" onClick={() => this.showModal(item.key, item.name)}>Assign
                        Ticket</Button>
                </List.Item>
            )}
        />
    );
    renderModal = () => (
        <Modal
            title={"Assign Tickets to " + this.state.selectedDriver}
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
        >
            <Select className="user-input" onChange={this.handleSelectChange} defaultValue="Please select bundle type">
                <Option value="A">10 Pesos</Option>
                <Option value="B">12 Pesos</Option>
                <Option value="C">15 Pesos</Option>
            </Select>
            <Input onChange={this.handleRangeChange} className="user-input"
                   type="text"
                   value ={this.state.range_from}
                   placeholder="enter ticket range start"/>
            <Modal
                title="Magdagdag ng void"
                visible={this.state.void_visible}
                onOk={this.handleAddVoid}
                onCancel={this.handleVoidCancel}
            >
                <InputNumber className="add-void-input" placeholder="Ilagay ang ticket number"
                             value={this.state.add_void_value}
                             onChange={this.handleAddVoidChange}/>
            </Modal>
            <Button size="small" className="first-add-void-button"
                                onClick={this.showAddVoid}><AntIcon
                            className="plus-icon" type="plus-circle-o"/>Add
                            Void</Button>
            <div className="void-tickets">
                <p><b>Void tickets</b></p>
                {this.state.void_tickets.length != 0 && <List
                    className="void-list"
                    itemLayout="horizontal"
                    dataSource={this.state.void_tickets}
                    renderItem={item => (
                        <List.Item className="void-item">
                            <List.Item.Meta title={item}/>
                        </List.Item>
                    )}
                />}
                {this.state.void_tickets < 1 &&
                <div className="void-empty-state">
                    {/*<img className="void-empty-img" src={emptyStateImage}/>*/}
                    <p className="empty-label"> walang void tickets</p>
                </div>
                }
            </div>
        </Modal>
    );

    render() {
        return (
            <div className="body-wrapper">
                <div className="tickets-page-wrapper">
                    <div className="driver-remittance-header">
                        <div className="header-text">
                            <Icon className="page-icon" icon={ic_receipt} size={42}/>
                            <div className="page-title"> Tickets</div>
                            <div className="rem-page-description"> Assign and Monitor Tickets</div>
                        </div>
                        <UserAvatar/>
                    </div>
                    <div className="ticket-panels-wrapper">
                        <div className="driver-ticket-list">
                            {this.renderModal()}
                            {this.renderDriverList()}
                        </div>
                        <div className="tickets-panel">
                            <Table bordered size="medium"
                                   className="tickets-table"
                                   columns={columns}
                                   dataSource={this.state.tickets}
                                   pagination={{ pageSize: 50 }}
                                   scroll={{ y: 400 }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
