import React, {Component} from 'react';
import {Col, List, Empty, Form, Input, Typography, Button, message, Tag} from 'antd'
import {getData, postData} from "../../../../network_requests/general";
import update from 'react-addons-update'

export class DriverRepairRequest extends Component {
    constructor(props) {
        super(props);

        this.state = {
            shuttle: null,
            findings: [],
            repairs: [],
        };

        this.submitRepairRequest = this.submitRepairRequest.bind(this);
        this.getState = this.getState.bind(this);
    }

    componentDidMount() {
        this.getState();
    }

    getState() {
        getData('inventory/repair_request/driver/' + JSON.parse(localStorage.user).id).then(data => {
            this.setState({
                shuttle: data.shuttle,
                repairs: data.repairs,
            })
        })
    }

    submitRepairRequest() {
        let data = {
            problems: this.state.findings
        };
        postData('inventory/repair_request/driver/'+ JSON.parse(localStorage.user).id, data).then(data => {
            console.log(data.foo)
        });
        message.success("Repair request has been submitted");
        this.getState()
    }

    updateField(e) {
        this.setState({
            findings: update(this.state.findings, {
                0: {$set: e}
            })
        }, () => {
            console.log(this.state)
        })
    }

    render() {
        const {shuttle, repairs} = this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 2},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 14},
            },
        };
        const buttonLayout = {
            wrapperCol: {
                sm: {
                    span: 6,
                    offset: 2,
                },
            }
        };
        return (
            <div>
                <Col span={6}>
                    <List itemLayout='horizontal' header={<div>Repair Requests</div>} dataSource={repairs}
                          locale={{emptyText: <Empty description="No repair requests"/>}}
                          renderItem={item => (
                              <List.Item>
                                  <List.Item.Meta
                                      title={<span>
                                          <Typography.Text strong>
                                              Shuttle no. {item.shuttle} - {item.date_requested}
                                          </Typography.Text>
                                          <br/>
                                          <Tag color={item.status === "FI" ? "blue" :
                                                      item.status === "C" ? "green" :
                                                      item.status === "IP" && "yellow"}
                                          >{item.status === "FI" ? "For Investigation":
                                                item.status === "C" ? "Complete":
                                                item.status === "IP" ? "In Progress":
                                                item.status === "NS" ? "Not Started":
                                                item.status === "FO" && "For Outsource"}</Tag>
                                      </span>}
                                      description={item.findings}
                                  />
                              </List.Item>
                          )}/>
                </Col>
                <Col span={16}>
                    <div style={{
                        border: 'solid',
                        borderRadius: '5px',
                        height: '73vh',
                        width: '65vw',
                        padding: '2vh',
                        marginTop: '1vh',
                        marginLeft: '1vw',
                        borderWidth: '1px',
                        borderColor: "#E8E8E8",
                        textAlign: 'left'
                    }}>
                        <Typography.Title>Submit Repair Request</Typography.Title>
                        <Typography.Title level={4}>Shuttle no. {shuttle && shuttle.shuttle_number} </Typography.Title>
                        <Form.Item label="Problems" {...formItemLayout}>
                            <Input.TextArea onChange={e => this.updateField(e.target.value)} rows={4}/>
                        </Form.Item>
                        <Form.Item {...buttonLayout}>
                            <Button htmlType="button" type="primary" onClick={this.submitRepairRequest}>Submit</Button>
                        </Form.Item>
                    </div>
                </Col>
            </div>

        )
    }
}