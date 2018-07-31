import React, {Component} from 'react'
import {Icon} from 'react-icons-kit'
import {Table, Divider, Button} from 'antd'
import {ic_pageview} from 'react-icons-kit/md/ic_pageview'
import {ic_access_time} from 'react-icons-kit/md/ic_access_time'
import {ic_done} from 'react-icons-kit/md/ic_done'
import {RepairDisplay} from './display_repair'

export class RepairsTable extends Component{
    constructor(props){
        super(props);
        this.state = {
            shuttle: props.shuttle,
            repairs: [],
            loadedRepair: '',
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
                                      style={{ color:'#E9C46A'}}/>
                                 Not Started</p>
                        </span>
                    )
                } else if (record === 'IP'){
                    return(
                        <span>In Progress</span>
                    )
                } else {
                    return(
                        <span> <Icon icon={ic_done}
                                     size={24}
                                     style={{ color: '#42933C'}}/>Completed</span>
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
        this.setState({
            loadedRepair: record
        }, () => console.log(this.state.loadedRepair))
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
        const {repairs} = this.state;

        if (repairs.length === 0){
            return(
                <div>
                    <p>wow</p>
                </div>
            )
        }else{
            return(
                <div height={{height: '100%', width: '100%'}}>
                    <div style={{width: '40%'}}>
                        <br/>
                        <Table size={'small'} dataSource={repairs}
                               columns={this.columns}
                               loadNewRepair={this.loadNewRepair}/>
                    </div>
                    <div style={{width: '60%'}}>
                        <RepairDisplay loadedRepair={this.state.loadedRepair}/>
                    </div>
                </div>
            )
        }
    }
}
