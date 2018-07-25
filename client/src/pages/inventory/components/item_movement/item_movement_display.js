import React, {Component} from 'react';
import {Table} from 'antd'
import '../../../../utilities/colorsFonts.css'

    function formatDate(date) {
        const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
        const tempDate = new Date(date);
        let hours = tempDate.getHours();
        let minutes = tempDate.getMinutes();
        let ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12
        minutes = minutes < 10 ? '0'+minutes : minutes;
        let strTime = hours + ':' + minutes + ' ' + ampm;
        return monthNames[tempDate.getMonth()] + ' ' + tempDate.getDate() + ', '
            + tempDate.getFullYear() + ', ' + strTime
    }

    function checkAction(action){
        if (action === 'B'){
            return 'Bought'
        } else {
            return 'Used in repairs'
        }
    }

    function checkMovementQuantity(record){
        if (record === 'B'){
            console.log(record);
            return '+'
        } else {
            return '-'
        }
    }
export class ItemMovementTable extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            isLoading: false,
            item: props.item,
            data: '',
        };

        this.columns = [
            {
                title: 'Date',
                dataIndex: 'created',
                key: 'created',
                render: text =>(
                    <span>{formatDate(text)}</span>
                )
            }, {
                title: 'Action',
                dataIndex: 'type',
                key: 'type',
                render: text =>(
                    <span>{checkAction(text)}</span>
                )
            },
            {
                title: 'Vendor',
                dataIndex: 'vendor',
                key: 'vendor'
            }, {
                title: 'Amount',
                dataIndex: 'quantity',
                key: 'quantity',
                render: (text, record) => (
                    <span>
                        {checkMovementQuantity(record.type)}
                        {`${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </span>
                )
            }, {
                title: 'Unit Price',
                dataIndex: 'unit_price',
                key: 'unit_price',
                render: text => (
                    <span>
                        ₱{parseFloat(text).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                    </span>
                )
            }
        ]
    }

    componentDidMount(){
        this.setState({isLoading: true});
        this.fetchItems()
    }

    componentDidUpdate(){
        this.fetchItems();
    }

    fetchItems(){
        fetch('inventory/items/restock/' + this.state.item.id)
            .then(response => {
                return response;
            })
            .then(response => response.json())
            .then(data => this.setState({data: data.movements, isLoading: false}));
    }

    render(){

        const {data, isLoading, item} = this.state;

        if(isLoading){
            return(
                <div>
                    <p><strong>Current Quantity: </strong>{item.quantity}</p>
                    <Table className={'item-movement-table'} loading={true} pagination={{pageSize: 30}}
                           rowKey={'id'} columns={this.columns}/>
                </div>
            )
        } else {
            return(
                <div>
                    <p><strong>Current Quantity: </strong>{item.quantity}</p>
                    <Table className={'item-movement-table'} pagination={{pageSize: 30}} rowKey={'id'}
                           dataSource={data} columns={this.columns}/>
                </div>
            )
        }

    }
}