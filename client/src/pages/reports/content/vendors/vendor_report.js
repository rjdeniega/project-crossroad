import React, {Component} from 'react';
import {Form, Spin, Table, DatePicker, Typography, Row, Col, Button} from 'antd'
import {getData, postData} from "../../../../network_requests/general";
import moment from 'moment'

function disabledDate(current) {
    // Can not select days before today and today
    return current && current > moment().endOf('day');
}

export class VendorReport extends Component {
    constructor(props) {
        super(props);

        this.state = {
            empty: true,
            start_date: null,
            end_date: null,
            loading: false,
            data: null,
        };

        this.loadReport = this.loadReport.bind(this)
    }

    // componentDidMount() {
    //     getData('inventory/vendor/report').then(data => {
    //         console.log(data)
    //     })
    // }

    loadReport() {
        const {start_date, end_date} = this.state;
        this.setState({
            empty: false,
            loading: true,
        });

        let data = {
            start_date: start_date.toDate(),
            end_date: end_date.toDate(),
        };

        postData('inventory/vendor/report/', data).then(data => {
            this.setState({
                loading: false,
                data: data.vendors
            });
            console.log(data)
        })
    }

    render() {
        const {start_date, empty, loading, end_date, data} = this.state;
        const datePickerLayout = {
            labelCol: {
                sm: {span: 4},
            },
            wrapperCol: {
                sm: {span: 6},
            },
        };
        const buttonLayout = {
            wrapperCol: {
                sm: {
                    span: 6,
                    offset: 4
                }
            },
        };

        const columns = [{
            title: 'Vendor',
            dataIndex: 'name',
            key: 'name',
            align: 'left',
        }, {
            title: 'No. of late deliveries',
            dataIndex: 'late',
            key: 'late'
        }, {
            title: 'No. of deliveries with defects',
            dataIndex: 'defective',
            key: 'defective',
        }, {
            title: 'No. of on time deliveries',
            dataIndex: 'on_time',
            key: 'on_time',
        }, {
            title: 'Total deliveries',
            dataIndex: 'total',
            key: 'total',
        }];

        return (
            <div>
                <Form.Item label="Date Range" {...datePickerLayout}>
                    <DatePicker.RangePicker disabledDate={disabledDate} onChange={(date) => {
                        this.setState({start_date: date[0], end_date: date[1]}, () => console.log(this.state))
                    }}/>
                </Form.Item>
                <Form.Item {...buttonLayout}>
                    <Button htmlType='button' type='primary'
                            disabled={start_date === null} onClick={this.loadReport}>Confirm</Button>
                </Form.Item>
                <br/>
                <div>
                    <Row type='flex' justify='center'>
                        <Col span={12}>
                            <Typography.Title level={3} style={{textAlign: 'center'}}>Vendor Performance
                                Report</Typography.Title>
                        </Col>
                    </Row>
                    {empty ? (
                        <Row type='flex' justify='center'>
                            <Col span={12}>
                                <Typography style={{textAlign: 'center'}}>Please select a start date and end
                                    date</Typography>
                            </Col>
                        </Row>
                    ) : loading ? (
                        <div>
                            <Row type='flex' justify='center'>
                                <Col span={12}>
                                    <Typography type='secondary' style={{textAlign: 'center'}}>Vendor Performance
                                        from {start_date.toDate().toLocaleDateString()} to {end_date.toDate().toLocaleDateString()}</Typography>
                                </Col>
                            </Row>
                            <br/>
                            <Row type='flex' justify='center'>
                                <Col span={12} offset={12}>
                                    <Spin size='large'/>
                                </Col>
                            </Row>
                        </div>) : (
                        <div>
                            <Table columns={columns} dataSource={data}/>
                        </div>)}
                </div>
            </div>
        );
    }
}