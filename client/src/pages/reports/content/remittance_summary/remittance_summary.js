/**
 * Created by JasonDeniega on 08/11/2018.
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
import ReactToPrint from "react-to-print";


const dateFormat = "YYYY-MM-DD";
const Option = Select.Option;

class ComponentToPrint extends React.Component {
    render() {
        return (
            <div className="container">
                <div className="report-labels">
                    Report for AY 10-20
                </div>
                <div className="report-body">
                    <table>
                        <thead>
                        <th>column 1</th>
                        <th>column 2</th>
                        <th>column 3</th>
                        </thead>
                        <tbody>
                        <tr>
                            <td>data 1</td>
                            <td>data 2</td>
                            <td>data 3</td>
                        </tr>
                        <tr>
                            <td>data 1</td>
                            <td>data 2</td>
                            <td>data 3</td>
                        </tr>
                        <tr>
                            <td>data 1</td>
                            <td>data 2</td>
                            <td>data 3</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export class RemittanceSummary extends Component {
    state = {};

    componentDidMount() {
    }


    render() {
        return (
            <div className="report-body">
                <div className="report-modal-container">
                    <ReactToPrint
                        trigger={() => <a href="#">Print this out!</a>}
                        content={() => this.componentRef}
                    />
                    <ComponentToPrint ref={el => (this.componentRef = el)}/>
                </div>
            </div>
        );
    }
}