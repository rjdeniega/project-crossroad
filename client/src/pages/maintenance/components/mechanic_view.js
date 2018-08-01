import React, {Component} from 'react'
import {Icon} from 'react-icons-kit'
import PerfectScrollbar from '@opuscapita/react-perfect-scrollbar';
import {List, Row, Col} from 'antd'
import {ic_loop} from 'react-icons-kit/md/ic_loop'
import {ic_access_time} from 'react-icons-kit/md/ic_access_time'
import {ic_navigate_next} from 'react-icons-kit/md/ic_navigate_next'

const div_style = {border: 'solid', width: '100%',
             borderColor: '#E8E8E8', borderRadius: 5,
             borderWidth: 1, padding: 20,
             backgroundColor: 'white', height: '78vh'}

export class MechanicView extends Component{
    constructor(props){
        super(props);
        this.state = {
            repairs: [],
            loadedRepair: '',
            problems: '',
            findings: '',
            modifications: '',
        }
    }

    componentDidMount(){
        fetch('inventory/mechanic/repairs')
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
                }
            )
    }

    loadNewRepair = (record) => {
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

    render(){
        const {repairs, loadedRepair, problems, findings, modifications} = this.state
        const loadNewRepair = this.loadNewRepair

        return(
            <div style={{padding: 10}}>
                <Row gutter={16}>
                    <Col span={8}>
                        <div style={div_style}
                                     align='middle'>
                            {repairs.length == 0 ? (
                                <h2>There are no outstanding repairs</h2>
                            ) : (
                                <PerfectScrollbar>
                                    <List header={<h3>Repairs</h3>} bordered itemLayout='horizontal'>
                                            {repairs.map(function(repair, index){
                                                return(
                                                    <List.Item actions={[<Icon icon={ic_navigate_next}
                                                                    onClick={() => loadNewRepair(repair)}
                                                                    size={24} style={{verticalAlign: 'middle'}}/>]}>
                                                        <List.Item.Meta
                                                            avatar={<Icon icon={repair.status == 'NS' ?
                                                                            ic_access_time : ic_loop}
                                                                        style={{color: '#E9C46A'}}/>}
                                                            title={<h4>Repair {repair.id} </h4>}
                                                            description={'Date requested ' + repair.date_requested}
                                                            align="left"/>
                                                    </List.Item>
                                                )
                                            })}
                                    </List>
                                </PerfectScrollbar>
                            )}
                        </div>
                    </Col>
                    <Col span={16}>
                        <div style={div_style}>
                            {!loadedRepair ? (
                                <h2>Select a repair to load</h2>
                            ) : 'no'}
                        </div>
                    </Col>
                </Row>
            </div>
        )
    }
}
