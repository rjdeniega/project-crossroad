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
import {MechanicView} from './components/mechanic_view'
import PerfectScrollbar from '@opuscapita/react-perfect-scrollbar';
import {DriverRepairRequest} from "./components/driver_repair_requests/driver_repair_request";

export class MaintenancePage extends Component {
    constructor(props) {
        super(props);

        this.listOfShuttles = React.createRef();
        this.reloadShuttles = this.reloadShuttles.bind(this)
    }

    reloadShuttles() {
        this.listOfShuttles.current.fetchShuttles();
    }

    render() {
        const user_type = JSON.parse(localStorage.user_type);
        return (
            <div className="body-wrapper" align="middle">
                <Header/>
                {user_type === 'mechanic' ? (
                    <MechanicView/>
                ) : user_type === 'driver' ? (<div className={'shuttles-div'}>
                    <DriverRepairRequest/>
                </div>): (
                    <div className={'shuttles-div'} align="left"
                         style={{overflowY: 'hidden', overflowX: 'hidden'}}>
                        <PerfectScrollbar>
                            <div className='upper'>
                                <h1 className={'shuttles-title'}>Shuttles</h1>
                                <div style={{marginLeft: 15, marginTop: 27}}>
                                    <AddShuttle reload_shuttles={this.reloadShuttles}/>
                                </div>
                            </div>
                            <Divider/>
                            <ListOfShuttles ref={this.listOfShuttles}/>
                        </PerfectScrollbar>
                    </div>
                )}
            </div>
        );
    }
}
