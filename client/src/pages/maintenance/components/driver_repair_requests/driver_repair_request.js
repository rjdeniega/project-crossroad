import React, {Component} from 'react';
import {Col, List, Empty} from 'antd'

export class DriverRepairRequest extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <Col span={6}>
                    <List itemLayout='horizontal' header={<div>Repair Requests</div>}
                          locale={{emptyText: <Empty description="No repair requests"/>}}/>
                </Col>
                <Col span={16}>
                    <div style={{
                        border: 'solid', borderRadius: '5px', height: '73vh', width: '65vw',
                        marginTop: '1vh', marginLeft: '1vw', borderWidth: '1px', borderColor: "#E8E8E8"
                    }}>

                    </div>
                </Col>
            </div>

        )
    }
}