import React, {Component} from 'react';
import {Table} from 'antd'
import './style.css'
import {getData} from "../../../../network_requests/general";

export class InventoryTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            items: [],
        };
    }

    componentDidMount() {
        this.loadItems()
    }

    loadItems() {
        getData('inventory/items/').then(data => {
            this.setState({
                items: data.items
            }, () => {
                console.log(this.state.items)
            })
        })
    }


    expandedRowRender = (category) => {
        const columns = [
            {title: 'Delivery Date', dataIndex: 'created', key: 'created'},
            {title: 'Brand', dataIndex: 'brand', key: 'brand'},
            {title: 'Description', dataIndex: 'description', key: 'description'},
            {title: 'Vendor', dataIndex: 'vendor', key: 'vendor'},
            {title: 'Quantity', dataIndex: 'quantity', key: 'quantity'},
            {title: 'Measurement', dataIndex: 'measurement', key: 'measurement'},
        ];

        const data = [];
        this.state.items.forEach(function (item, key) {
            let vendor;
            getData('inventory/vendors/' + item.vendor).then(data => {
                vendor = data.vendor.name
            }).then(() => {
                if (item.name === category) {
                    data.push({
                        key: key,
                        delivery_date: item.created,
                        brand: item.brand,
                        description: item.description,
                        vendor: vendor,
                        quantity: item.quantity,
                        measurement: item.measurement + item.unit
                    })
                }
            });
        });
        console.log(data);
        return <Table columns={columns} dataSource={data} pagination={false}/>
    };

    columns = [
        {}
    ];

    render() {
        return (
            <div>
                {this.expandedRowRender("Oil")}
            </div>
        )
    }
}