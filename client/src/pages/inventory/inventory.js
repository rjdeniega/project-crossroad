/**
 * Created by Jason Deniega on 01/07/2018.
 */
import React, {Component} from 'react';
import {Header} from "./components/header/header"
import {Icon} from 'react-icons-kit'
import {warning} from 'react-icons-kit/typicons/warning'
import {Table} from 'antd'
import '../../utilities/colorsFonts.css'
import './style.css'

/**
 * @return {null}
 */
function CheckItem(props){
    const quantity = props.quantity;
    if(parseInt(quantity) < 3)
        return <Icon className='warning-icon' icon={warning} size={18} style={{color: 'red'}}/>;
    else
        return null
}

const dataSource = [{
        key: '0',
        name: 'Shuttle Light bulb',
        quantity: '16',
        brand: 'Fujitsu',
        vendor: 'Ace Hardware'
    },
    {
        key: '1',
        name: 'Philips Screws',
        quantity: '32',
        brand: 'Generic',
        vendor: 'Budjolex Repairs'
    },
    {
        key: '2',
        name: 'Tire Caps',
        quantity: '1',
        brand: 'Global Electronics',
        vendor: 'Home Depot'
}];

const columns = [{
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
},{
    title: 'Quantity',
    dataIndex: 'quantity',
    key: 'quantity',
    align: 'center',
    render: text => (
        <span>
            <CheckItem quantity={text}/>
            <p className='quantity-text'>{text}</p>
        </span>
    ),
},{
    title: 'Brand',
    dataIndex: 'brand',
    key: 'brand',
},{
    title: 'Vendor',
    dataIndex: 'vendor',
    key: 'vendor',
}];

export class InventoryPage extends Component{
    // go to app.js and switch to PAGES[index of this page in the array] to
    // make inventory initial page. Navbar inventory button works tho so up to u gl
    render(){
        return(
            <div className="body-wrapper">
                <Header/>
                <div className='table-style'>
                    <Table dataSource={dataSource} columns={columns}/>
                </div>
            </div>
        )
    }
}