import React, {Component} from 'react';
import {
    Card,
    Form,
    Input,
    Select,
    Tag,
    Divider,
    Button,
    message,
    Modal,
    Upload,
    Icon,
    Checkbox,
    Typography,
    Popover
} from 'antd'
import update from 'react-addons-update'
import './style.css';
import {getData, postData, putData, putDataWithImage} from "../../../../network_requests/general";

const {Text} = Typography;

const Option = Select.Option;
const Search = Input.Search;

function generateCode() {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (let i = 0; i < 6; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

class ReportProblem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            remarks: null,
        };

        this.submitRemarks = this.submitRemarks.bind(this);
    }

    submitRemarks() {
        const {remarks} = this.state;
        let data = {
            remarks: remarks,
            po_id: this.props.po_id,
            category: this.props.category,
            item: this.props.item,
        };

        postData('inventory/purchase_order/submit_remarks/', data).then(() => {
            message.success('Submitted problem');
            this.props.loadItems();
        })

    }

    render() {
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 8},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 16},
            },
        };
        const buttonLayout = {
            wrapperCol: {
                sm: {
                    span: 16,
                    offset: 8,
                },
            }
        };
        return (
            <div>
                <Form.Item label="Problem" {...formItemLayout}>
                    <Input.TextArea rows={3} onChange={e => this.setState({remarks: e.target.value})}/>
                </Form.Item>
                <Form.Item {...buttonLayout}>
                    <Button htmlType="button" type="primary" onClick={this.submitRemarks}>Submit</Button>
                </Form.Item>
            </div>
        )
    }
}

export class UpdatePurchaseOrder extends Component {
    constructor(props) {
        super(props);

        this.state = {
            previewVisible: false,
            previewImage: '',
            fileList: [],
            update_modal: false,
            items: [],
            categories: [],
            confirmation: [],
            confirm_disabled: 'disabled',
            item_details: [],
        };

        this.removeFile = this.removeFile.bind(this);
        this.onChange = this.onChange.bind(this);
        this.receiveItem = this.receiveItem.bind(this);
        this.loadItems = this.loadItems.bind(this);
    }

    componentDidMount() {
        this.loadItems()
    }

    loadItems() {
        let po_id = this.props.po_id;
        getData('inventory/purchase_order/' + po_id).then(data => {
            let fileList = [];
            if (data.purchase_order.receipt) {
                fileList.push({
                    uid: '-1',
                    name: data.purchase_order.receipt,
                    status: 'done',
                    url: data.purchase_order.receipt,
                });
            }
            this.setState({
                items: data.items,
                fileList: fileList,
                categories: data.categories,
            }, () => {
                let checkboxes = [];
                this.state.items.forEach(function () {
                    checkboxes.push({
                        checked: false
                    })
                });
                this.setState({
                    confirmation: checkboxes,
                }, () => {
                    console.log(this.state)
                });
                let item_details = [];
                this.state.items.map(item => {
                    let item_detail = {
                        name: item.item,
                        generic_name: item.item,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        measurement: null,
                        unit: null,
                        item_type: "Single Item",
                        item_code: generateCode(),
                    };
                    item_details.push(item_detail);
                });
                this.setState({
                    item_details: item_details,
                })
            })

        })
    }

    handleCancel = () => {
        this.setState({previewVisible: false})
    };

    removeFile() {
        let formData = new FormData();
        console.log();
        formData.append('receipt', null);
        putDataWithImage('inventory/purchase_order/' + this.props.po_id, formData).then(data => {
            console.log(data)
        });
    }

    handleChange = ({fileList}) => this.setState({fileList});

