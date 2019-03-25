import React, {Component} from 'react';
import './style.css'
import {getData} from "../../../../network_requests/general";
import {Table, Row, Col, Divider, message, Modal, Button, Avatar} from 'antd'
import NumberFormat from 'react-number-format';
import ReactToPrint from 'react-to-print';
import {Icon} from 'react-icons-kit';
import {printer} from 'react-icons-kit/icomoon/printer';
import {ItemCodePrintout} from "../item_code_printout/item_code_printout";
import LBATSCLogo from "../../../../images/LBATSCLogo.png";

function pad(num) {
    let digits = 6 - num.toString().length;
    let output = '';
    for (let i = 0; i < digits; i++) {
        output += '0';
    }
    output = output + num;
    return output;
}

const columns = [{
    title: "Item",
    dataIndex: 'details',
    key: 'details',
    width: '3.5in',
    align: "left"
}, {
    title: "Quantity",
    dataIndex: 'quantity',
    key: 'quantity',
    align: 'center',
}, {
    title: "Unit Price",
    dataIndex: 'unit_price',
    key: 'unit_price',
    align: 'right',
}, {
    title: "Total",
    dataIndex: 'total',
    key: 'total',
    align: 'right',
    width: '1.5in',
}];

function createRows(items, categories) {
    let rows = [];
    let grand_total = 0;
    for (let i = 0; i <= 7; i++) {
        let total = 0;
        let measurement = "";
        if (items[i]) {
            total = parseInt(items[i].quantity) * parseInt(items[i].unit_price);
            if (items[i].measurement) {
                measurement = items[i].measurement + items[i].unit;
            }
        }
        rows.push({
            key: i,
            details: items[i] ? (items[i].brand + " " + measurement + " - " + items[i].description) : '',
            quantity: items[i] ? items[i].quantity : ' ',
            unit_price: items[i] ?
                <NumberFormat value={items[i].unit_price} displayType={'text'} thousandSeparator={true} prefix={'Php'}
                              decimalScale={2} fixedDecimalScale={true}/> : ' ',
            total: total ? <NumberFormat value={total} displayType={'text'} thousandSeparator={true} prefix={'Php'}
                                         decimalScale={2} fixedDecimalScale={true}/> : ' ',
        });
        grand_total = total + grand_total;
    }
    rows.push({
        key: 9,
        unit_price: "Total: ",
        total: <NumberFormat value={grand_total} displayType={'text'} thousandSeparator={true} prefix={'Php'}
                             decimalScale={2} fixedDecimalScale={true}/>
    });

    return rows;
}

export class PurchaseOrderView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            po_id: '',
            po_number: '',
            vendor_name: '',
            vendor_address: '',
            vendor_contact: '',
            special_instructions: '',
            items: [],
            categories: [],
            grand_total: '',
            date: '',
            expected_delivery: '',
        }
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    handleOk = (e) => {
        console.log(e);
        this.setState({
            visible: false,
        });
    };

    handleCancel = (e) => {
        console.log(e);
        this.setState({
            visible: false,
        });
    };

    componentDidMount() {
        console.log(this.props);
        this.loadPO(this.props.po_id);
    }

    componentDidUpdate(prevProps) {
        if (this.props.po_id !== prevProps.po_id) {
            this.loadPO(this.props.po_id)
        }
    }

    loadPO(po_id) {
        getData('inventory/purchase_order/' + po_id).then(data => {
            /** @namespace data.purchase_order **/
            /** @namespace data.vendor.contact_number **/
            this.setState({
                po_number: data.purchase_order.po_number,
                po_id: data.purchase_order.id,
                vendor_name: data.vendor.name,
                vendor_address: data.vendor.address,
                vendor_contact: data.vendor.contact_number,
                special_instructions: data.purchase_order.special_instruction,
                items: data.items,
                order_date: data.purchase_order.order_date,
                categories: data.categories,
                expected_delivery: data.purchase_order.expected_delivery
            }, () => {
                console.log(this.state.categories)
            })
        })
    }

    render() {
        const {
            po_id, po_number, vendor_name, vendor_address, vendor_contact, special_instructions, order_date, items,
            categories, expected_delivery
        } = this.state;
        const {status} = this.props;
        return (
            <span>
                <a onClick={this.showModal}>View</a>
                <Modal
                    title="Purchase Order"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    className="purchase-order-modal"
                    footer={[
                        <ReactToPrint key={1}
                                      trigger={() => <Button htmlType="button" type="primary"><Icon className="print"
                                                                                                    icon={printer}
                                                                                                    size={14}/> &nbsp;
                                          Print Purchase Order </Button>}
                                      content={() => this.componentRef}
                        />, status === "Complete" ?
                            <ReactToPrint key={2}
                                          trigger={() => <Button htmlType='button'
                                                                 type="primary">
                                              <Icon
                                                  className="print"
                                                  icon={printer}
                                                  size={14}/>&nbsp;Print Item Codes</Button>}
                                          content={() => this.componentRef2}/> : ''

                    ]}
                >
                    <ItemCodePrintout ref={el => (this.componentRef2 = el)} po_id={po_id}/>
                    <div className="purchase-order-view" ref={el => (this.componentRef = el)}>
                        <Row type="flex" justify="space-between" align="bottom">
                            <Col span={3}>
                                <Avatar shape="square" size={84} src={LBATSCLogo}/>
                            </Col>
                            <Col span={9}>
                                <h2>Laguna Bel-Air Transport Service Cooperative</h2>
                            </Col>
                            <Col span={12}>
                                <h2 align="right">Purchase Order</h2>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <p className="form-info">Sta. Ana Street, Laguna Bel-Air Subdivision 2, Ph 5</p>
                            </Col>
                            <Col span={12}>
                                <p align="right" className="form-info">PO #: {pad(po_number)}</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <p className="form-info">Sta. Rosa City, Laguna, ZIP: 4026</p>
                            </Col>
                            <Col span={12}>
                                <p align="right"
                                   className="form-info">Order Date: {new Date(order_date).toLocaleDateString()}</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <p className="form-info">Phone: +63(49) 530-1166</p>
                            </Col>
                            <Col span={12}>
                                <p align="right">Expected Delivery Date: {new Date(expected_delivery).toLocaleDateString()}</p>
                            </Col>
                        </Row>
                        <br/>
                        <Row>
                            <Col span={12}>
                                <h3>Vendor</h3>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <p align="left">Vendor Name: {vendor_name} </p>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <p align="left">Vendor Address: {vendor_address} </p>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <p align="left">Vendor Contact: {vendor_contact} </p>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Table pagination={false} columns={columns} bordered size="small"
                                       dataSource={createRows(items, categories)}/>
                            </Col>
                        </Row>
                        <br/>
                        <Row>
                            <Col span={24}>
                                <p>Special Instructions: </p>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <p>{special_instructions}</p>
                            </Col>
                        </Row>
                        <br/>
                        <Row>
                            <Col span={8}>
                                <h3>Authorized by: <Divider/></h3>
                            </Col>
                        </Row>
                    </div>
                </Modal>
            </span>
        )
    }
}