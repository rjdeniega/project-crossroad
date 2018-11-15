/**
 * Created by JasonDeniega on 16/11/2018.
 */
/**
 * Created by JasonDeniega on 24/05/2018.
 */
import React, { Component, Fragment } from "react"
import '../../utilities/colorsFonts.css'
import { List, Avatar } from 'antd'
import './style.css'
import emptyStateImage from '../../images/empty state record.png'
import users from '../../images/default.png'
import { Spin, Icon as AntIcon, Divider, Table } from 'antd';
import { Icon } from 'react-icons-kit'
import { driversLicenseO } from 'react-icons-kit/fa/driversLicenseO'
import { UserAvatar } from "../../components/avatar/avatar"
import { getData, postData } from '../../network_requests/general'


const antIcon = <Icon type="loading" style={{ fontSize: 70, color: 'var(--darkgreen)' }} spin/>;
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
export class ProfilePage extends Component {
    state = {
        users: null
    };

    componentDidMount() {
        this.fetchMember()
    }

    componentDidUpdate() {

    }

    fetchMember() {
        const { id } = JSON.parse(localStorage.user_staff);
        getData('/members/profile/' + id).then(data => {
            console.log(data);
            this.setState({
                activeUser: data.member
            })
        });

    }

    onNewUserCreate = (user) => {
        this.setState({
            users: [user, ...this.state.users]
        })
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
        return photoSrc ? photoSrc : users
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
        const { users, activeUser } = this.state;
        const isLoading = users === null;
        return (
            <div className="body-wrapper">
                <div className="header">
                    <div className="header-text">
                        <Icon className="page-icon" icon={driversLicenseO} size={42}/>
                        <div className="page-title"> My Profile</div>
                        <div className="rem-page-description"> Manage your profile</div>
                    </div>
                    <UserAvatar/>
                </div>
                <div className="page-body">
                    {activeUser &&
                    <Fragment>
                        <div className="member-profile-container">
                            <div className="profile-container">
                                <div className="container">
                                    <div className="header-div">
                                        <img className="profile-image"
                                             src={this.renderListItemPhoto(activeUser.photo)}/>
                                        <div className="basic-info">
                                            <div className="info-row"><b>Name:</b> {activeUser.name}</div>
                                            <div className="info-row"><b>Contact Number:</b> {activeUser.contact_no}
                                            </div>
                                            <div className="info-row"><b>E-mail:</b> {activeUser.email}</div>
                                        </div>
                                    </div>
                                    <Divider orientation="left">Member Information</Divider>
                                    <div className="member-info">
                                        <div className="info-row-1"><b>Accepted date:</b> {activeUser.accepted_date}
                                        </div>
                                        <div className="info-row-2"><b>E-mail:</b> {activeUser.email}</div>
                                        <div className="info-row-1"><b>Withrawal date:</b> {activeUser.termination_date}
                                        </div>
                                        <div className="info-row-2"><b>Occupation:</b> {activeUser.occupation}</div>
                                        <div className="info-row-1"><b>Tin number:</b> {activeUser.tin_number}</div>
                                        <div className="info-row-2"><b>Educational
                                            Attainment:</b> {activeUser.educational_attainment}
                                        </div>
                                        <div className="info-row-1"><b>Religion:</b> {activeUser.religion}</div>
                                        <div className="info-row-2"><b>Sex:</b> {activeUser.sex}</div>
                                        <div className="info-row-1"><b>Address:</b> {activeUser.address}</div>
                                        <div className="info-row-2"><b>Annual Income:</b> {activeUser.annual_income}
                                        </div>
                                        <div className="info-row-1"><b>Card Number:</b> {activeUser.card_number}</div>
                                        <div className="info-row-2"><b>No of
                                            Dependents:</b> {activeUser.no_of_dependents}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="tables">
                                <div className="table-container">
                                    <div className="tab-label">
                                        Carwash transactions
                                    </div>
                                    <p> total transaction cost: <b>{this.state.total_carwash_transactions} </b></p>
                                    <Table bordered size="medium"
                                           className="remittance-table"
                                           columns={carwash_columns}
                                           dataSource={this.state.carwash_transactions}

                                    />
                                </div>
                                <div className="shares-container">
                                    <div className="tab-label">
                                        Shares
                                    </div>
                                    <p> total shares: <b>{this.state.total_shares}</b></p>
                                    <p> total shares (in Php): <b>Php {this.state.total_peso_value}</b></p>

                                    <Table bordered size="medium"
                                           className="remittance-table"
                                           columns={this.share_columns}
                                           dataSource={this.state.shares}
                                    />
                                </div>
                            </div>
                        </div>
                    </Fragment>
                    }
                </div>
            </div>
        );
    }
}


