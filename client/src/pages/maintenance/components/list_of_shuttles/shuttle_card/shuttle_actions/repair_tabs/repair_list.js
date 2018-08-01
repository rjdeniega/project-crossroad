import React, {Component} from 'react'
import {Icon} from 'react-icons-kit'
import {Table, Divider, Button, Row, Col} from 'antd'
import {ic_pageview} from 'react-icons-kit/md/ic_pageview'
import {ic_access_time} from 'react-icons-kit/md/ic_access_time'
import {ic_done} from 'react-icons-kit/md/ic_done'
import {ic_loop} from 'react-icons-kit/md/ic_loop'
import {RepairDisplay} from './display_repair'

export class RepairsTable extends Component{
    constructor(props){
        super(props);
        this.state = {
            shuttle: props.shuttle,
            repairs: [],
            loadedRepair: '',
            problems: '',
            findings: '',
            modifications: '',
        };

        this.columns = [{
            title: 'Date Requested',
            dataIndex: 'date_requested',
            key: 'date_requested'
        }, {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: record => {
                if(record === 'NS'){
                    return(
                        <span>
                            <p style={{color: '#000000'}}>
                                <Icon icon={ic_access_time}
                                      size={24}
                                      style={{ color:'#E9C46A', verticalAlign: 'middle'}}/>
                                      &ensp;Not Started</p>
                        </span>
                    )
                } else if (record === 'IP'){
                    return(
                        <span><Icon icon={ic_loop} size={24}
                                    style={{color: '#E9C46A', verticalAlign: 'middle'}}/>
                                    &ensp;In Progress</span>
                    )
                } else {
                    return(
                        <span> <Icon icon={ic_done}
                                     size={24}
                                     style={{ color: '#42933C', verticalAlign: 'middle'}}
                                     />&ensp;Completed</span>
                    )
                }
            }
        }, {
            title: '',
            key: 'action',
            align: 'center',
            render: record => {
                return(
                    <span> <Icon className='view-repair' icon={ic_pageview}
                                 onClick={() => this.loadNewRepair(record)}
                                 size={24}
                                 style={{cursor: 'pointer'}}/> </span>
                )
            }
        }]
    }

    componentDidMount(){
        console.log("repair mounted");
        this.fetchRepairs();
    }

    loadNewRepair = (record) => {
        console.log(record);

        fetch('inventory/shuttles/repairs/specific/' + record.id)
            .then(response => {
                return response;
            })
            .then(response => response.json())
            .then(data => this.setState({
                problems: data.problems,
                findings: data.findings,
                modifications: data.modifications,
                loadedRepair: record
            }))
    };

    fetchRepairs() {
        const {shuttle} = this.state;
        console.log(shuttle.id);
        fetch('inventory/shuttles/repairs/' + shuttle.id)
            .then(response => response.json())
            .then(
                data => {
                    if(!data.error){
                        this.setState({
                            repairs: data.repairs
                        })
                    } else {
                        console.log(data.error)
                    }
            })
    };

    render(){
        const {repairs, loadedRepair, problems, findings, modifications} = this.state;

        if (repairs.length === 0){
            return(
                <div>
                    <p>wow</p>
                </div>
            )
        }else{
            return(
                <div style={{paddingTop: 10}}>
                    <Row gutter={16}>
                        <Col span={10}>
                            <Table size={'small'} dataSource={repairs}
                                   columns={this.columns}
                                   loadNewRepair={this.loadNewRepair}/>
                        </Col>
                        <Col span={14}>
                            <RepairDisplay repair={loadedRepair}
                                           problems={problems}
                                           findings={findings}
                                           modifications={modifications}/>
                        </Col>
                    </Row>
                </div>
            )
        }
    }
}
