/**
 * Created by JasonDeniega on 20/02/2019.
 */
/**
 * Created by JasonDeniega on 16/11/2018.
 */
/**
 * Created by JasonDeniega on 24/05/2018.
 */
import React, { Component, Fragment } from "react"
import '../../utilities/colorsFonts.css'
import { List, Avatar, Alert } from 'antd'
import './style.css'
import emptyStateImage from '../../images/empty state record.png'
import users from '../../images/default.png'
import {
    Spin,
    Icon as AntIcon,
    Divider,
    Table,
    message,
    Modal,
    Button,
    Input,
    DatePicker,
    Select,
    Tag,
    Row,
    Col,
    InputNumber
} from 'antd';
import { Icon } from 'react-icons-kit'
import { driversLicenseO } from 'react-icons-kit/fa/driversLicenseO'
import { UserAvatar } from "../../components/avatar/avatar"
import { getData, postData, postDataWithImage } from '../../network_requests/general'
import moment from "moment";

const dateFormat = "YYYY-MM-DD";
const Option = Select.Option;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;

function onChange(date, dateString) {
    console.log(date, dateString);
}

const columns = [{
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: text => <a href="javascript:;">{text}</a>,
}, {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
}, {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
}, {
    title: 'Tags',
    key: 'tags',
    dataIndex: 'tags',
    render: tags => (
        <span>
      {tags.map(tag => {
          let color = tag.length > 5 ? 'geekblue' : 'green';
          if (tag === 'loser') {
              color = 'volcano';
          }
          return <Tag color={color} key={tag}>{tag.toUpperCase()}</Tag>;
      })}
    </span>
    ),
}, {
    title: 'Action',
    key: 'action',
    render: (text, record) => (
        <span>
      <a href="javascript:;">Invite {record.name}</a>
      <Divider type="vertical"/>
      <a href="javascript:;">Delete</a>
    </span>
    ),
}];

const data = [{
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
}, {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
}, {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
}];
export class HistoryPage extends Component {
    state = {
        users: null,
        visible: false,
        transactions_visible: false,
        name: null,
        address: null,

    };

    componentDidMount() {
    }

    componentDidUpdate() {
    }

    handleOk = () => {

    };
    handleCancel = (e) => {
        console.log(e);
        this.setState({
            visible: false,
            transactions_visible: false,
        });
    };

    showModal = () => {
        this.setState({
            visible: true,
        });
    };
    showTransactions = () => {
        this.setState({
            transactions_visible: true,
        });
    };

    fetchMemberShares() {
        const { id } = JSON.parse(localStorage.user_staff);
        getData('/members/shares/' + id).then(data => {
            console.log(data);
            this.setState({
                shares: data.shares,
                total_shares: data.total_shares,
                total_peso_value: data.total_peso_value,
            })
        });
    }

    fetchMemberTransactions() {
        const { id } = JSON.parse(localStorage.user_staff);
        getData('/members/transactions/' + id).then(data => {
            console.log(data.transactions);
            this.setState({
                transactions: data.transactions,
                total_transactions: data.total_transactions
            })
        });
        getData('/remittances/get_carwash_transaction/' + id).then(data => {
            console.log(data);
            this.setState({
                carwash_transactions: data.carwash_transactions,
                total_carwash_transactions: parseInt(data.carwash_transaction_total),
            })
        });
    }

    handleFormChange = fieldName => event => {
        return this.handleSelectChange(fieldName)(event.target.value);
        //this is asynchronous, it does not execute in order
        //if console.log is not in callback, it might execute before state is updated
    };
    handleSelectChange = fieldName => value => {
        // this function is to handle drop-downs
        const state = { ...this.state };
        state[fieldName] = value;
        this.setState({
            ...state
        });
    };
    handleNumberFormChange = fieldName => value => {
        return this.handleSelectChange(fieldName)(value);
        //this is asynchronous, it does not execute in order
        //if console.log is not in callback, it might execute before state is updated
    };

    fetchUsers() {
        return fetch('/staff_accounts').then(response => response.json()).then(data => {
            this.setState({
                users: data["people"].reverse()
            }, () => console.log(this.state.users));
        });
    }

    renderListItemPhoto = photoSrc => {
        console.log("Photo src", photoSrc);
        return <Avatar className="list-avatar" size="large"
                       src={photoSrc ? photoSrc : users}/>;
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
                <List.Item className="list-item">
                    <List.Item.Meta
                        avatar={this.renderListItemPhoto(item.photo)}
                        title={<p className="list-title">{item.name}</p>}
                        description={<p className="list-description"> operations manager</p>}
                    />
                </List.Item>
            )}
        />
    );

    render() {
        return (
            <div className="body-wrapper">
                <div className="header">
                    <div className="header-text">
                        <Icon className="page-icon" icon={driversLicenseO} size={42}/>
                        <div className="page-title"> Remittance History</div>
                        <div className="rem-page-description"> View Remittance History</div>
                    </div>
                    <UserAvatar/>
                </div>
                <div className="driver-history-page-body">
                    <div className="driver-history-body">
                        <Row className="dates-div">
                            <Col span={12} style={{'margin-top': '20px'}}>
                                <RangePicker onChange={onChange}/>
                            </Col>
                            <Col span={12}>
                                <Alert className="history-alert" message="If end date is not selected, The table will show remittances for 1 week from the start date" type="info" showIcon/>
                            </Col>
                        </Row>
                        <Row>
                            <div className="driver-history-table-div">
                                <Table columns={columns} dataSource={data}/>
                            </div>
                        </Row>
                    </div>
                </div>
            </div>
        );
    }
}


