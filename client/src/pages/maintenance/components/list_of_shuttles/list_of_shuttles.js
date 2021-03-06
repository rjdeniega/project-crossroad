import React, { Component } from 'react'
import { Icon } from 'react-icons-kit'
import { ic_airport_shuttle } from 'react-icons-kit/md/ic_airport_shuttle'
import { AddShuttle } from '../add_shuttle/add_shuttle'
import { ShuttleCards } from "./shuttle_card/shuttle_card";


export class ListOfShuttles extends Component {
    constructor(props) {
        super(props);
        this.state = {
            shuttles: [],
        };
        this.fetchShuttles = this.fetchShuttles.bind(this)
    }

    componentDidMount() {
        this.fetchShuttles()
    }
    
    fetchShuttles() {
        fetch('inventory/shuttles/')
            .then(response => {
                return response;
            })
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    this.setState({
                        shuttles: data.shuttles
                    });
                }
                else {
                    console.log(data.error)
                }
            }).catch(error => console.log(error));
    }

    render() {
        const { shuttles } = this.state;

        if (shuttles.length === 0) {
            return (
                <div align="center">
                    <Icon icon={ic_airport_shuttle} size={150}/>
                    <h2>There are no shuttles</h2>
                    <AddShuttle/>
                </div>
            )
        }
        else {
            return (
                <div>
                    <ShuttleCards shuttles={shuttles} fetchShuttles={this.fetchShuttles}/>
                </div>
            )
        }
    }
}
