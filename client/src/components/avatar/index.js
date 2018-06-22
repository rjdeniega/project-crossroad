/**
 * Created by JasonDeniega on 21/06/2018.
 */
import React, {Component} from 'react';
import './style.css'
import {Tag, Avatar} from 'antd'
import {me} from '../../images/me.jpg'

// const UserAvatarInitials = ({initials, fullName, className, onClick}) => (
//     <Avatar size="large" icon ="user" className={className} alt={fullName}>{initials}</Avatar>
// );
//
// const UserAvatarPhoto = ({photo, fullName, className, onClick}) => (
//     <Avatar className={className} alt={fullName} src={photo}/>
// );
//
// export const UserAvatar = ({classes, user, className, onClick}) => {
//         // const fullName = getFullName(user);
//         // const initials = getInitials(user);
//         const fullName = "Jason Deniega";
//         const initials = "JD";
//
//         const photo = me;
//
//         return photo ?
//             <UserAvatarPhoto
//                 photo={photo}
//                 fullName={fullName}
//                 className="user-avatar-photo"
//             /> :
//             <UserAvatarInitials
//                 initials={initials}
//                 fullName={fullName}
//                 className="user-avatar-initials"
//             />;
//     };

export class UserAvatar extends Component {
    render() {
        return (
            <div className="header-wrapper">
                <div className="header-icons">
                    <div className="user-full-name"> Jason Deniega</div>
                    <Tag className="user-type" color="#6c54d0">OM</Tag>
                    <div className="user-avatar">
                        <Avatar size="large" style={{backgroundColor: '#6c54d0'}}
                                src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"/>
                    </div>
                </div>
            </div>
        );
    }
}
