import React, {Component} from 'react';
import {Form, Spin, Table, DatePicker, Typography, Row, Col, Button, Avatar} from 'antd'
import {getData, postData} from "../../../../network_requests/general";
import moment from 'moment'
import LBATSCLogo from '../../../../images/LBATSCLogo.png'

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
            grand_totals: null,
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
            start_date: start_date,
            end_date: end_date,
        };

        postData('inventory/vendor/report/', data).then(data => {
            this.setState({
                loading: false,
                data: data.vendors,
                grand_totals: data.grand_totals
            });
            console.log(data)
        })
    }

    render() {
        const {start_date, empty, loading, end_date, data, grand_totals} = this.state;
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
            width: 50,
            dataIndex: 'name',
            key: 'name',
            align: 'left',
            render: text => {
                return <strong>{text}</strong>
            }
        }, {
            title: 'Item',
            width: 50,
            dataIndex: 'item',
            key: 'item',
            align: 'left',
            render: (text) => {
                if (text === 'Total' || text === 'Grand Total') {
                    return <strong>{text}</strong>
                } else {
                    return <p>{text}</p>
                }
            }
        }, {
            title: 'No. of late deliveries',
            width: 20,
            dataIndex: 'late',
            key: 'late',
            align: 'center',
            render: (text, row) => {
                if (row.item === 'Total' || row.item === 'Grand Total') {
                    return <strong>{text}</strong>
                } else {
                    return <p>{text}</p>
                }
            }
        }, {
            title: 'No. of deliveries with defects',
            width: 20,
            dataIndex: 'defective',
            key: 'defective',
            align: 'center',
            render: (text, row) => {
                if (row.item === 'Total' || row.item === 'Grand Total') {
                    return <strong>{text}</strong>
                } else {
                    return <p>{text}</p>
                }
            }
        }, {
            title: 'No. of on time deliveries',
            width: 20,
            dataIndex: 'on_time',
            key: 'on_time',
            align: 'center',
            render: (text, row) => {
                if (row.item === 'Total' || row.item === 'Grand Total') {
                    return <strong>{text}</strong>
                } else {
                    return <p>{text}</p>
                }
            }
        }, {
            title: 'Total deliveries',
            width: 20,
            dataIndex: 'total',
            key: 'total',
            align: 'center',
            render: (text, row) => {
                if (row.item === 'Total' || row.item === 'Grand Total') {
                    return <strong>{text}</strong>
                } else {
                    return <p>{text}</p>
                }
            }
        }];

        return (
            <div>
                <Form.Item label="Date Range" {...datePickerLayout}>
                    <DatePicker.RangePicker disabledDate={disabledDate} onChange={(date, dateString) => {
                        this.setState({start_date: dateString[0], end_date: dateString[1]}, () => console.log(this.state))
                    }}/>
                </Form.Item>
                <Form.Item {...buttonLayout}>
                    <Button htmlType='button' type='primary'
                            disabled={start_date === null} onClick={this.loadReport}>Confirm</Button>
                </Form.Item>
                <br/>
                <div>
                    <Row type='flex' justify='center'>
                        <Col offset={12} span={12}>
                            <Avatar shape="square" size={64} src={LBATSCLogo}/>
                        </Col>
                    </Row>
                    <br/>
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
                                    <Typography type='secondary' style={{textAlign: 'center'}} strong>Vendor
                                        Performance Report
                                        from {start_date} to {end_date}</Typography>
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
                            <Row type='flex' justify='center'>
                                <Col span={12}>
                                    <Typography type='secondary' style={{textAlign: 'center'}}>Vendor Performance
                                        from {start_date} to {end_date}</Typography>
                                </Col>
                            </Row>
                            <br/>
                            <Table columns={columns} dataSource={data} size='small' bordered={false}
                                   pagination={{
                                       defaultPageSize: 20,
                                       showSizeChanger: true,
                                       pageSizeOptions: ['10', '20', '30']
                                   }}/>
                            <Table columns={columns} dataSource={grand_totals} size='small' pagination={false}
                                   showHeader={false}/>
                            <Row type='flex' justify='center'>
                                <br/>
                                <br/>
                                <br/>
                                <Col span={12}>
                                    <Typography.Title level={3} style={{textAlign: 'center'}}>End of Report
                                    </Typography.Title>
                                </Col>
                            </Row>
                        </div>)}
                </div>
            </div>
        );
    }
}