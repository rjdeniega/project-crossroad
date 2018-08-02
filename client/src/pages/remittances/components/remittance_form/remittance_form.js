/**
 * Created by JasonDeniega on 09/07/2018.
 */
import React, { Component } from 'react'
import './style.css'
import { Input, InputNumber, TimePicker, Button, Modal, message, Divider } from 'antd'
import moment from 'moment';
import { postData } from "../../../../network_requests/general";

export class RemittanceForm extends Component {
    state = {
        ten_peso_start_first: null,
        ten_peso_start_second: null,
        twelve_peso_start_first: null,
        twelve_peso_start_second: null,
        fifteen_peso_start_first: null,
        fifteen_peso_start_second: null,
        ten_peso_end_first: null,
        ten_peso_end_second: null,
        twelve_peso_end_first: null,
        twelve_peso_end_second: null,
        fifteen_peso_end_first: null,
        fifteen_peso_end_second: null,
        ticket_visible: false,
        km_start: null,
        km_end: null,
        fuel: null,
        others: null,
        ten_end_final_first: null,
        twelve_end_final_first: null,
        fifteen_end_final_first: null,
        ten_end_final_second: null,
        twelve_end_final_second: null,
        fifteen_end_final_second: null,
        isConsumedPresent: null,

    };

    onChange(time, timeString) {
    }

    componentDidMount() {
        console.log("something mounted");
        const state = { ...this.state };
        const array = { ...this.props };
        console.log(array);
        Object.keys(array).forEach(key => {
            console.log(key);
            console.log(this.props[key]);
            state[key] = this.props[key];
        });
        this.setState({
            ...state
        });
        const isConsumed = this.props.isConsumedPresent;
        console.log(!isConsumed);
        if (!isConsumed) {
            this.setState({
                ten_end_final_first: this.state.ten_peso_end_first,
                twelve_end_final_first: this.state.twelve_peso_end_first,
                fifteen_end_final_first: this.state.fifteen_peso_end_first,
                ten_end_final_second: this.state.ten_peso_end_second,
                twelve_end_final_second: this.state.twelve_peso_end_second,
                fifteen_end_final_second: this.state.fifteen_peso_end_first,
            })
        }
        else {
            this.setState({
                ten_end_final_first: this.props.ten_peso_consumed_first,
                twelve_end_final_first: this.props.twelve_peso_consumed_first,
                fifteen_end_final_first: this.props.fifteen_peso_consumed_first,
                ten_end_final_second: this.props.ten_peso_consumed_second,
                twelve_end_final_second: this.props.twelve_peso_consumed_second,
                fifteen_end_final_second: this.props.fifteen_peso_consumed_second,
            }, () => console.log(this.props.fifteen_peso_consumed_first))
        }
    }

    createForm = () => {
        const data = {
            "deployment": this.props.deployment_id,
            "fuel_cost": this.state.fuel,
            "other_cost": this.state.others,
            "km_from": this.state.km_start,
            "km_to": this.state.km_end,
            "consumed_ticket": [
                {
                    "assigned_ticket": this.props.ten_peso_first_id,
                    "end_ticket": this.state.ten_end_final_first,
                },
                {
                    "assigned_ticket": this.props.ten_peso_second_id,
                    "end_ticket": this.props.ten_peso_start_second ? this.state.ten_end_final_second : 0
                },
                {
                    "assigned_ticket": this.props.twelve_peso_first_id,
                    "end_ticket": this.state.twelve_end_final_first
                },
                {
                    "assigned_ticket": this.props.twelve_peso_second_id,
                    "end_ticket": this.props.twelve_peso_start_second ? this.state.twelve_end_final_second : 0
                },
                {
                    "assigned_ticket": this.props.fifteen_peso_first_id,
                    "end_ticket": this.state.fifteen_end_final_first
                },
                {
                    "assigned_ticket": this.props.fifteen_peso_second_id,
                    "end_ticket": this.props.fifteen_peso_start_firstfirst ? this.state.fifteen_end_final_second : 0
                },
            ]
        };

        console.log(data);
        return data;
    };
    handleSubmit = () => {
        const data = this.createForm();
        postData('remittances/remittance_form/', data).then(data => {
            if (!data.error) {
                console.log(data);
                message.success("Nasubmit na ang iyong remittance form")
            }
            else {
                console.log(data.error)
            }
        }).catch(error => console.log(error));
    };
    formListener = fieldName => event => {
        return this.handleFormChange(fieldName)(event);
        //this is asynchronous, it does not execute in order
        //if console.log is not in callback, it might execute before state is updated
    };
    handleFormChange = fieldName => value => {
        // this function is to handle drop-downs
        const state = { ...this.state };
        state[fieldName] = value;
        console.log(fieldName);
        console.log(state[fieldName]);
        this.setState({
            ...state
        });
    };
    showModal = () => {
        this.setState({
            ticket_visible: true,
        });
    };
    handleOk = (e) => {
        console.log(e);
        this.setState({
            ticket_visible: false,
        });
    };

