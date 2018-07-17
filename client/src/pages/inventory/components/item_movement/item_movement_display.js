import React, {Component} from 'react';
import {Table} from 'antd'
import '../../../../utilities/colorsFonts.css'

export class ItemMovementTable extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            item: props.item,
            data: '',
        }
    }
    componentDidMount(){
        console.log(this.state.item.id);
        fetch('inventory/items/restock/' + this.state.item.id)
            .then(response => {
                return response;
            })
            .then(response => response.json())
            .then(data => this.setState({data: data.movements})).then(() => console.log(this.state.data));
    }

    render(){
        return(
            <div>
                <Table>

                </Table>
            </div>
        )
    }
}