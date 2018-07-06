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

const {MonthPicker, RangePicker, WeekPicker} = DatePicker;
export class ShiftManagementPane extends Component {
    state = {
        startDateObject: null,
        activeShift: null,
        startDate: null,
        endDate: null,
        endDateObject: null,
    };

    componentDidMount() {
        if (this.state.active_shift === null) {
            this.openNotification()
        }
    }

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
    handleDateChange = (date, dateString) => {
        const endDateString = moment(date).add(15, 'days').format('MM-DD-YYYY');
        const endDateObject = moment(date).add(15, 'days');
        const startDateString = moment(date).format('MM-DD-YYYY');

        this.setState({
            startDate: startDateString,
            startDateObject: moment(date),
            endDate: endDateString,
            endDateObject:endDateObject
        }, () => {
            console.log(this.state.startDate,this.state.endDate)
        });

    };

    render() {
        return (
            <div className="overview-tab-body">
                <div className="shift-creation-body">
                    <div className="label-div">
                        <div style={{color: 'var(--darkgreen)'}}>
                            <Icon icon={clockO} size={30} style={{marginRight: '10px', marginTop: '5px'}}/>
                        </div>
                        <div className="tab-label">
                            Create Shift
                        </div>

                    </div>
                    <div className="date-grid">
                        <DatePicker
                            format="MM-DD-YYYY"
                            value={this.state.startDateObject}
                            placeholder="Start Date"
                            onChange={() => this.handleDateChange()}
                        />
                        <DatePicker
                            disabled
                            placeholder="End Date"
                            format="MM-DD-YYYY"
                            value={this.state.endDateObject}
                        />
                    </div>
                </div>
                <div className="date-grid">

                </div>
            </div>
        )
    }
}