    handleCancel = (e) => {
        console.log(e);
        this.setState({
            ticket_visible: false,
        });
    };

    render() {
        return (
            <div className="form-content">
                <Modal
                    title="Mga naka-assign at void tickets"
                    visible={this.state.ticket_visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >
                    <div><p>10 peso range (1): <b
                        style={{ color: 'var(--darkgreen)' }}>{this.props.ten_peso_start_first}
                        - {this.props.ten_peso_end_first}</b></p></div>
                    <div><p>10 peso range (2): <b
                        style={{ color: 'var(--darkgreen)' }}>{this.props.ten_peso_start_second}
                        - {this.props.ten_peso_end_second}</b></p></div>
                    <div><p>12 peso range (1): <b
                        style={{ color: 'var(--darkgreen)' }}>{this.props.twelve_peso_start_first}
                        - {this.props.twelve_peso_end_first}</b></p></div>
                    <div><p>12 peso range (2): <b
                        style={{ color: 'var(--darkgreen)' }}>{this.props.twelve_peso_start_second}
                        - {this.props.twelve_peso_end_second}</b></p></div>
                    <div><p>15 peso range (1): <b
                        style={{ color: 'var(--darkgreen)' }}>{this.props.fifteen_peso_start_first}
                        - {this.props.fifteen_peso_end_first}</b></p></div>
                    <div><p>15 peso range (2): <b
                        style={{ color: 'var(--darkgreen)' }}>{this.props.fifteen_peso_start_second}
                        - {this.props.fifteen_peso_end_second}</b></p></div>


                </Modal>
                <div className="input-div">
                    <div className="km-range">
                        <p>Km range from</p>
                        <InputNumber onChange={this.formListener("km_start")} value={this.state.km_start}
                                     className="input" type="text"/>
                        <p>to</p>
                        <InputNumber onChange={this.formListener("km_end")} value={this.state.km_end} className="input"
                                     type="text"/>
                    </div>
                    <div className="tickets-sold">
                        <p>Tickets sold</p>
                        <div className="range-div">
                            <p> 10 peso tickets sold (1)</p>
                            <InputNumber disabled value={this.props.ten_peso_start_first} className="input"
                                         type="text"/>
                            <p> to</p>
                            <InputNumber onChange={this.formListener("ten_end_final_first")}
                                         value={this.state.ten_end_final_first} className="input" type="text"/>
                        </div>
                        <div className="range-div">
                            <p> 10 peso tickets sold (2)</p>
                            <InputNumber disabled value={this.props.ten_peso_start_second} className="input"
                                         type="text"/>
                            <p> to</p>
                            <InputNumber onChange={this.formListener("ten_end_final_second")}
                                         value={this.state.ten_end_final_second} className="input" type="text"/>
                        </div>
                        <div className="range-div">
                            <p> 12 peso tickets sold (1)</p>
                            <InputNumber disabled value={this.props.twelve_peso_start_first} className="input"
                                         type="text"/>
                            <p> to</p>
                            <InputNumber onChange={this.formListener("twelve_end_final_first")}
                                         value={this.state.twelve_end_final_first} className="input"
                                         type="text"/>
                        </div>
                        <div className="range-div">
                            <p> 12 peso tickets sold (2)</p>
                            <InputNumber disabled value={this.props.twelve_peso_start_second} className="input"
                                         type="text"/>
                            <p> to</p>
                            <InputNumber onChange={this.formListener("twelve_end_final_second")}
                                         value={this.state.twelve_end_final_second} className="input"
                                         type="text"/>
                        </div>
                        <div className="range-div">
                            <p> 15 peso tickets sold (1)</p>
                            <InputNumber disabled value={this.props.fifteen_peso_start_first} className="input"
                                         type="text"/>
                            <p> to</p>
                            <InputNumber onChange={this.formListener("fifteen_end_final_first")}
                                         value={this.state.fifteen_end_final_first} className="input"
                                         type="text"/>
                        </div>
                        <div className="range-div">
                            <p> 15 peso tickets sold (2)</p>
                            <InputNumber disabled value={this.props.fifteen_peso_start_second} className="input"
                                         type="text"/>
                            <p> to</p>
                            <InputNumber onChange={this.formListener("fifteen_end_final_second")}
                                         value={this.state.fifteen_end_final_second} className="input"
                                         type="text"/>
                        </div>
                    </div>
                    {/*<div className="bottom-panel">*/}
                    {/*<div className="total-tickets-sold">*/}
                    {/*<p>Total Tickets sold</p>*/}
                    {/*<div className="range-div">*/}
                    {/*<p> LBA3 </p>*/}
                    {/*<InputNumber className="input" type="text"/>*/}
                    {/*<p> x 15</p>*/}
                    {/*</div>*/}
                    {/*<div className="range-div">*/}
                    {/*<p> Regular </p>*/}
                    {/*<InputNumber className="input" type="text"/>*/}
                    {/*<p> x 12</p>*/}
                    {/*</div>*/}
                    {/*<div className="range-div">*/}
                    {/*<p> Senior/Student </p>*/}
                    {/*<InputNumber className="input" type="text"/>*/}
                    {/*<p> x 10</p>*/}
                    {/*</div>*/}
                    {/*</div>*/}
                    <div className="less-items">
                        <div className="less-range-div">
                            <p> Fuel </p>
                            <InputNumber onChange={this.formListener("fuel")} value={this.state.fuel} className="input"
                                         type="text"/>
                        </div>
                        <div className="less-range-div">
                            <p> Others </p>
                            <InputNumber onChange={this.formListener("others")} value={this.state.others}
                                         className="input" type="text"/>
                        </div>
                    </div>
                    {/*</div>*/}
                </div>
                <div className="computed-div">
                    <div className="summary-table">
                        <p><b>summary</b></p>
                        <div className="computations">
                            <p> {this.state.ten_end_final_first ? this.state.ten_end_final_first : 0} * 10 = 0</p>
                            <p> {this.state.ten_end_final_second ? this.state.ten_end_final_second : 0} * 10 = 0</p>
                            <p> {this.state.twelve_end_final_first ? this.state.twelve_end_final_first:0 } * 12 = 0</p>
                            <p> {this.state.twelve_end_final_second ? this.state.twelve_end_final_second : 0} * 12 = 0</p>
                            <p> {this.state.fifteen_end_final_first ? this.state.fifteen_end_final_first: 0} * 15 = 0</p>
                            <p> {this.state.fifteen_end_final_second ? this.state.fifteen_end_final_second : 0} * 15 = 0</p>
                            <Divider></Divider>
                            <p><b> less </b></p>
                            <p> {this.state.fuel}</p>
                            <p> {this.state.others}</p>
                            <Divider></Divider>
                            <p><b>Total: </b> 20</p>


                        </div>
                        <Button onClick={this.handleSubmit}>Submit</Button>
                        <Button onClick={this.showModal}>Assigned Tickets</Button>
                    </div>
                </div>
            </div>

        );
    }
}