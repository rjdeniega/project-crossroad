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
  } else {
    return "Members";
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
              <Icon
                icon={ic_markunread}
                onClick={() => this.markRead(isRead, id)}
              />
            ) : (
              <Icon
                icon={ic_drafts}
                onClick={() => this.markRead(isRead, id)}
              />
            )
          ]}
        >
          <List.Item.Meta title={checkNotif(title)} description={description} />
        </List.Item>
      </div>
    );
  }
}
