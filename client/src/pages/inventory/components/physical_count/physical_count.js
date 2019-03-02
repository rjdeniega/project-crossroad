import React, {Component} from 'react'
import {Button, Modal, Select, Card, Form, InputNumber, Input, Icon} from 'antd'
import {getData} from "../../../../network_requests/general";
import _ from 'lodash'
import update from 'react-addons-update'

const Option = Select.Option;

const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };

export class PhysicalCount extends Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: false,
            items: [],
            active_category: [],
            new_quantity: [],
            remarks: [],
        }
    }

    componentDidMount() {
        this.loadItems();
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    handleCancel = () => {
        this.setState({
            visible: false,
        });
    };

    loadItems() {
        getData('inventory/items/').then(data => {
            this.setState({
                items: data.items
            }, () => {
                let data = [];
                const {items} = this.state;
                let groupedItems = _.groupBy(items, function (d) {
                    return d.name
                });
                _.map(groupedItems, function (value, key) {
                    data.push(key);
                });
                this.setState({
                    active_category: data[0]
                });

                let quantities = [];
                items.forEach(function(item){
                    quantities.push({
                        item_code: item.item_code,
                        quantity: item.quantity
                    })
                });
                this.setState({
                    quantities: quantities,
                }, () => {
                    console.log(this.state)
                })
            })
        });
    }

    changePage = (category) => {
        this.setState({
            active_category: category
        })
    };

    changeQuantity = (id, value) => {
        this.setState({
            new_quantity: update(this.state.new_quantity, {
                [id - 1]: {$set:value}
            })
        }, () => {
            console.log(this.state)
        })
    };

    updateRemarks = (id, value) => {
        this.setState({
            remarks: update(this.state.remarks, {
                [id - 1]: {$set: value}
            })
        }, () => {
            console.log(this.state)
        })
    };

    confirmCount(items, remarks, quantity) {
        let items_to_update = [];
        items.forEach(function(item, index){
            let remark = remarks[index];
            let quantity = quantity[index];
            items_to_update.push({
                id: item.id,
                quantity: quantity,
                remark: remark,
            })
        });
        console.log(items_to_update);
    };

    renderItem = (items, category) => {
        let rendered_items = [];
        let self = this;

        items.forEach(function (item) {
            if (item.name === category) {
                let set_quantity = item.quantity + 0;
                rendered_items.push(
                    <div style={{marginTop: '15px'}}>
                        <Card size="small"
                              title={item.brand + " " + item.item_code}
                                extra={self.state.new_quantity[item.id-1] && self.state.remarks[item.id - 1] ? <Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" />: ''}>
                            <Form.Item label="Quantity" {...formItemLayout}>
                                <p>{set_quantity}</p>
                            </Form.Item>
                            <Form.Item label="Updated Quantity: " {...formItemLayout}>
                                <InputNumber value={self.state.new_quantity[item.id - 1]} onChange={value => self.changeQuantity(item.id, value)}/>
                            </Form.Item>
                            <Form.Item label="Remarks" {...formItemLayout}>
                                <Input value={self.state.remarks[item.id - 1]} onChange={e => self.updateRemarks(item.id, e.target.value)}/>
                            </Form.Item>
                        </Card>
                    </div>
                )
            }
        });

        return rendered_items
    };

    groupedItems = (items) => {
        let data = [];
        let categories = [];
        let groupedItems = _.groupBy(items, function (d) {
            return d.name
        });
        _.map(groupedItems, function (value, key) {
            data.push(key);
            categories.push(<Option value={key}>
                {key}
            </Option>)
        });
        return <Select defaultValue={data[0]} style={{width: 140}} onSelect={this.changePage}>{categories}</Select>;
    };

    render() {
        const {items, active_category, remarks, new_quantity} = this.state;
        return (
            <div>
                <Button type="primary" onClick={this.showModal} htmlType="button">
                    Conduct Physical Count
                </Button>
                <Modal
                    title="Conduct Physical Count"
                    visible={this.state.visible}
                    onOk={() => this.confirmCount(items, remarks, new_quantity)}
                    onCancel={this.handleCancel} style={{padding: '15px', width: '600px'}}>
                    {this.groupedItems(items)}
                    {this.renderItem(items, active_category)}
                </Modal>
            </div>
        )
    }
}