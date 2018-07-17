import React, {Component} from 'react'
import './style.css'
import {UserAvatar} from '../../../../components/avatar/avatar'
import {Icon} from 'react-icons-kit'
import {wrench} from 'react-icons-kit/fa/wrench'
import '../../../../utilities/colorsFonts.css'

export class Header extends Component {
    render(){
        return(
            <div className='maintenance-header'>
                <div className='upper-header'>
                    <div className='header-text'>
                        <Icon className='page-icon' icon={wrench} size={42}/>
                        <div className='page-title'>Maintenance</div>
                        <div className='current-date'>Manage Shuttles</div>

                    </div>
                    <UserAvatar/>
                </div>
            </div>
        )
    }
}