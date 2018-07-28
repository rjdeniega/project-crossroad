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
import { Tabs, Spin, Input, Table, Button } from "antd";
import { Icon } from "react-icons-kit";
import { driversLicenseO } from "react-icons-kit/fa/driversLicenseO";
import { TicketingPane } from "../../pages/remittances/tabs/ticketing/ticketing";
import { BeepPane } from "../../pages/remittances/tabs/beep/beep";
import { OverviewPane } from "../../pages/remittances/tabs/overview/overview";
import { ShiftManagementPane } from "../../pages/remittances/tabs/shift_management/shift_management";
import { getData } from '../../network_requests/general'

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

export class TransactionsPane extends Component {
    state = {
        activeUser: null,
        transactions: null,
    };

    componentDidMount() {
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
                transactions: data.transactions
            })
        });
    }

    render() {
        const { activeUser } = this.props;
        return (
            <div>
                {/*{activeUser && activeUser.name}*/}
                <Table bordered size="medium"
                       className="remittance-table"
                       columns={columns}
                       dataSource={this.state.transactions}

                />
            </div>
        );
    }
}
export class SharesManagementPane extends Component {
    state = {
        activeUser: null,
        shares: null,
    };

    componentDidMount() {
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
            console.log(data.shares);
            this.setState({
                shares: data.shares
            })
        });
    }

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
                {text}
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
        return (
            <div>
                Manage your shares
                <Table bordered size="medium"
                       className="remittance-table"
                       columns={this.share_columns}
                       dataSource={this.state.shares}
                />
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
                return <OverviewPane />;
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
