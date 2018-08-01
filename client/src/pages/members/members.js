/**
 * Created by JasonDeniega on 26/07/2018.
 */
/**
 * Created by JasonDeniega on 24/05/2018.
 */
import React, { Component } from "react";
import { Header } from "./components/header/header";
import "../../utilities/colorsFonts.css";
import { List, Avatar } from "antd";
import { Icon as AntIcon } from "antd";
import { UserAvatar } from "../../components/avatar/avatar";
import { search } from "react-icons-kit/fa/search";
import "./style.css";
import emptyStateImage from "../../images/empty state record.png";
import users from "../../images/default.png";
import { Tabs, Spin, Input, Table, Button, Modal, InputNumber, Divider, DatePicker } from "antd";
import { Icon } from "react-icons-kit";
import { driversLicenseO } from "react-icons-kit/fa/driversLicenseO";
import { TicketingPane } from "../../pages/remittances/tabs/ticketing/ticketing";
import { BeepPane } from "../../pages/remittances/tabs/beep/beep";
import { OverviewPane } from "../../pages/remittances/tabs/overview/overview";
import { ShiftManagementPane } from "../../pages/remittances/tabs/shift_management/shift_management";
import { getData, postData } from '../../network_requests/general'
import moment from "moment";

const TabPane = Tabs.TabPane;

const antIcon = (
    <AntIcon
        type="loading"
        style={{ fontSize: 70, color: "var(--darkgreen)" }}
        spin
    />
);
const columns = [{
    title: 'Date',
    dataIndex: 'shift_date',
    key: 'shift_date',
    render: (text) => (
        <div>
            {text}
        </div>
    )
}, {
    title: 'Card Number',
    dataIndex: 'card_number',
    key: 'card_number',
    render: (text) => (
        <div className="rem-status">
            {text}
        </div>
    ),
}, {
    title: 'Transaction Cost',
    dataIndex: 'total',
    key: 'total',
    render: (text) => (
        <div className="rem-status">
            <p><b>Php {parseInt(text)}</b></p>
        </div>
    ),
}];
const carwash_columns = [{
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
    render: (text) => (
        <div>
            {text}
        </div>
    )
}, {
    title: 'Receipt Number',
    dataIndex: 'receipt',
    key: 'receipt',
    render: (text) => (
        <div className="rem-status">
            {text}
        </div>
    ),
}, {
    title: 'Transaction Cost',
    dataIndex: 'total',
    key: 'total',
    render: (text) => (
        <div className="rem-status">
            <p><b>Php {parseInt(text)}</b></p>
        </div>
    ),
}];
const dateFormat = "YYYY-MM-DD";
export class TransactionsPane extends Component {
    state = {
        activeUser: null,
        transactions: null,
        total_transactions: null,
        total: null,
        receipt: null,
        visible: false,
        date: null,
        date_object: moment('2015/01/01', dateFormat)
    };

    componentDidMount() {
        this.setState({
            activeUser: this.props.activeUser
        });
        if (this.state.activeUser) {
            this.fetchMemberTransactions();
            console.log("entered mount")
        }
    }

    componentDidUpdate() {
        if (this.props.activeUser && !this.state.transactions) {
            this.fetchMemberTransactions();
        }
    }

