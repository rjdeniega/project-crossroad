import React, {Component} from 'react'
import {Icon} from 'react-icons-kit'
import {Popconfirm, message} from 'antd'
import {ic_delete} from 'react-icons-kit/md/ic_delete'

export class DeleteShuttle extends Component{
    constructor(props){
        super(props);
        this.state = {
            shuttle_id: props.shuttle_id
        }
    }

    onDelete(){
        message.success("Shuttle " + this.state.shuttle_id + ' has been deleted');
        fetch('inventory/shuttles/' + this.state.shuttle_id,{
            method: "DELETE"
        })
            .then(response=>response);
    }

    render(){
        return(
            <Popconfirm placement='bottom' title='Delete this shuttle?'
                        onConfirm={() => this.onDelete()}>
                <Icon icon={ic_delete}/>
            </Popconfirm>
        )
    }
}