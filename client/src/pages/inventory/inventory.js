/**
 * Created by Jason Deniega on 01/07/2018.
 */
import React, {Component} from 'react';
import {Header} from "./components/header/inventory-header"
import {Icon} from 'react-icons-kit'
import {warning} from 'react-icons-kit/typicons/warning'
import {arrowSortedDown} from 'react-icons-kit/typicons/arrowSortedDown'
import {zoom} from 'react-icons-kit/typicons/zoom'
import {printer} from 'react-icons-kit/icomoon/printer'
import {
    Row,
    Col,
    Button,
    Modal,
    message,
    Table,
    Form,
    Menu,
    Dropdown,
    Input,
    InputNumber,
    Popconfirm,
    Tooltip,
    Tabs,
    Divider
} from 'antd'
import {ItemMovementTable} from "./components/item_movement/item_movement_display";
import {PurchaseOrderList} from "./components/purchase_order_list/purchase_order_list";
import '../../utilities/colorsFonts.css'
import './style.css'
import {PurchaseOrderForm} from "./components/purchase_order_form/purchase_order_form";
import ReactToPrint from 'react-to-print'
import {ic_save} from 'react-icons-kit/md/ic_save'
import {getData} from "../../network_requests/general";
import {InventoryTable} from "./components/inventory_table/inventory_table";
import {PhysicalCount} from "./components/physical_count/physical_count";
import {AddCategory} from "./components/add_category/add_category";

const data = [];

function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}

/**
 *  Function that checks whether the item is less than 3 items to comply with the business rule
 * @return {null}
 */
function CheckItem(props) {
    const quantity = props.quantity;
    if (parseInt(quantity) <= 3)
        return (<Tooltip title='Quantity is below 3!'>
            <Icon className='warning-icon' icon={warning} size={18} style={{color: 'red'}}/>
        </Tooltip>);
    else
        return null
}


export class InventoryPage extends Component {
    // go to app.js and switch to PAGES[index of this page in the array] to
    // make inventory initial page. Navbar inventory button works tho so up to u gl
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            activeTab: "1",
            purchase_order_list: [],
            items: [],
        };
        this.poComponent = React.createRef();
        this.inventoryTable = React.createRef();
        this.changeTab = this.changeTab.bind(this);
        this.loadPurchaseOrders = this.loadPurchaseOrders.bind(this);
    }

    componentDidMount() {
        this.loadPurchaseOrders();
        this.getItems();
    }

    getItems() {
        getData('inventory/items/').then(data => {
            this.setState({
                items: data.items
            })
        })
    }

    loadPurchaseOrders() {
        /** @namespace data.purchase_orders **/
        getData('inventory/purchase_order/').then(data => {
            const temp_purchase_order_list = [];
            let purchase_orders = data.purchase_orders;
            purchase_orders.forEach(function (purchase_order) {
                let temp_purchase_order = {
                    id: purchase_order.id,
                    key: purchase_order.po_number,
                    po_number: purchase_order.po_number,
                    order_date: purchase_order.order_date,
                    completion_date: purchase_order.completion_date,
                    status: purchase_order.status,
                };
                getData('inventory/vendors/' + purchase_order.vendor).then(data => {
                    temp_purchase_order['vendor'] = data.vendor.name
                });

                temp_purchase_order_list.push(temp_purchase_order)
            });
            this.setState({
                purchase_order_list: temp_purchase_order_list
            })
        })
    }

    onClick = () => {
        this.poComponent.current.saveForm();
    };

    showModal = () => {
        this.setState({
            modalVisible: true,
        });
    };

    handleCancel = () => {
        this.setState({
            modalVisible: false,
        });
    };

    changeTab = (e) => {
        this.setState({
            activeTab: e,
        })
    };

    reloadItems = () => {
        this.inventoryTable.current.loadItems();
    };

    render() {

        const {purchase_order_list, items} = this.state;
        return (
            <div className="body-wrapper">
                <Header/>
                <div className='table-style'>
                    <Tabs activeKey={this.state.activeTab} onChange={this.changeTab}>
                        <Tabs.TabPane tab="Inventory" key="1" onClick={() => this.changeTab("1")}>
                            <Row type="flex" justify="start">
                                {items.length ? (<Col span={6}><PhysicalCount/></Col>) : null}
                                <Col span={6}> <AddCategory reload_items={this.reloadItems}/>
                                </Col>
                            </Row>
                            <br/>
                            <br/>
                            <InventoryTable ref={this.inventoryTable}/>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Purchase Order" onClick={() => this.changeTab("2")} className='full-table'>
                            <Button type="primary" onClick={this.showModal} htmlType="button" className="poButton">
                                Create Purchase Order
                            </Button>
                            <Modal
                                title="Create Purchase Order"
                                visible={this.state.modalVisible}
                                onOk={this.handleOk}
                                onCancel={this.handleCancel}
                                className="purchase-order-modal"
                                footer={[
                                    <Button key={1} htmlType="button" type="primary"
                                            onClick={this.onClick}><Icon className="save"
                                                                         icon={ic_save}
                                                                         size={14}/> &nbsp; Save</Button>,
                                ]}
                            >
                                <PurchaseOrderForm ref={this.poComponent} close={this.handleCancel}
                                                   load_purchase_order={this.loadPurchaseOrders}
                                />
                            </Modal>
                            <PurchaseOrderList purchase_order_list={purchase_order_list}
                                               load_purchase_orders={this.loadPurchaseOrders}/>
                        </Tabs.TabPane>
                    </Tabs>


                    <div>

                    </div>
                </div>
            </div>
        )
    }
}
