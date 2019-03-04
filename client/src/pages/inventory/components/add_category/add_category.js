import React, {Component} from 'react';
import './style.css'
import {Button, Modal, Form, Input, message} from 'antd'
import {postData} from "../../../../network_requests/general";

const Item = Form.Item;

export class AddCategory extends Component {
    constructor(props) {
        super(props);

        this.state = {
            category: '',
            code_prefix: '',
            visible: false,
        };

        this.submitData = this.submitData.bind(this)
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    handleCancel = () => {
        this.setState({
            visible: false,
            category: '',
            code_prefix: '',
        });
    };

    updateFields = (data, field) => {
        if(field === "category"){
            this.setState({
                category: data
            }, () => {
                console.log(this.state)
            });
        } else {
            this.setState({
                code_prefix: data
            }, () => {
                console.log(this.state)
            });
        }
    };

    submitData(){
        const {category, code_prefix} = this.state;
        if(!category || !code_prefix){
            message.error("Please complete the fields")
        } else {
            let data = {
                category: category,
                code_prefix: code_prefix,
            };
            postData('inventory/items/item_category/', data).then(data => {
                console.log(data)
            });
            message.success("Category was successfully added!");
            this.handleCancel();
            this.props.reload_items();
        }
    }

    render() {
        const {visible, category, code_prefix} = this.state;

        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 8},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 10},
            },
        };

        return (<span>
            <Button type="primary" onClick={this.showModal} htmlType="button">
                Add Item Category
            </Button>
            <Modal
                title="Add Item Category"
                visible={visible}
                onCancel={this.handleCancel}
                onOk={this.submitData}>
                <Item label="Category" {...formItemLayout}>
                    <Input value={category} onChange={e => this.updateFields(e.target.value, 'category')}/>
                </Item>
                <Item label="Code-Prefix" {...formItemLayout}>
                    <Input value={code_prefix} maxLength={3} onChange={e => this.updateFields(e.target.value, 'code_prefix')}/>
                </Item>
            </Modal>
        </span>)
    }
}