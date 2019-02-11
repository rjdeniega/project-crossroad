import React, {Component} from 'react'
import './style.css'
import {UserAvatar} from '../../../../components/avatar/avatar'
import {Icon} from 'react-icons-kit'
import { money } from 'react-icons-kit/fa/money'
import '../../../../utilities/colorsFonts.css'

export class Header extends Component {
    render(){
        return(
            <div className='maintenance-header'>
                <div className='upper-header'>
                    <div className='header-text'>
                        <Icon className="page-icon" icon={money} size={42}/>
                        <div className='page-title'>Remittance</div>
                        <div className='current-date'>Manage Deployments</div>

                    </div>
                    <UserAvatar/>
                </div>
            </div>
        )
    }
}