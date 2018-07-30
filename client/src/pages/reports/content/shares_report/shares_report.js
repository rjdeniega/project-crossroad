/**
 * Created by JasonDeniega on 30/07/2018.
 */
/**
 * Created by JasonDeniega on 29/07/2018.
 */

import React, { Component, Fragment } from 'react'
import '../../../../utilities/colorsFonts.css'
import './style.css'
import { Button } from 'antd'
import { Icon as AntIcon, Input, Card, Table, DatePicker, Select } from 'antd'
import { getData } from '../../../../network_requests/general'
import { Icon } from 'react-icons-kit'
import { fileTextO } from 'react-icons-kit/fa/fileTextO'
import { money } from 'react-icons-kit/fa/money'
import moment from "moment";
const columns = [{
    title: 'Name',
    dataIndex: 'member.name',
    key: 'mamber.name',
    render: (text) => (
        <div>
            {text}
        </div>
    )
}, {
    title: 'Shares',
    dataIndex: 'total_shares',
    key: 'total_shares',
    render: (text) => (
        <div>
            {text}
        </div>
    ),
}, {
    title: 'Share Value (in Php)',
    dataIndex: 'total_peso_value',
    key: 'total_peso_value',
    render: (text) => (
        <div className="rem-status">
            <p><b>Php {text}</b></p>
        </div>
    )
},];
const dateFormat = "YYYY-MM-DD";
const Option = Select.Option;

export class SharesReport extends Component {
    state = {
        shares: [],
    };

    componentDidMount() {
        this.fetchShares()
    }


    fetchShares() {
        getData('/shares_report/').then(data => {
            console.log(data);
            this.setState({
                shares: data.report_items,
            })
        });
    }

    resetFilters = () => {
        this.setState({
            filtered_transactions: this.state.all_transactions,
        }, () => this.setState({
            am_shift_total: this.getShiftTypeTotal("A"),
            pm_shift_total: this.getShiftTypeTotal("P"),
            grand_total: this.getGrandTotal("A")
        }));

    };

    render() {
        return (
            <div className="shares-report-body">
                <Table bordered size="medium"
                       pagination={false}
                       className="remittance-table"
                       columns={columns}
                       dataSource={this.state.shares}
                />
            </div>
        );
    }
}