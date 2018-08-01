/**
 * Created by JasonDeniega on 02/07/2018.
 */
import React, { Component } from 'react';
import './style.css'
import emptyStateImage from '../../../../images/empty state record.png'
import { RemittanceList } from '../../components/remittance_list/remittance_list'
import { List, Table, Divider, Button, Avatar, Icon, Modal, Input } from 'antd'
import { eye } from 'react-icons-kit/fa/eye'
import { getData } from '../../../../network_requests/general'
import { RemittanceForm } from '../../components/remittance_form/remittance_form'

const ButtonGroup = Button.Group;
// {
//     title: 'Supervisor',
//     dataIndex: 'name',
//     key: 'name',
//     render: (text, record) => (
//         <div>
//             <Avatar size="large" className="table-avatar"
//                     src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"/>
//             <b className="name">{text}</b>
//         </div>
//     ),
// },
const columns = [{
    title: 'Date',
    dataIndex: 'date_of_iteration',
    key: 'date_of_iteration',
    render: (text) => (
        <div>
            {text}
        </div>
    )
}, {
    title: 'Shift Type',
    dataIndex: 'shift_type',
    key: 'shift_type',
    render: (text) => (
        <div className="rem-status">
            {text == "A" &&
            <div className="shift-table-column"><Icon type="check-circle" className="status-icon"/> <p>AM</p></div>}
            {text == "P" &&
            <div className="shift-table-column"><Icon type="check-circle" className="status-icon"/> <p>PM</p></div>}
            {text == "MN" &&
            <div className="shift-table-column"><Icon type="check-circle" className="status-icon"/> <p>MN</p></div>}
        </div>
    ),
}, {
    title: 'Total Ticket Remittances',
    dataIndex: 'grand_total',
    key: 'grand_total',
    render: (text) => (
        <div className="rem-status">
            <p><b>Php {text}</b></p>
        </div>
    ),
}, {
    title: 'Action',
    key: 'action',
    render: (text, record) => (
        <Button className="view-button" type="ghost" icon="eye">
            View Details
        </Button>
    ),
}];

export class TicketingPane extends Component {
    state = {
        shifts: [],
        visible: false,
        fuel: null,
        activeForm: null,
        selected_shifts: [],
        remittance_forms: []
    };

    componentDidMount() {
        getData('remittances/reports/shift_iterations/').then(data => {
            if (!data.errors) {
                console.log(data);
                this.setState({
                    shifts: data.shift_iterations
                })
            }
        }).catch(error => console.log(error))
    }

    fetchShiftData = (details) => {
        console.log(details);
        this.setState({
            visible: true,
        });
        console.log(details);
        const array = [];
        const selected = [];
        details.map(form => {
            const props = {
                ten_peso_start_first: form.ticket_specifics[0]["10_peso_start_first"],
                ten_peso_start_second: form.ticket_specifics[1]["10_peso_start_second"],
                twelve_peso_start_first: form.ticket_specifics[2]["12_peso_start_first"],
                twelve_peso_start_second: form.ticket_specifics[3]["12_peso_start_second"],
                fifteen_peso_start_first: form.ticket_specifics[4]["15_peso_start_first"],
                fifteen_peso_start_second: form.ticket_specifics[5]["15_peso_start_firstfirst"],
                ten_peso_end_first: form.ticket_specifics[0]["10_peso_end_first"],
                ten_peso_end_second: form.ticket_specifics[1]["10_peso_end_second"],
                twelve_peso_end_first: form.ticket_specifics[2]["12_peso_end_first"],
                twelve_peso_end_second: form.ticket_specifics[3]["12_peso_end_second"],
                fifteen_peso_end_first: form.ticket_specifics[4]["15_peso_end_first"],
                fifteen_peso_end_second: form.ticket_specifics[5]["15_peso_end_firstfirst"],
                ten_peso_consumed_first: form.ticket_specifics[0]["consumed_end"],
                ten_peso_consumed_second: form.ticket_specifics[1]["consumed_end"],
                twelve_peso_consumed_first: form.ticket_specifics[2]["consumed_end"],
                twelve_peso_consumed_second: form.ticket_specifics[3]["consumed_end"],
                fifteen_peso_consumed_first: form.ticket_specifics[4]["consumed_end"],
                fifteen_peso_consumed_second: form.ticket_specifics[5]["consumed_end"],
                isConsumedPresent: true,
                km_start: parseInt(form.remittance_details.km_from),
                km_end: parseInt(form.remittance_details.km_to),
                others: parseInt(form.remittance_details.other_cost),
                fuel: parseInt(form.remittance_details.fuel_cost),
                discrepancy: parseInt(form.remittance_details.discrepancy),
            };
            array.push(
                <div key={form.deployment_id}>
                    <RemittanceForm className="remittance-form" {...props}/>
                    <Input className="discrepancy-row" disabled={true} placeholder={"discrepancies: " + props.discrepancy + "Php"}/>
                </div>
            );
            selected.push(form)

        });
        console.log(array);
        this.setState({
            remittance_forms: array,
            selected_shifts: selected,
        }, () => console.log(this.state.remittance_forms))
    };
    handleDriverSelect = id => event => {
        console.log(id);
        this.setState({
            activeForm: id
        })
    };
    handleOk = (e) => {
        console.log(e);
        this.setState({
            visible: false,
            activeForm: null,
        });
    };
    handleCancel = (e) => {
        console.log(e);
        this.setState({
            visible: false,
            activeForm: null,
        });
    };

    renderListItemPhoto = photoSrc => {
        console.log("Photo src", photoSrc);
        return <Avatar className="list-avatar" size="large"
                       src={photoSrc ? photoSrc : "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"}/>;
    };
    getCurrentForm = () => {
        return this.state.remittance_forms.filter(item => {
                return item.key == this.state.activeForm
            }
        );
    };

    render() {
        return (
            <div className="ticketing-tab-body">
                <div className="filters">
                    <ButtonGroup>
                        <Button type="primary" className="shift-type">AM</Button>
                        <Button className="shift-type">PM</Button>
                        <Button className="shift-type">Midnight</Button>
                    </ButtonGroup>
                    <Divider orientation="left">Filters</Divider>
                    {/*<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista*/}
                        {/*probare, quae sunt a te dicta? Refert tamen, quo modo.</p>*/}
                </div>
                <Modal
                    className="ticketing-modal"
                    title="Basic Modal"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >
                    <div className="modal-content">
                        <List
                            className="user-list"
                            itemLayout="horizontal"
                            dataSource={(() => {
                                console.log(this.state.selected_shifts);
                                return this.state.selected_shifts;
                            })()}
                            renderItem={item => (
                                <List.Item className="list-item"
                                           onClick={this.handleDriverSelect(item.deployment_id)}>
                                    <List.Item.Meta
                                        avatar={this.renderListItemPhoto(item.driver_photo)}
                                        title={<p className="list-title"
                                                  href="https://ant.design">{item.driver}</p>}
                                    />
                                </List.Item>
                            )}
                        />
                        {this.state.activeForm && this.getCurrentForm()}
                        {!this.state.activeForm &&
                        <div className="empty-state">
                            <img className="empty-image" src={emptyStateImage}/>
                            <p><b>Please select a driver</b></p>
                        </div>
                        }
                    </div>
                </Modal>
                <Table bordered size="medium"
                       className="remittance-table"
                       columns={columns}
                       dataSource={this.state.shifts}
                       onRow={(record) => {
                           return {
                               onClick: () => {
                                   console.log(record);
                                   this.fetchShiftData(record.details);
                               },       // click row
                           };
                       }}
                />
            </div>
        );
    }
}