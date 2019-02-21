import {Menu, Modal} from "antd";
import React, {Component} from "react";
import {Icon} from "react-icons-kit";
import {gears} from "react-icons-kit/fa/gears";
import {wrench} from "react-icons-kit/fa/wrench";
import {iosListOutline} from "react-icons-kit/ionicons/iosListOutline";
import {RepairForm} from "./repair_tabs/repair_form";
import {RepairsTable} from "./repair_tabs/repair_list";
import {Maintenance} from "./repair_tabs/maintenance";

export class Repairs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            shuttle: props.shuttle,
            visible: false,
            currentPage: 1,
            modalWidth: 1100
        };
    }

    showModal = () => {
        this.setState({
            visible: true
        });
    };

    handleCancel = () => {
        this.setState({
            visible: false
        });
    };

    handleClick = e => {
        let content;
        let width;
        if (e.key === "1") {
            content = 1;
            width = 1100;
        } else if (e.key === "2") {
            content = 2;
            width = 650;
        } else {
            content = 3;
            width = 700;
        }
        this.setState({
            currentPage: content,
            modalWidth: width
        });
    };

    requestSubmitted() {
        this.setState({
            currentPage: 1,
            modalWidth: 1100
        });
    }

    reloadMaintenance() {
        this.setState({
            currentPage: 3,
            modalWidth: 700
        })
    }

    renderCurrentPage = () => {
        const {currentPage} = this.state;
        switch (currentPage) {
            case 1:
                return <RepairsTable shuttle={this.state.shuttle}/>;
            case 2:
                return (
                    <RepairForm
                        requestSubmitted={this.requestSubmitted.bind(this)}
                        shuttle={this.props.shuttle}
                    />
                );
            case 3:
                return (
                    <Maintenance reloadMaintenance={this.reloadMaintenance.bind(this)} shuttle={this.props.shuttle}/>
                )
            default:
                return <RepairsTable shuttle={this.state.shuttle}/>;
        }
    };

    render() {
        const {shuttle} = this.state;
        return (
            <div>
                <Icon icon={wrench} onClick={this.showModal}/>
                <Modal
                    title={"Shuttle " + shuttle.id + " repair information"}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    footer={false}
                    width={this.state.modalWidth}
                >
                    <Menu
                        onClick={this.handleClick}
                        selectedKeys={[this.state.currentPage]}
                        mode="horizontal"
                    >
                        <Menu.Item key="1" active>
                            <Icon icon={wrench}/> Repair Information
                        </Menu.Item>
                        <Menu.Item key="2">
                            <Icon icon={iosListOutline}/> Repair Request
                        </Menu.Item>
                        <Menu.Item key="3">
                            <Icon icon={gears}/> Maintenance
                        </Menu.Item>
                    </Menu>
                    <div className="repair-modal-body">{this.renderCurrentPage()}</div>
                </Modal>
            </div>
        );
    }
}
