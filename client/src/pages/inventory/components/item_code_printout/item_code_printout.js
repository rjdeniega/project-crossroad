import React, {Component} from 'react';
import './styles.css'
import {Card, Col, Row} from 'antd'
import {getData} from "../../../../network_requests/general";

export class ItemCodePrintout extends Component {
    constructor(props) {
        super(props);

        this.state = {
            items: [],
            categories: [],
        };
    }

    componentDidMount() {
        /** @namespace this.props.po_id **/
        this.loadItems(this.props.po_id);
    }

    loadItems(po_id) {
        getData('inventory/purchase_order/' + po_id + '/items').then(data => {
            let items = [];
            data.items.forEach(function (item) {
                for (let i = 1; i <= item.quantity; i++) {
                    items.push(item)
                }
            });
            console.log(items);
            this.setState({
                categories: data.categories,
                items: items,
            })
        })
    }

    itemRow = () => {
        const {items, categories} = this.state;
        const pageBreak = {
            padding:'0.5in',
            height: '11in',
            width: '4in',
            pageBreakAfter: 'always'
        };
        let to_render = [];
        let page = [];

        items.forEach(function (item, index) {
            to_render.push(
                <div>
                    <Card title={item.item_code} className="item-sticker">
                        <p><strong>Item: </strong>{item.brand} {categories[item.id]}</p>
                        <p><strong>Date Received: </strong>{new Date(item.created).toLocaleDateString()}</p>
                    </Card>
                    <br/>
                </div>
            );
            if (index === 5 || items.length === index + 1) {
                page.push(<div style={pageBreak}>{to_render}</div>);
                to_render = [];
            }
        });
        return page;
    };

    render() {
        return (
            <div className="printout">
                <div className="whole-page">
                    {this.itemRow()}
                </div>
            </div>
        )
    }
}