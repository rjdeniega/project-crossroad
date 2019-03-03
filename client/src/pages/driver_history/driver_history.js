/**
 * Created by JasonDeniega on 20/02/2019.
 */
/**
 * Created by JasonDeniega on 16/11/2018.
 */
/**
 * Created by JasonDeniega on 24/05/2018.
 */
import React, { Component, Fragment } from "react"
import '../../utilities/colorsFonts.css'
import { List, Avatar, Alert } from 'antd'
import './style.css'
import {DeploymentListDetails} from '../remittances/subpages/driver_remittance/revised_driver_remittance'
import emptyStateImage from '../../images/empty state record.png'
import users from '../../images/default.png'
import {
    Spin,
    Icon as AntIcon,
    Divider,
    Table,
    message,
    Modal,
    Button,
    Input,
    DatePicker,
    Select,
    Tag,
    Row,
    Col,
    InputNumber
} from 'antd';
import { Icon } from 'react-icons-kit'
import { driversLicenseO } from 'react-icons-kit/fa/driversLicenseO'
import { UserAvatar } from "../../components/avatar/avatar"
import { getData, postData, postDataWithImage } from '../../network_requests/general'
import moment from "moment";

const dateFormat = "YYYY-MM-DD";
const Option = Select.Option;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;

function onChange(date, dateString) {
    console.log(date, dateString);
}


const data = [{
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
}, {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
}, {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
}];
export class HistoryPage extends Component {
    state = {
        activeSelection: null,
        visible: false,
    };

    componentDidMount() {
        this.fetchShifts()
    }

    componentDidUpdate() {
    }

    columns = [{
        title: 'Date',
        dataIndex: 'shift_iteration.date',
        key: 'shift_iteration.date',
        render: text => <a href="javascript:;">{text}</a>,
    }, {
        title: 'Type',
        dataIndex: 'shift.type',
        key: 'shift.type',
    }, {
        title: 'No. Of Drivers Deployed',
        dataIndex: 'address',
        key: 'address',
    }, {
        title: 'No. Of Sub Drivers',
        key: 'tags',
        dataIndex: 'tags'

    }, {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
            <a onClick={() => this.handleSelect(record)} href="javascript:;">View</a>
        )
    }];

    fetchShifts() {
        const { id } = JSON.parse(localStorage.user_staff);
        getData('/remittances/shifts/' + id).then(data => {
            console.log(data);
            this.setState({
                shifts: data.shifts,
            })
        });
    }

    fetchDeployments() {
        const { id } = JSON.parse(localStorage.user_staff);
        getData('/remittances/specific_deployments' + id).then(data => {
            console.log(data);
            this.setState({
                cards: data.cards,
            })
        });
    }

    fetchDeployment = (event) => {
        getData('/remittances/supervisor_remittances' + event.target.value).then(data => {
            console.log(data);
            this.setState({
                cards: data.cards,
            })
        });
    }
    handleSelect = (item) => {
        console.log("this got clicked");
        console.log(item);
        getData('/remittances/specific_deployments/' + item.shift_iteration.id).then(data => {
            console.log(data);
            this.setState({
                activeSelected: true,
                deployments: data.deployments,
            })
        });
        this.setState({
            visible: true
        })
    }
    handleOk = () => {

    };
    handleCancel = (e) => {
        console.log(e);
        this.setState({
            visible: false,
            transactions_visible: false,
        });
    };

    showModal = () => {
        this.setState({
            visible: true,
        });
    };
    renderDeploymentListModal = () => (
        <Modal
            title="Basic Modal"
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
        >
            <List
                header={<div> List of Deployments </div>}
                dataSource={this.state.deployments}
                bordered={true}
                renderItem={
                    item => (
                        <div className="list-detail-container">
                            <List.Item>
                                <DeploymentListDetails
                                    driver_object={item.driver_object}
                                    driver={item.driver}
                                    id={item.id}
                                    date={item.shift_date}
                                    start_time={item.start_time}
                                    end_time={item.end_time}
                                    status={item.status}
                                    shuttle={item.shuttle}
                                />
                            </List.Item>
                        </div>
                    )
                }
            />
        </Modal>
    )

    render() {
        return (
            <div className="body-wrapper">
                <div className="header">
                    <div className="header-text">
                        <Icon className="page-icon" icon={driversLicenseO} size={42}/>
                        <div className="page-title"> Remittance History</div>
                        <div className="rem-page-description"> View Remittance History</div>
                    </div>
                    <UserAvatar/>
                </div>
                <div className="driver-history-page-body">
                    <div className="driver-history-body">
                        {this.state.activeSelected && this.renderDeploymentListModal()}
                        <Row className="dates-div">
                            <Col span={12} style={{ 'margin-top': '20px' }}>
                                <RangePicker onChange={onChange}/>
                            </Col>
                            <Col span={12}>
                                <Alert className="history-alert"
                                       message="If end date is not selected, The table will show remittances for 1 week from the start date"
                                       type="info" showIcon/>
                            </Col>
                        </Row>
                        <Row>
                            <div className="driver-history-table-div">
                                <Table columns={this.columns} dataSource={this.state.shifts}/>
                            </div>
                        </Row>
                    </div>
                </div>
            </div>
        );
    }
}