    fetchMemberTransactions() {
        const { activeUser } = this.props;
        getData('/members/transactions/' + activeUser.id).then(data => {
            console.log(data.transactions);
            this.setState({
                transactions: data.transactions,
                total_transactions: data.total_transactions
            })
        });
        getData('/remittances/get_carwash_transaction/' + activeUser.id).then(data => {
            console.log(data);
            this.setState({
                carwash_transactions: data.carwash_transactions,
            })
        });
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
    };
    handleOk = (e) => {
        const data = {
            "member": this.state.activeUser.id,
            "total": this.state.total,
            "receipt": this.state.receipt,
            "date": this.state.date,
        };
        postData('/remittances/carwash_transaction/', data).then(data => {
            console.log(data)
        });
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

    formListener = fieldName => event => {
        return this.handleFormChange(fieldName)(event);
        //this is asynchronous, it does not execute in order
        //if console.log is not in callback, it might execute before state is updated
    };
    handleFormChange = fieldName => value => {
        // this function is to handle drop-downs
        const state = { ...this.state };
        state[fieldName] = value;
        console.log(fieldName);
        console.log(state[fieldName]);
        this.setState({
            ...state
        });
    };
    handleDateChange = (date, dateString) => this.setState({
        date_object: date,
        date: dateString
    });
    handleReceipt = event => {
        // this function is to handle drop-downs
        this.setState({
            receipt: event.target.value
        })
    };

    render() {
        const { activeUser } = this.props;
        return (
            <div className="transactions">
                {!activeUser &&
                <div>
                    <img className="empty-image" src={emptyStateImage}/>
                    <p className="empty-message"> Please select a member to view their transactions </p>
                </div>}
                {activeUser &&
                <div className="transaction-tables">
                    <Modal
                        title="Add a carwash transaction for this member"
                        visible={this.state.visible}
                        onOk={this.handleOk}
                        onCancel={this.handleCancel}
                    >
                        <DatePicker className="user-input" onChange={this.handleDateChange} format={dateFormat}/>
                        <Input placeholder="Receipt Number" onChange={this.handleReceipt}/>
                        <InputNumber className="user-input" addOnBefore="Php" placeholder="value"
                                     onChange={this.formListener("total")}/>
                    </Modal>
                    <div className="table-container">
                        <div className="tab-label">
                            Beep transactions
                        </div>
                        <p> total transaction cost: <b>{this.state.total_transactions} </b></p>
                        <Table bordered size="medium"
                               className="remittance-table"
                               columns={columns}
                               dataSource={this.state.transactions}

                        />
                    </div>
                    <div className="table-container">
                        <div className="tab-label">
                            Carwash transactions
                            <Button onClick={this.showModal}>Add Transaction</Button>
                        </div>
                        <p> total transaction cost: <b>{this.state.total_transactions} </b></p>
                        <Table bordered size="medium"
                               className="remittance-table"
                               columns={carwash_columns}
                               dataSource={this.state.carwash_transactions}

                        />
                    </div>
                </div>


                }

            </div>
        );
    }
}
export class SharesManagementPane extends Component {
    state = {
        activeUser: null,
        shares: null,
        add_share_value: null,
        total_shares: null,
        total_peso_value: null,
        visible: false,
        date: null,
        date_object: moment('2015/01/01', dateFormat)
    };

    componentDidMount() {
        this.setState({
            activeUser: this.props.activeUser
        });
        if (this.state.activeUser) {
            this.fetchMemberShares();
            console.log("entered mount")
        }
    }

    componentDidUpdate() {
        if (this.props.activeUser && !this.state.shares) {
            this.fetchMemberShares();
        }
    }

    fetchMemberShares() {
        const { activeUser } = this.props;
        getData('/members/shares/' + activeUser.id).then(data => {
            console.log(data);
            this.setState({
                shares: data.shares,
                total_shares: data.total_shares,
                total_peso_value: data.total_peso_value,
            })
        });
    }

    showModal = event => {
        this.setState({
            visible: true
        })
    };
    handleConfirm = (e) => {
        const { activeUser } = this.props;
        const data = {
            "date": this.state.date,
            "receipt": this.state.receipt,
            "value": this.state.add_share_value
        };
        postData('/members/shares/' + activeUser.id, data).then(data => {
            console.log(data.share);
            this.setState({
                total_shares: this.computeValue(this.state.total_shares, data.share.value),
                total_peso_value: this.computeValue(this.state.total_peso_value, (parseInt(data.share.value) * 500)),
                shares: [...this.state.shares, this.convertToDefaultShare(data.share)],
                visible: false,
            })
        });
    };
    convertToDefaultShare = (share) => {
        console.log(share);
        return {
            "value": share.value,
            "peso_value": parseInt(share.value) * 500,
            "date_of_update": share.date_of_update,
        }
    };
    computeValue = (first, second) => {
        let first_n = parseInt(first);
        let second_n = parseInt(second);
        return first_n + second_n;
    };
    handleCancel = (e) => {
        console.log(e);
        this.setState({
            visible: false,
        });
    };
    handleShareChange = (value) => {
        this.setState({
            add_share_value: value
        })
    };
    handleDateChange = (date, dateString) => this.setState({
        date_object: date,
        date: dateString
    });
    handleReceipt = event => {
        // this function is to handle drop-downs
        this.setState({
            receipt: event.target.value
        })
    };

