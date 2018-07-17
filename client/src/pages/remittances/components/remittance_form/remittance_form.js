/**
 * Created by JasonDeniega on 09/07/2018.
 */
import React, { Component } from 'react'
import './style.css'
import { Input, InputNumber, TimePicker, Button } from 'antd'
import moment from 'moment';
import { postData } from "../../../../network_requests/general";

export class RemittanceForm extends Component {
    state = {
        ten_peso_first: 0,
        ten_peso_second: 0,
        twelve_peso_first: 0,
        twelve_peso_second: 0,
        fifteen_peso_first: 0,
        fifteen_peso_second: 0,
        km_start: 0,
        km_end: 0,
        fuel: 0,
        others: 0,
    };

    onChange(time, timeString) {
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
                    "end_ticket": this.state.ten_peso_first
                },
                {
                    "assigned_ticket": this.props.ten_peso_second_id,
                    "end_ticket": this.state.ten_peso_second
                },
                {
                    "assigned_ticket": this.props.twelve_peso_first_id,
                    "end_ticket": this.state.twelve_peso_first
                },
                {
                    "assigned_ticket": this.props.twelve_peso_second_id,
                    "end_ticket": this.state.twelve_peso_second
                },
                {
                    "assigned_ticket": this.props.fifteen_peso_first_id,
                    "end_ticket": this.state.fifteen_peso_first
                },
                {
                    "assigned_ticket": this.props.fifteen_peso_second_id,
                    "end_ticket": this.state.fifteen_peso_second
                },
            ]
        }
        console.log(data);
        return data;
    };
    handleSubmit = () => {
        const data = this.createForm();
        postData('remittances/remittance_form/', data).then(data => {
            if (!data.error) {
                console.log(data)
            }
            else {
                console.log(data.error)
            }
        }).catch(error => console.log(error));

        console.log("submitted")
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

    render() {
        return (
            <div className="form-content">
                <div className="input-div">
                    <div className="time-data">
                        <p>Time Start</p>
                        <TimePicker/>
                        <p>Time End</p>
                        <TimePicker/>
                    </div>
                    <div className="km-range">
                        <p>Km range from</p>
                        <InputNumber onChange={this.formListener("km_start")} className="input" type="text"/>
                        <p>to</p>
                        <InputNumber onChange={this.formListener("km_end")} className="input" type="text"/>
                    </div>
                    <div className="tickets-sold">
                        <p>Tickets sold</p>
                        <div className="range-div">
                            <p> 10 peso tickets sold (1)</p>
                            <InputNumber disabled value={this.props.ten_peso_start_first} className="input"
                                         type="text"/>
                            <p> to</p>
                            <InputNumber onChange={this.formListener("ten_peso_first")} className="input" type="text"/>
                        </div>
                        <div className="range-div">
                            <p> 10 peso tickets sold (2)</p>
                            <InputNumber disabled value={this.props.ten_peso_start_second} className="input"
                                         type="text"/>
                            <p> to</p>
                            <InputNumber onChange={this.formListener("ten_peso_second")} className="input" type="text"/>
                        </div>
                        <div className="range-div">
                            <p> 12 peso tickets sold (1)</p>
                            <InputNumber disabled value={this.props.twelve_peso_start_first} className="input"
                                         type="text"/>
                            <p> to</p>
                            <InputNumber onChange={this.formListener("twelve_peso_first")} className="input"
                                         type="text"/>
                        </div>
                        <div className="range-div">
                            <p> 12 peso tickets sold (2)</p>
                            <InputNumber disabled value={this.props.twelve_peso_start_second} className="input"
                                         type="text"/>
                            <p> to</p>
                            <InputNumber onChange={this.formListener("twelve_peso_second")} className="input"
                                         type="text"/>
                        </div>
                        <div className="range-div">
                            <p> 15 peso tickets sold (1)</p>
                            <InputNumber disabled value={this.props.fifteen_peso_start_first} className="input"
                                         type="text"/>
                            <p> to</p>
                            <InputNumber onChange={this.formListener("fifteen_peso_first")} className="input"
                                         type="text"/>
                        </div>
                        <div className="range-div">
                            <p> 15 peso tickets sold (2)</p>
                            <InputNumber disabled value={this.props.fifteen_peso_start_second} className="input"
                                         type="text"/>
                            <p> to</p>
                            <InputNumber onChange={this.formListener("fifteen_peso_second")} className="input"
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
                            <InputNumber onChange={this.formListener("fuel")} className="input" type="text"/>
                        </div>
                        <div className="less-range-div">
                            <p> Others </p>
                            <InputNumber onChange={this.formListener("others")} className="input" type="text"/>
                        </div>
                    </div>
                    {/*</div>*/}
                </div>
                <div className="computed-div">
                    <div className="summary-table">
                        <p> summary </p>
                        <Button onClick={this.handleSubmit}>Submit</Button>
                    </div>
                </div>
            </div>

        );
    }
}