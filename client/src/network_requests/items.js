import React, {Component} from 'react';

export class Items extends Component {
    constructor(props){
        super(props);

        this.state = {
            items: [],
            isLoading: false,
        };
    }

    componentDidMount(){
        this.setState({ isLoading: true });

        fetch('inventory/items/')
            .then(response => response.json())
            .then(data => this.setState({items: data.items, isLoading: false}));
    }

    render(){
        const {items, isLoading} = this.state;
        if(isLoading){
            return "Loading...";
        }
        return items
    }
}