import React, {Component} from 'react'

export class RepairDisplay extends Component{
    constructor(props){
        super(props);
        this.state = {
            problems: null,
            findings: null,
            modifications: null
        }
    }


    componentDidMount(){
        let repair = this.props.loadedRepair
        console.log(repair)
        if(typeof repair !== 'undefined'){
            fetch('inventory/shuttles/repairs/specific/' + repair.id)
                .then(response => {
                    return response;
                })
                .then(response => response.json())
                .then(data => console.log(data))
        }

    }

    render(){
        let repair = this.props.loadedRepair
        if(!repair.id){
            return(
                <div style={{border: 'solid', height: 250, width: '100%',
                            borderColor: '#E8E8E8', borderRadius: 5,
                            borderWidth: 1}} align='middle'>
                    <h2>Please select a repair</h2>
                </div>
            )
        } else {
            return(
                <div>
                    {repair.id}
                </div>
            )
        }
    }
}
