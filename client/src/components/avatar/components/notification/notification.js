import { List, message } from "antd";
import React, { Component } from "react";
import { Icon } from "react-icons-kit";
import { ic_drafts } from "react-icons-kit/md/ic_drafts";
import { ic_markunread } from "react-icons-kit/md/ic_markunread";
import "./style.css";

function checkNotif(title) {
  if (title === "I") {
    return "Inventory";
  } else if (title === "R") {
    return "Remittances";
  } else if (title === "M"){
    return "Members";
  } else {
    return "Maintenance";
  }
}

export default class Notification extends Component {
  constructor(props) {
    super(props);
  }

  markRead = (isRead, id) => {
    if (isRead === true) {
      message.success("Marked as unread");
    } else {
      message.success("Marked as read");
    }

    fetch("notifications/mark/" + id, { method: "POST" }).then(response => {
      return response;
    });
  };

  render() {
    const { title, description, isRead, id } = this.props;

    return (
      <div className="specific-notification">
        <List.Item
          actions={[
            isRead === true ? (
              <div>
                Mark as unread &nbsp;
                <Icon
                  icon={ic_markunread}
                  onClick={() => this.markRead(isRead, id)}
                />
              </div>
            ) : (
              <div>
                Mark as read &nbsp;
                <Icon
                  icon={ic_drafts}
                  onClick={() => this.markRead(isRead, id)}
                />
              </div>
            )
          ]}
        >
          <List.Item.Meta title={checkNotif(title)} description={description} />
        </List.Item>
      </div>
    );
  }
}
