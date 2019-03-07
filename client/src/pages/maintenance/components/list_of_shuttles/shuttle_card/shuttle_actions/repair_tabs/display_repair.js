import React, {Component} from 'react'
import {Icon} from 'react-icons-kit'
import {List} from 'antd'
import {getData} from '../../../../../../../network_requests/general'
import {ic_access_time} from 'react-icons-kit/md/ic_access_time'
import {ic_done} from 'react-icons-kit/md/ic_done'
import {ic_loop} from 'react-icons-kit/md/ic_loop'
import PerfectScrollbar from '@opuscapita/react-perfect-scrollbar';

export class RepairDisplay extends Component{
    constructor(props){
        super(props);
    }

    checkStatus(status){
        switch(status){
            case 'NS':
                return (<span><Icon size={24} icon={ic_access_time}
                             style={{color: '#E9C46A',
                                     verticalAlign: 'middle'}}/> Not Started</span>);
            case 'IP':
                return (<span><Icon icon={ic_loop} size={24}
                            style={{color: '#E9C46A',
                                    verticalAlign: 'middle'}}/> In Progress</span>);
            default:
                return (<span><Icon icon={ic_done}
                             size={24}
                             style={{ color: '#42933C',
                                      verticalAlign: 'middle'}}/> Completed</span>);
        }
    }

    render(){
        let {repair, problems, findings, modifications, outsourcedItems, items} = this.props;


        return(
            <div style={{border: 'solid', width: '100%',
                        borderColor: '#E8E8E8', borderRadius: 5,
                        borderWidth: 1, padding: 20}} align={!repair.id ? 'middle' : 'left'}>
                {!repair.id ? (
                    <h2>Please select a repair</h2>
                ) : (
                    <div>
                        <PerfectScrollbar>
                            <h3>Shuttle {repair.shuttle} - Repair {repair.id}</h3>
                            <i>Date requested: {repair.date_requested}</i>
                            <p>{this.checkStatus(repair.status)}</p>
                            {!repair.labor_fee ? '': (
                                <p><b>Labor Fee: </b>₱{repair.labor_fee}</p>
                            )}
                            {!repair.start_date ? '': (
                                <p><b>Start date: </b>{repair.start_date}</p>
                            )}
                            {!repair.end_date ? '': (
                                <p><b>End date: </b>{repair.end_date}</p>
                            )}
                            <br/>
                            <List size='small' header={<div><h3>Problems</h3></div>}
                                  bordered>
                                  {problems.map(function(problem, index){
                                      return (
                                          <List.Item>{problem.description}</List.Item>
                                      )
                                  })}
                            </List>
                            <br/>
                            {findings.length === 0 ? '' :
                                (
                                    <List size='small' header={<h3>Findings</h3>}
                                          bordered>
                                          {findings.map(function(finding, index){
                                          return (
                                              <List.Item>{finding.description}</List.Item>
                                          )})}
                                    </List>
                            )}
                            <br/>
                            {modifications.length === 0 ? '' :
                                (
                                    <List size='small' header={<h3>Items Used</h3>}
                                          bordered>
                                          {modifications.map(function(modification, index){
                                              return items.map(function(item, index){
                                                  if(item.id === modification.item_used){
                                                      console.log('nice')
                                                      return (
                                                      <List.Item>{modification.quantity} - {item.name}</List.Item>
                                                    )
                                                  }

                                              })
                                        })}
                                    </List>
                            )}
                            {outsourcedItems.length == 0 ? '' :
                            (
                                <List size='small' header={<h3>Outsourced Repair</h3>}
                                        bordered>
                                        {outsourcedItems.map(function(item, index){
                                            return (
                                                <List.Item>P{item.unit_price} - {item.item}, {item.quantity} px</List.Item>
                                            )
                                        })}
                                </List>
                            )}
                            <br/>
                            {}
                        </PerfectScrollbar>
                    </div>
                )}
            </div>
        )
    }
}
