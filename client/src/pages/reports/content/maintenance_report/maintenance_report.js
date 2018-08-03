import React, {Component} from 'react'
import { getData, postData } from '../../../../network_requests/general'
import { Select, Form } from 'antd'

export class MaintenanceReport extends Component{
    state = {
        shuttles: [],
        loadedShuttle: ''
    }

    componentDidMount(){
        getData('inventory/shuttles/')
            .then(data => {
                this.setState({
                    shuttles: data.shuttles
                })
            })
    }

    getMaintenanceCost(id){
        let cost = 0
        getData('inventory/report/' + id)
            .then(data => {
                console.log(data.maintenance_cost)
                cost = data.maintenance_cost
            })

        return cost;
    }

    render(){
        const {shuttles} = this.state
        const getMaintenanceCost = this.getMaintenanceCost
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 20 },
            },
        };

        return(
            <div>
                <Form>
                    <Form.Item {...formItemLayout} label='Shuttles'>
                        <Select style={{width: '40%'}} placeholder='Please select a shuttle'>
                            {shuttles.map(function(shuttle,index){
                                    var cost = getMaintenanceCost(shuttle.id)
                                    return(
                                        <Select.Option value={shuttle.id}>Shuttle {shuttle.id} - {cost}</Select.Option>
                                    )
                                })}
                        </Select>
                    </Form.Item>
                </Form>
                <br/>
                <div align="center">
                    {this.loadedShuttle ? '' : (<h4>Select a shuttle to view report</h4>)}
                </div>
            </div>
        )
    }
}
