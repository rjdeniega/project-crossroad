/**
 * Created by JasonDeniega on 09/07/2018.
 */
import React, { Component } from 'react'
import './style.css'
import { Input, InputNumber, TimePicker } from 'antd'
import moment from 'moment';

export class RemittanceForm extends Component {
    onChange(time, timeString) {

    }

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
                        <InputNumber className="input" type="text"/>
                        <p>to</p>
                        <InputNumber className="input" type="text"/>
                    </div>
                    <div className="tickets-sold">
                        <p>Tickets sold</p>
                        <div className="range-div">
                            <p> 10 peso tickets sold </p>
                            <InputNumber disabled value={this.props.ten_peso_start_first} className="input"
                                         type="text"/>
                            <p> to</p>
                            <InputNumber className="input" type="text"/>
                        </div>
                        <div className="range-div">
                            <p> 12 peso tickets sold </p>
                            <InputNumber disabled value={this.props.twelve_peso_start_first} className="input"
                                         type="text"/>
                            <p> to</p>
                            <InputNumber className="input" type="text"/>
                        </div>
                        <div className="range-div">
                            <p> 15 peso tickets sold </p>
                            <InputNumber disabled value={this.props.fifteen_peso_start_first} className="input"
                                         type="text"/>
                            <p> to</p>
                            <InputNumber className="input" type="text"/>
                        </div>
                    </div>
                    <div className="bottom-panel">
                        <div className="total-tickets-sold">
                            <p>Total Tickets sold</p>
                            <div className="range-div">
                                <p> LBA3 </p>
                                <InputNumber className="input" type="text"/>
                                <p> x 15</p>
                            </div>
                            <div className="range-div">
                                <p> Regular </p>
                                <InputNumber className="input" type="text"/>
                                <p> x 12</p>
                            </div>
                            <div className="range-div">
                                <p> Senior/Student </p>
                                <InputNumber className="input" type="text"/>
                                <p> x 10</p>
                            </div>
                        </div>
                        <div className="less-items">
                            <p>Less: </p>
                            <div className="range-div">
                                <p> Fuel </p>
                                <InputNumber className="input" type="text"/>
                            </div>
                            <div className="range-div">
                                <p> Others </p>
                                <InputNumber className="input" type="text"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="computed-div">
                    <div className="summary-table">
                        <p> summary </p>
                    </div>
                </div>
            </div>

        );
    }
}