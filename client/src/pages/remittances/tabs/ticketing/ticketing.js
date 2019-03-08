/**
 * Created by JasonDeniega on 02/07/2018.
 */
import React, { Component } from 'react';
import './style.css'
import emptyStateImage from '../../../../images/empty state record.png'
import { RemittanceList } from '../../components/remittance_list/remittance_list'
import {
    List,
    Table,
    Divider,
    Button,
    Select,
    Avatar,
    Icon,
    Modal,
    Form,
    Input,
    Col,
    Row,
    DatePicker,
    message,
    Alert
} from 'antd'
import { eye } from 'react-icons-kit/fa/eye'
import { DeploymentListDetails } from '../../subpages/driver_remittance/revised_driver_remittance'
import { getData, postData } from '../../../../network_requests/general'
import { RemittanceForm } from '../../components/remittance_form/remittance_form'

const Option = Select.Option

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
    },
};
const ButtonGroup = Button.Group;
// {
//     title: 'Supervisor',
//     dataIndex: 'name',
//     key: 'name',
//     render: (text, record) => (
//         <div>
//             <Avatar size="large" className="table-avatar"
//                     src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"/>
//             <b className="name">{text}</b>
//         </div>
//     ),
// },

export class TicketingPane extends Component {
    state = {
        visible: false,
        activeSelection: null,
    };
    columns = [{
        title: 'Supervisor',
        dataIndex: 'shift_iteration.shift.supervisor.name',
        key: 'shift_iteration.shift.supervisor.name',
        render: text => <p>{text}</p>,
    }, {
        title: 'Date',
        dataIndex: 'shift_iteration.date',
        key: 'shift_iteration.date',
        render: text => <a href="javascript:;">{text}</a>,
    }, {
        title: 'Type',
        dataIndex: 'shift.type',
        key: 'shift.type',
    }, {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
            <a onClick={() => this.handleSelect(record)} href="javascript:;">View</a>
        )
    }];

    componentDidMount() {
        this.fetchSupervisors()
    }

    handleSupervisorSelect = (value) => {
        console.log(value);
        let array = this.state.original_shifts.filter(item => item.shift_iteration.shift.supervisor.id == value);
        this.setState({
            temp_shifts: [...array]
        });
        console.log(this.state.original_shifts);
    }
    reset = () => {
        this.setState({
            temp_shifts: [...this.state.original_shifts]
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
    }
    ;

    handleStartDateChange = (date, dateString) => {
        this.setState({
            start_date_object: date,
            start_date: dateString
        }, () => this.fetchShifts())
    };
    handleEndDateChange = (date, dateString) => {
        this.setState({
            end_date_object: date,
            end_date: dateString
        }, () => this.fetchShifts())
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

    fetchShifts() {
        let data = {
            'start_date': this.state.start_date,
            'end_date': this.state.end_date,
        };
        if (!this.state.start_date) {
            message.error("Start date must be selected")
        }
        else {
            postData('/remittances/shifts/all', data).then(data => {
                console.log(data);
                this.setState({
                    original_shifts: data.shifts,
                    temp_shifts: data.shifts,
                })
            });
        }
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

    renderSupervisors = () => {
        console.log(this.state.supervisors);
        return this.state.supervisors.map(item =>
            <Option value={item.id}>{item.name}</Option>
        )
    }

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
            <div className="ticketing-tab-body">
                <div className="filters">
                    <ButtonGroup>
                        <Button type="primary" className="shift-type">AM</Button>
                        <Button className="shift-type">PM</Button>
                    </ButtonGroup>
                    <Divider orientation="left">Filters</Divider>
                    {/*<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista*/}
                    {/*probare, quae sunt a te dicta? Refert tamen, quo modo.</p>*/}
                    <Row>
                        <Alert className="history-alert"
                               message="If end date is not selected, The table will show remittances for 1 week from the start date"
                               type="info" showIcon/>
                    </Row>
                    <Row className="dates-div">
                        <Col span={24} style={{ 'margin-top': '20px' }}>
                            <Form className="login-form">
                                <Form.Item
                                    {...formItemLayout}
                                    label="Start Date:"
                                >
                                    <DatePicker placeholder="start date" onChange={this.handleStartDateChange}/>
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    label="End Date:"
                                >
                                    <DatePicker placeholder="end date" onChange={this.handleEndDateChange}/>
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    label="Supervisor:"
                                >

                                    <Select onChange={this.handleSupervisorSelect}>
                                        {
                                            this.state.supervisors && this.renderSupervisors()
                                        }
                                    </Select>
                                </Form.Item>
                                <Button {...formItemLayout} type="primary" onClick={this.reset}
                                        size="small">Reset</Button>
                            </Form>
                        </Col>
                    </Row>

                </div>

                {this.state.activeSelected && this.renderDeploymentListModal()}
                <div className="remittance-table">
                    <Row>
                        <div className="driver-history-table-div">
                            <Table columns={this.columns} dataSource={this.state.temp_shifts}/>
                        </div>
                    </Row>
                </div>
            </div>
        );
    }
}