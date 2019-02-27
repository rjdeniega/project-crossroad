import React, {Component} from 'react';
import {Table} from 'antd'
import './style.css'
import {getData} from "../../../../network_requests/general";
import _ from 'lodash';
import update from 'react-addons-update'


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
        });
        this.state.items.forEach(function (item, key) {
            let vendor;
            getData('inventory/vendors/' + item.vendor).then(datum => {
                vendor = datum.name
            }, () => {
                this.setState({
                    items: update(this.state.items, {
                        [key]: {
                            vendor: {$set: vendor}
                        }
                    })
                })
            });
        })
    }


    expandedRowRender = (category) => {
        const {items} = this.state;
        const columns = [
            {title: 'Delivery Date', dataIndex: 'created', key: 'created'},
            {title: 'Brand', dataIndex: 'brand', key: 'brand'},
            {title: 'Description', dataIndex: 'description', key: 'description'},
            {title: 'Vendor', dataIndex: 'vendor', key: 'vendor'},
            {title: 'Quantity', dataIndex: 'quantity', key: 'quantity'},
            {title: 'Measurement', dataIndex: 'measurement', key: 'measurement'},
        ];

        let data = [];
        items.forEach(function (item, key) {
            if (item.name === category) {
                    data.push({
                        key: key,
                        created: new Date(item.created).toLocaleDateString(),
                        brand: item.brand,
                        description: item.description,
                        quantity: item.quantity,
                        measurement: item.measurement + item.unit,
                    })
                }

        });
        console.log(data);
        return <Table columns={columns} dataSource={data} pagination={false}/>
    };

    columns = [
        {title: "Item", dataIndex: "item_name", key: "item_name"},
        {title: "Quantity", dataIndex: "total_quantity", key: "total_quantity"},
    ];

    groupedItems = () => {
        let items = this.state.items;
        let data = [];
        let groupedItems = _.groupBy(items, function (d) {
            return d.name
        });
        _.map(groupedItems, function (value, key) {
            let quantity = 0;
            value.forEach(function (item) {
                quantity = quantity + item.quantity;
            });
            data.push({
                item_name: key,
                total_quantity: quantity,
            })
        });
        return data;
    };

    render() {
        return (
            <div>
                <Table columns={this.columns} dataSource={this.groupedItems()}
                       expandedRowRender={record => this.expandedRowRender(record.item_name)}/>
            </div>
        )
    }
}