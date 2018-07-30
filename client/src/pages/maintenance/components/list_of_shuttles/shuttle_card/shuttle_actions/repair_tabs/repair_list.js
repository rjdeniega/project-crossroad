import React, {Component} from 'react'
import {Icon} from 'react-icons-kit'

export class RepairsTable extends Component{
    constructor(props){
        super(props);
        this.state = {
            shuttle: props.shuttle,
            repairs: [],
        }
    }

    componentDidMount(){
        this.fetchRepairs();
    }

    fetchRepairs(){
        const {shuttle} = this.state;
        console.log(shuttle.id);
        fetch('inventory/shuttles/repairs/' + shuttle.id)
            .then(response => response.json())
            .then(
                data => {
                    if(!data.error){
                        this.setState({
                            repairs: data.repairs
                        })
                    } else {
                        console.log(data.error)
                    }
            })
    }

    render(){
        const {repairs} = this.state;

        if (repairs.length === 0){
            return(
                <div>
                    <p>wow</p>
                </div>
            )
        }else{
            return(
                <div>
                    <p>aw</p>
                </div>
            )
        }
    }
}
