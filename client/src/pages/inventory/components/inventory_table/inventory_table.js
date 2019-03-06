import React, {Component} from 'react';
import {Table, Empty} from 'antd'
import './style.css'
import {getData} from "../../../../network_requests/general";
import _ from 'lodash';
import update from 'react-addons-update'


export class InventoryTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            item_categories: [],
            items: [],
            vendors: [],
        };

        this.loadItems = this.loadItems.bind(this);
        this.expandedRowRender = this.expandedRowRender.bind(this);
    }

    componentDidMount() {
        this.loadItems()
    }

    loadItems() {
        /** @namespace data.item_category **/
        getData('inventory/items/item_category/').then(data => {
            this.setState({
                item_categories: data.item_category,
            })
        });
        getData('inventory/items/').then(data => {
            this.setState({
                items: data.items,
                vendors: data.vendors,
            })
        });
    }


    expandedRowRender = (category) => {
        const {items, vendors} = this.state;
        const columns = [
            {title: 'Delivery Date', dataIndex: 'created', key: 'created', align: 'left'},
            {title: 'Brand', dataIndex: 'brand', key: 'brand', align: 'left'},
            {title: 'Description', dataIndex: 'description', key: 'description', align: 'left'},
            {title: 'Vendor', dataIndex: 'vendor', key: 'vendor', align: 'left'},
            {title: 'Quantity', dataIndex: 'quantity', key: 'quantity', align: 'center'},
            {title: 'Measurement', dataIndex: 'measurement', key: 'measurement', align: 'center'},
        ];

        let data = [];
        items.forEach(function (item, key) {
            let measurement = "N/A";
            if(item.measurement){
                measurement = item.measurement + item.unit
            }
            if (item.category === category) {
                data.push({
                    key: key,
                    created: new Date(item.created).toLocaleDateString(),
                    brand: item.brand,
                    description: item.description,
                    vendor: vendors[item.id],
                    quantity: item.quantity,
                    measurement: measurement,
                })
            }

        });
        return <Table columns={columns} dataSource={data} pagination={false}/>
    };

    columns = [
        {title: "Item", dataIndex: "category", key: "category", align: 'left'},
        {title: "Quantity", dataIndex: "quantity", key: "quantity", align: 'center'},
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
        const {item_categories} = this.state;
        return (
            <div>
                <Table columns={this.columns} dataSource={item_categories} locale={{
                    emptyText:
                        <Empty description="No data. Add categories and add items through purchase orders."/>
                }}
                       expandedRowRender={record => this.expandedRowRender(record.id)}/>
            </div>
        )
    }
}