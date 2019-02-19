import React, {Component} from 'react';
import './style.css';
import {getData} from "../../../../network_requests/general";

export class UpdatePurchaseOrder extends Component {
    constructor(props) {
        super(props);

        this.state = {
            items: [],
        }
    }

    componentDidMount() {
        let po_id = this.props.po_id;
        getData('inventory/purchase_order/' + po_id).then(data => {
            this.setState({
                items: data.items,
            }, () => {
                console.log(this.state)
            })

        })
    }

    render() {
        return (
            <div className="update-purchase-order-layout">
                wah
            </div>
        )
    }
}