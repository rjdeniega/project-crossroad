import React, { Component } from 'react'
import { Icon } from 'react-icons-kit'
import { Card, List } from 'antd'
import { u1F68C } from 'react-icons-kit/noto_emoji_regular/u1F68C'
import { ic_edit } from 'react-icons-kit/md/ic_edit'
import { DeleteShuttle } from "./shuttle_actions/delete_shuttle";
import { Repairs } from "./shuttle_actions/shuttle_repairs";

const { Meta } = Card;

function checkStatus(status) {
    if (status === 'A') {
        return "Available"
    }
    else if (status === 'NM') {
        return "Needs Maintenance"
    }
    else {
        return "Under Maintenance"
    }
}

export class ShuttleCards extends Component {
    constructor(props){
      super(props);
      this.state = {
        shuttles: this.props.shuttles
      }
    }

    // componentDidUpdate() {
    //     this.props.fetchShuttles();
    //     this.state.shuttles = this.props.shuttles;
    // }

    render() {
        const { shuttles } = this.state;
        return (
            <div>
                <List
                    grid={{ gutter: 8, column: 4 }}
                    dataSource={shuttles}
                    renderItem={shuttle => (
                        <List.Item>
                            <Card style={{ width: 260 }}
                                  cover={<Icon icon={u1F68C} size={120}/>}
                                  actions={
                                      [<Repairs shuttle={shuttle}/>,
                                          <Icon icon={ic_edit}/>,
                                          <DeleteShuttle shuttle_id={shuttle.id}/>]}>
                                <Meta title={"Shuttle " + shuttle.id}
                                      description={"Plate Number: " + shuttle.plate_number + "\n" +
                                      "Model: " + shuttle.make + " " + shuttle.model + "\n" +
                                      "Mileage: " + shuttle.mileage + "\n"+ "Route: "+ shuttle.route + "\n" + "Status: " + checkStatus(shuttle.status)}
                                      style={{ whiteSpace: "pre-wrap" }}/>
                            </Card>
                        </List.Item>
                    )}>
                </List>
            </div>
        )
    }
}
