/**
 * Created by JasonDeniega on 02/07/2018.
 */

import React, { Component } from 'react';
import './style.css'
import emptyStateImage from '../../../../images/empty_state_construction.png'
import { Modal, Button, Input } from 'antd'
import { postDataWithImage, postDataWithFile } from "../../../../network_requests/general";

export class BeepPane extends Component {
    state = {
        visible: false,
        file: null
    };
    showModal = item => event => {
        console.log(item);
        this.setState({
            visible: true,
        });
    };

    handleConfirm = (e) => {
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
    handleFileChange = (e) => {
        this.setState({
            file: e.target.files[0]
        });
        console.log(e.target.files[0])
    };
    handleUpload = () => {
        const formData = new FormData();
        formData.append('shift_type', "AM");
        formData.append('file', this.state.file);
        console.log(formData);

        postDataWithFile('/remittances/beep/', formData)
            .then(data => {
                if (data.error) {
                    console.log("theres an error");
                    this.setState({
                        error: data["error"],
                    });
                    console.log(this.state.error);
                }
                else {
                    console.log(data);
                    console.log(data.user_staff);
                }
            })
            .catch(error => console.log(error));
    };

    render() {
        return (
            <div className="beep-tab-body">
                <Modal
                    title="Something"
                    visible={this.state.visible}
                    onOk={this.handleConfirm}
                    onCancel={this.handleCancel}
                >
                    <Input type="file" placeholder="select image" onChange={this.handleFileChange}/>
                    <Button type="primary" onClick={this.handleUpload}> Submit </Button>
                </Modal>
                <Button type="primary" onClick={this.showModal()}>Upload CSV</Button>
                <img className="empty-image" src={emptyStateImage}/>
                <p className="empty-message">Area under construction</p>
            </div>
        );
    }
}