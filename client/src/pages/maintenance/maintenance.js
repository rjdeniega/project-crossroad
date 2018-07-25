/**
 * Created by JasonDeniega on 09/07/2018.
 */
import React, {Component} from 'react';
import {Header} from './components/header/maintenance_header'
import {Divider} from 'antd'
import '../../utilities/colorsFonts.css'
import './style.css'
import {ListOfShuttles} from "./components/list_of_shuttles/list_of_shuttles";
import {AddShuttle} from "./components/add_shuttle/add_shuttle";

export class MaintenancePage extends Component {
    render() {
        return (
            <div className="body-wrapper" align="middle">
                <Header />
                <div className={'shuttles-div'} align="left">
                    <div className='upper'>
                        <h1 className={'shuttles-title'}>Shuttles</h1>
                        <div  style={{marginLeft: 15, marginTop: 27}}>
                            <AddShuttle/>
                        </div>
                    </div>
                    <Divider/>
                    <ListOfShuttles/>
                </div>
            </div>
        );
    }
}