    share_columns = [{
        title: 'Date of Update',
        dataIndex: 'date_of_update',
        key: 'date_of_update',
        render: (text) => (
            <div>
                {text}
            </div>
        )
    }, {
        title: 'Share Value',
        dataIndex: 'value',
        key: 'value',
        render: (text) => (
            <div className="rem-status">
                {parseInt(text)}
            </div>
        ),
    }, {
        title: 'Peso value',
        dataIndex: 'peso_value',
        key: 'peso_value',
        render: (text) => (
            <div className="rem-status">
                <p><b>Php {parseInt(text)}</b></p>
            </div>
        ),
    }];

    render() {
        const { activeUser } = this.props;
        return (
            <div>
                {activeUser &&
                <div>
                    <Modal
                        title="Add shares for this member"
                        visible={this.state.visible}
                        onOk={this.handleConfirm}
                        onCancel={this.handleCancel}
                    >
                        <DatePicker className="user-input" onChange={this.handleDateChange} format={dateFormat}/>
                        <Input placeholder="Receipt Number" onChange={this.handleReceipt}/>
                        <InputNumber onChange={this.handleShareChange}/>
                    </Modal>
                    <Button onClick={this.showModal}>Add Shares</Button>
                    <p> total shares: <b>{this.state.total_shares}</b></p>
                    <p> total shares (in Php): <b>Php {this.state.total_peso_value}</b></p>

                    <Table bordered size="medium"
                           className="remittance-table"
                           columns={this.share_columns}
                           dataSource={this.state.shares}
                    />
                </div>
                }
                {!activeUser &&
                <div>
                    <img className="empty-image" src={emptyStateImage}/>
                    <p className="empty-message"> Please select a member to view their shares </p>
                </div>
                }
            </div>
        );
    }
}
export class ProfilePane extends Component {
    renderListItemPhoto = photoSrc => {
        console.log("Photo src", photoSrc);
        return photoSrc ? photoSrc : users
    };

    render() {
        const { activeUser } = this.props;
        return (
            <div className="profile-container">
                {activeUser &&
                <div className="container">
                    <div className="header-div">
                        <img className="profile-image" src={this.renderListItemPhoto(activeUser.photo)}/>
                        <div className="basic-info">
                            <div className="info-row"><b>Name:</b> {activeUser.name}</div>
                            <div className="info-row"><b>Contact Number:</b> {activeUser.contact_no}</div>
                            <div className="info-row"><b>E-mail:</b> {activeUser.email}</div>
                        </div>
                    </div>
                    <Divider orientation="left">Member Information</Divider>
                    <div className="member-info">
                        <div className="info-row-1"><b>Accepted date:</b> {activeUser.accepted_date}</div>
                        <div className="info-row-2"><b>E-mail:</b> {activeUser.email}</div>
                        <div className="info-row-1"><b>Termination date:</b> {activeUser.termination_date}</div>
                        <div className="info-row-2"><b>Occupation:</b> {activeUser.occupation}</div>
                        <div className="info-row-1"><b>Tin number:</b> {activeUser.tin_number}</div>
                        <div className="info-row-2"><b>Educational Attainment:</b> {activeUser.educational_attainment}
                        </div>
                        <div className="info-row-1"><b>Religion:</b> {activeUser.religion}</div>
                        <div className="info-row-2"><b>Sex:</b> {activeUser.sex}</div>
                        <div className="info-row-1"><b>Address:</b> {activeUser.address}</div>
                        <div className="info-row-2"><b>Annual Income:</b> {activeUser.annual_income}</div>
                        <div className="info-row-1"><b>Card Number:</b> {activeUser.card_number}</div>
                        <div className="info-row-2"><b>No of Dependents:</b> {activeUser.no_of_dependents}</div>
                    </div>
                </div>
                }
                {!activeUser &&
                <div>
                    <img className="empty-image" src={emptyStateImage}/>
                    <p className="empty-message"> Please select a member to view their information </p>
                </div>
                }
            </div>
        );
    }
}
export class MembersPage extends Component {
    state = {
        users: null,
        activeUser: null,
        currentTab: 1
    };
    // change pages on navbar item click
    onTabChange = key =>
        this.setState({
            currentTab: parseInt(key)
        });

