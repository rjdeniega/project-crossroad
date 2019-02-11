/**
 * Created by JasonDeniega on 29/05/2018.
 */
import React, {Component} from 'react';
import './style.css'
import logo from '../../images/crossroad_logo.png'
import {Icon} from 'react-icons-kit'
import {UsersPage,} from '../../pages/users/users'
import {users} from 'react-icons-kit/feather/'
import {u1F46E} from 'react-icons-kit/noto_emoji_regular/u1F46E'
import {driversLicenseO} from 'react-icons-kit/fa/driversLicenseO'
import {cube} from 'react-icons-kit/fa/cube'
import {userCircleO} from 'react-icons-kit/fa/userCircleO'
import {RemittancePage} from '../../pages/remittances/remittances'
import {InventoryPage} from '../../pages/inventory/inventory'
import {MaintenancePage} from '../../pages/maintenance/maintenance'
import {ReportsPage} from '../../pages/reports/reports'
import {TicketsPage} from '../../pages/tickets/tickets'
import {money} from 'react-icons-kit/fa/money'
import {Link, withRouter} from "react-router-dom";
import {wrench} from 'react-icons-kit/fa/wrench'
import { MembersPage } from "../../pages/members/members";
import {fileTextO} from 'react-icons-kit/fa/fileTextO'
import {ic_receipt} from 'react-icons-kit/md/ic_receipt'



//define tabs
const TABS = [
    {
        name: "Users",
        key: "users",
        path: '/users',
        component: UsersPage,
        image: userCircleO
    },
    {
        name: "Remittances",
        key: "remittances",
        path: '/remittances',
        component: RemittancePage,
        image: money
    },
    {
        name: "Members",
        key: "members",
        path: '/members',
        component: MembersPage,
        image: driversLicenseO
    },
    {
        name: "Inventory",
        key: "inventory",
        path: '/inventory',
        component: InventoryPage,
        image: cube
    },
    {
        name: "Maintenance",
        key: "maintenance",
        path: '/maintenance',
        component: MaintenancePage,
        image: wrench
    },
    {
        name: "Reports",
        key: "reports",
        path: '/reports',
        component: MembersPage,
        image: fileTextO
    },
];
const SUPERVISOR_TABS = [
    {
        name: "Remittances",
        key: "remittances",
        path: '/remittances',
        component: RemittancePage,
        image: money
    },
    {
        name: "Tickets",
        key: "tickets",
        path: '/tickets',
        component: TicketsPage,
        image: ic_receipt
    },
    {
        name: "Inventory",
        key: "inventory",
        path: '/inventory',
        component: InventoryPage,
        image: cube
    },
    {
        name: "Maintenance",
        key: "maintenance",
        path: '/maintenance',
        component: MaintenancePage,
        image: wrench
    },
];
const MEMBER_TABS = [
    {
        name: "Profile",
        key: "profile",
        path: '/profile',
        component: RemittancePage,
        image: driversLicenseO
    },
];
const MECHANIC_TABS = [
    {
        name: "Maintenance",
        key: "maintenance",
        path: '/maintenance',
        component: MaintenancePage,
        image: wrench
    },
];
const DRIVER_TABS = [
    {
        name: "Remittances",
        key: "remittances",
        path: '/remittances',
        component: RemittancePage,
        image: money
    },
];
const CLERK_OM_TABS = [
    {
        name: "Remittances",
        key: "remittances",
        path: '/remittances',
        component: RemittancePage,
        image: money
    },
    {
        name: "Members",
        key: "members",
        path: '/members',
        component: MembersPage,
        image: driversLicenseO
    },
    {
        name: "Inventory",
        key: "inventory",
        path: '/inventory',
        component: InventoryPage,
        image: cube
    },
    {
        name: "Maintenance",
        key: "maintenance",
        path: '/maintenance',
        component: MaintenancePage,
        image: wrench
    },
    {
        name: "Reports",
        key: "reports",
        path: '/reports',
        component: ReportsPage,
        image: fileTextO
    },
];
export class NavBar extends Component {
    // function to append all NavBar items
    // get every item in tab array and transform it to a component
    //iterate from TABS array and attach the necessary items. OnCurrentPageChange is a props passed from app.js (app folder)
    //props came from TABS array
    // you can pass props like a function <NavBarItems name(parameter) = prop>, parameters are defined in
    // NavBarItem Class(see below line 68)

    renderNavItems = () => {
        const user_type = JSON.parse(localStorage.user_type);
        if(user_type === "system_admin"){
            return this.renderAdminNav()
        }
        if(user_type === "driver"){
            return this.renderDriverNav()
        }
        if(user_type ==="operations_manager" || user_type === "clerk"){
            return this.renderOMClerkNav()
        }
        if(user_type === "supervisor"){
            return this.renderSupervisorNav()
        }
        if(user_type === "mechanic"){
            return this.renderMechanicNav()
        }
        if(user_type === "member"){
            return this.renderMemberNav()
        }
    };
    renderAdminNav = () => TABS.map(tab =>
        <Link key={tab.key} className="tab-link" to={tab.path} component={tab.component}>
            <NavBarItems name={tab.name}
                         icon={tab.image}/>
        </Link>
    );
    renderDriverNav = () => DRIVER_TABS.map(tab =>
        <Link className="tab-link" to={tab.path} component={tab.component}>
            <NavBarItems key={tab.key} name={tab.name}
                         icon={tab.image}/>
        </Link>
    );
    renderMechanicNav = () => MECHANIC_TABS.map(tab =>
        <Link className="tab-link" to={tab.path} component={tab.component}>
            <NavBarItems key={tab.key} name={tab.name}
                         icon={tab.image}/>
        </Link>
    );
    renderSupervisorNav = () => SUPERVISOR_TABS.map(tab =>
        <Link className="tab-link" to={tab.path} component={tab.component}>
            <NavBarItems key={tab.key} name={tab.name}
                         icon={tab.image}/>
        </Link>
    );
    renderMemberNav = () => MEMBER_TABS.map(tab =>
        <Link className="tab-link" to={tab.path} component={tab.component}>
            <NavBarItems key={tab.key} name={tab.name}
                         icon={tab.image}/>
        </Link>
    );
    renderOMClerkNav = () => CLERK_OM_TABS.map(tab =>
        <Link className="tab-link" to={tab.path} component={tab.component}>
            <NavBarItems key={tab.key} name={tab.name}
                         icon={tab.image}/>
        </Link>
    );

    render() {
        const {user, user_type} = localStorage;
        return (
            //render logo and all items
            <div className="nav-container">
                <img className='logo' src={logo}/>
                <div className="nav-item-container">
                    {this.renderNavItems()}
                </div>
            </div>

        );
    }
}
class NavBarItems extends Component {
    render() {
        return (
            <div className="navbar-item" onClick={this.props.onClick}>
                <Icon icon={this.props.icon} size={25}/>
                <p className="icon-label"> {this.props.name} </p>
            </div>
        );
    }
}
export default withRouter(NavBar, NavBarItems);
