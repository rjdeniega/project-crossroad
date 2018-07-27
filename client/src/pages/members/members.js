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
import { Tabs, Spin, Input } from "antd";
import { Icon } from "react-icons-kit";
import { driversLicenseO } from "react-icons-kit/fa/driversLicenseO";
import { TicketingPane } from "../../pages/remittances/tabs/ticketing/ticketing";
import { BeepPane } from "../../pages/remittances/tabs/beep/beep";
import { OverviewPane } from "../../pages/remittances/tabs/overview/overview";
import { ShiftManagementPane } from "../../pages/remittances/tabs/shift_management/shift_management";

const TabPane = Tabs.TabPane;

const antIcon = (
  <AntIcon
    type="loading"
    style={{ fontSize: 70, color: "var(--darkgreen)" }}
    spin
  />
);

export class TransactionsPane extends Component {
  state = {
    activeUser: null
  };

  componentDidMount() {
    console.log("mounted");
  }

  componentDidUpdate() {
    console.log("updated");
  }

  componentWillReceiveProps() {
    this.setState({ activeUser: this.props.activeUser });
  }

  render() {
    const { activeUser } = this.props;
    return (
      <div>
        {activeUser && activeUser.name}
        Transactions
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
        return <TransactionsPane activeUser={activeUser} />;
      case 2:
        return <OverviewPane />;
      case 3:
        return <TicketingPane />;
      default:
        return <BeepPane />;
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

  render() {
    const { users } = this.state;
    const isLoading = users === null;
    return (
      <div className="body-wrapper">
        <div className="remittance-page-body">
          <div className="remittance-header">
            <div className="header-text">
              <Icon className="page-icon" icon={driversLicenseO} size={42} />
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
                  suffix={<Icon size={18} icon={search} />}
                />
              </div>
              <div className="user-tabs-wrapper">
              <Tabs
                className="user-tabs"
                defaultActiveKey="1"
                onChange={this.onTabChange}
              >
                <TabPane className="tab-item" tab="Transactions" key="1" />
                <TabPane className="tab-item" tab="Overview" key="2" />
                <TabPane className="tab-item" tab="Ticketing™" key="3" />
                <TabPane className="tab-item" tab="Beep™" key="4" />
              </Tabs>
            </div>
            </div>
          </div>
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