    renderCurrentTab = () => {
        const { currentTab, activeUser } = this.state;
        switch (currentTab) {
            case 1:
                return <ProfilePane activeUser={activeUser}/>;
            case 2:
                return <TransactionsPane activeUser={activeUser}/>;
            case 3:
                return <SharesManagementPane activeUser={activeUser}/>;
            default:
                return <OverviewPane />;
        }
    };

    componentDidMount() {
        this.fetchMembers();
    }

    fetchMembers() {
        return fetch("/members")
            .then(response => response.json())
            .then(data => {
                this.setState(
                    {
                        users: data["members"].reverse()
                    },
                    () => console.log(this.state.users)
                );
            });
    }

    assignUser = id => event => {
        const user = this.state.users.find(item => item.id == id);
        this.setState({
            activeUser: user
        });
        // this.renderTab();
    };

    renderListItemPhoto = photoSrc => {
        console.log("Photo src", photoSrc);
        return (
            <Avatar
                className="list-avatar"
                size="large"
                src={photoSrc ? photoSrc : users}
            />
        );
    };
    renderList = () => (
        <List
            className="user-list"
            itemLayout="horizontal"
            dataSource={(() => {
                console.log(this.state.users);
                return this.state.users;
            })()}
            renderItem={item => (
                <List.Item className="list-item" onClick={this.assignUser(item.id)}>
                    <List.Item.Meta
                        avatar={this.renderListItemPhoto(item.photo)}
                        title={<a className="list-title">{item.name}</a>}
                        description={<p className="list-description"> member </p>}
                    />
                </List.Item>
            )}
        />
    );
    renderPageHeader = () => ( <div className="remittance-header">
        <div className="header-text">
            <Icon className="page-icon" icon={driversLicenseO} size={42}/>
            <div className="page-title"> Members</div>
            <div className="rem-page-description">
                {" "}
                Manage member transactions and shares
            </div>
        </div>
        <UserAvatar />
        <div className="header-bottom">
            <div className="user-search-wrapper">
                <Input.Search
                    className="user-search"
                    placeholder="search for members"
                    onSearch={value => console.log(value)}
                    suffix={<Icon size={18} icon={search}/>}
                />
            </div>
            <div className="user-tabs-wrapper">
                <Tabs
                    className="user-tabs"
                    defaultActiveKey="1"
                    onChange={this.onTabChange}
                >
                    <TabPane className="tab-item" tab="Overview" key="1"/>
                    <TabPane className="tab-item" tab="Transactions" key="2"/>
                    <TabPane className="tab-item" tab="Shares" key="3"/>
                </Tabs>
            </div>
        </div>
    </div> );

    render() {
        const { users } = this.state;
        const isLoading = users === null;
        return (
            <div className="body-wrapper">
                <div className="remittance-page-body">
                    {this.renderPageHeader()}
                    <div className="page-body">
                        <div className="user-list-wrapper">
                            {users && this.renderList()}
                            {isLoading && (
                                <Spin
                                    className="user-spinner"
                                    indicator={antIcon}
                                    size="large"
                                />
                            )}
                        </div>
                        <div className="item-details-wrapper">
                            {this.renderCurrentTab()}
                            {/*<img className="empty-image" src={emptyStateImage}/>*/}
                            {/*<p className="empty-message">Looks like this user has no historical records yet</p>*/}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