    handlePreview = (file) => {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        });
    };

    updateModal = () => {
        this.setState({
            update_modal: true,
        })
    };

    handleCancel2 = () => {
        this.setState({
            update_modal: false,
        });
    };

    disapprove = (id) => {
        let data = {
            'update': 'reject'
        };
        /** @namespace this.props.load_purchase_orders () **/
        postData('inventory/purchase_order/update/' + id, data).then(() => {
            message.success("Purchase order has been completed");
            this.props.load_purchase_orders();
            this.handleCancel2()
        })
    };

    approve = (id) => {
        let data = {
            update: "accepted",
        };
        postData('inventory/purchase_order/update/' + id, data).then(data => {
            if (data.error) {
                console.log(data.error)
            }
            message.success("Purchase order has been confirmed");
            this.props.load_purchase_orders()
        })
    };

    changeItemType = (index, new_item_type) => {
        this.setState({
            item_details: update(this.state.item_details, {
                [index]: {
                    item_type: {$set: new_item_type}
                }
            })
        }, () => {
            if (new_item_type === "Physical Measurement") {
                this.setState({
                    item_details: update(this.state.item_details, {
                        [index]: {
                            unit: {$set: "pieces"},
                        }
                    })
                }, () => {
                    console.log(this.state)
                })
            } else if (new_item_type === "Liquid Measurement") {
                this.setState({
                    item_details: update(this.state.item_details, {
                        [index]: {
                            unit: {$set: "mL"},
                        }
                    })
                }, () => {
                    console.log(this.state)
                })
            } else {
                this.setState({
                    item_details: update(this.state.item_details, {
                        [index]: {
                            unit: {$set: null},
                            measurement: {$set: null},
                        }
                    })
                }, () => {
                    console.log(this.state)
                })
            }
        })
    };

    changeMeasurement = (index, measurement) => {
        this.setState({
            item_details: update(this.state.item_details, {
                [index]: {
                    unit: {$set: measurement},
                }
            })
        }, () => {
            console.log(this.state)
        })
    };


    updateFields = (key, value, attribute) => {
        if (attribute === "item_code") {
            let code = generateCode();
            this.setState({
                item_details: update(this.state.item_details, {
                    [key]: {
                        item_code: {$set: code},
                    }
                })
            })
        } else if (attribute === "name") {
            this.setState({
                item_details: update(this.state.item_details, {
                    [key]: {
                        generic_name: {$set: value},
                    }
                })
            }, () => console.log(this.state))
        } else if (attribute === "description") {
            this.setState({
                item_details: update(this.state.item_details, {
                    [key]: {
                        description: {$set: value},
                    }
                })
            }, () => console.log(this.state))
        } else if (attribute === "brand") {
            this.setState({
                item_details: update(this.state.item_details, {
                    [key]: {
                        brand: {$set: value},
                    }
                })
            }, () => console.log(this.state))
        } else if (attribute === "measurement") {
            this.setState({
                item_details: update(this.state.item_details, {
                    [key]: {
                        measurement: {$set: value},
                    }
                })
            }, () => console.log(this.state))
        }
    };

    uploadReceipt = (picture) => {
        let formData = new FormData();
        console.log(picture);
        formData.append('receipt', picture);
        putDataWithImage('inventory/purchase_order/' + this.props.po_id, formData).then(data => {
            console.log(data)
        })
    };

    onChange = (e, key) => {
        console.log('checked = ', e.target.checked);
        this.setState({
            confirmation: update(this.state.confirmation, {
                [key]: {
                    checked: {$set: e.target.checked,}
                }
            })
        });
    };

    receiveItem = (id) => {
        let po = this.props.po_id;
        putData('inventory/purchase_order/confirm_item/' + po + '/' + id, 'bogchi').then(data => {
            console.log(data);
            this.loadItems();
        })
    };

    handleVisibleChange = (visibility) => {
        this.setState({visibility});
    };

    render() {
        const {items, previewVisible, previewImage, fileList, confirmation, categories, confirm_disabled, visible} = this.state;
        const {po_id} = this.props;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 8},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 16},
            },
        };

        const uploadButton = (
            <div>
                <Icon type="plus"/>
                <div className="ant-upload-text">Upload</div>
            </div>
        );

        return (
            <span>
                <a onClick={this.updateModal}>Update</a>
                <Modal
                    width={700}
                    title="Update Status"
                    visible={this.state.update_modal}
                    onCancel={this.handleCancel2}
                    className="update-purchase-order-modal"
                    footer={[
                        <Button key={1} htmlType='button' type="danger"
                                onClick={() => this.disapprove(po_id)}>Disapproved</Button>,
                        <Button key={2} htmlType='button' type="primary"
                                onClick={() => this.approve(po_id)}>Complete</Button>
                    ]}>
                    <div className="update-purchase-order-layout">
                        <h3>Add to Inventory</h3>
                        {items.map((item, index) => {
                            return (
                                <Card
                                    title={item.delivery_date ? "Delivery Date: " + new Date(item.delivery_date.substring(0, 10)).toLocaleDateString() :
                                        <span>
                                        <Button htmlType='button' type="primary"
                                                onClick={() => this.receiveItem(item.id)}>Receive Item</Button>
                                        <Popover placement='bottom'
                                                 content={<ReportProblem po_id={po_id} category={item.category} item={item.id} loadItems={this.loadItems}/>}
                                                 trigger='click'>
                                            <Button style={{marginLeft: 5}} htmlType='button' type='danger'>Report Problem</Button>
                                        </Popover>
                                    </span>}
                                    extra={(
                                        <span>
                                      <Tag color="blue">{item.quantity} pc</Tag>
                                      <Divider type="vertical"/>
                                      <Tag color="green">Unit Price: Php{item.unit_price}</Tag>
                                  </span>)} size="small"
                                    className="item-form-container">
                                    {item.status === "Awaiting Delivery" ?
                                        <Tag color="geekblue">Awaiting Delivery</Tag> :
                                        item.status === "Returned" ? <Tag color="gold">Returned {item.times_returned} time/s</Tag> :
                                            item.status === "Delivered" && <Tag color="green">Delivered</Tag>}
                                    <br/>
                                    <Text>{item.brand}&nbsp;{categories[item.id] && categories[item.id]}</Text>
                                    <br/>
                                    <Text>{item.description}</Text>
                                    <br/>
                                    <Text>{item.measurement != null && item.measurement}{item.unit != null && item.unit}</Text>
                                </Card>
                            )
                        })}
                </div>
                    <Form.Item label="Receipt" {...formItemLayout}>
                        <Upload
                            action={e => this.uploadReceipt(e)}
                            listType="picture-card"
                            fileList={fileList}
                            onPreview={this.handlePreview}
                            onChange={this.handleChange}
                            onRemove={this.removeFile}
                        >
                            {fileList.length >= 1 ? null : uploadButton}
                        </Upload>
                        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                            <img alt="example" style={{width: '100%'}} src={previewImage}/>
                        </Modal>
                        </Form.Item>
                </Modal>
            </span>
        )
    }
}