/**
 * Created by Jason Deniega on 01/07/2018.
 */
import React, {Component} from 'react';
import {Header} from "./components/header/inventory-header"
import {Icon} from 'react-icons-kit'
import {warning} from 'react-icons-kit/typicons/warning'
import {arrowSortedDown} from 'react-icons-kit/typicons/arrowSortedDown'
import {zoom} from 'react-icons-kit/typicons/zoom'
import {Table, Form, Menu, Dropdown, Input, InputNumber, Popconfirm} from 'antd'
import '../../utilities/colorsFonts.css'
import './style.css'
import {Items} from '../../network_requests/items'

/*let databoi = [];
 const item = fetch('inventory/items/').then(response => response.json()).then((responseJSON) => {
 // do stuff with responseJSON here...
 databoi = responseJSON;
 console.log(responseJSON);
 });
 console.log(databoi);*/

/*const items = Items;
 console.log(items.toString());
 /!* Dummy data to fill the table *!/
 const data = [{
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
 }];*/

const Search = Input.Search;
const data = [];
/**
 *  Function that checks whether the item is less than 3 items to comply with the business rule
 * @return {null}
 */
function CheckItem(props) {
    const quantity = props.quantity;
    if (parseInt(quantity) < 3)
        return <Icon className='warning-icon' icon={warning} size={18} style={{color: 'red'}}/>;
    else
        return null
}

const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({form, index, ...props}) => (
    <EditableContext.Provider value={form}>
        <tr {...props} />
    </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
    getInput = () => {
        if (this.props.inputType === 'number') {
            return <InputNumber/>;
        }
        return <Input/>
    };

    render() {
        const {
            editing,
            dataIndex,
            title,
            inputType,
            record,
            index,
            ...restProps
        } = this.props;
        return (
            <EditableContext.Consumer>
                {(form) => {
                    const {getFieldDecorator} = form;
                    return (
                        <td {...restProps}>
                            {editing ? (
                                    <FormItem style={{margin: 0}}>
                                        {getFieldDecorator(dataIndex, {
                                            rules: [{
                                                required: true,
                                                message: `Please Input ${title}!`,
                                            }],
                                            initialValue: record[dataIndex],
                                        })(this.getInput())}
                                    </FormItem>
                                ) : restProps.children}
                        </td>
                    )
                }}
            </EditableContext.Consumer>
        )
    }
}

/*
 * The content of the dropdown menu
 *
 * Passing "props" is so that the actions are tied to the specific item
 */
const ItemActions = (props, table) => (
    <Menu>
        <Menu.Item key="0">
            <a href="#">Restock</a>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="0">
            <a onClick={() => table.edit(props.key)}>Edit</a>
        </Menu.Item>
        <Menu.Item key="0">
            <Popconfirm
                title="Are you sure you want to delete this item?"
                onConfirm={() => table.onDelete(props.key)}>
                <a>Delete</a>
            </Popconfirm>
        </Menu.Item>
    </Menu>
);

/*
 * The "settings" of the entire table
 */
class EditableTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filterDropdownVisible: false,
            data,
            editingKey: '',
            searchText: '',
            filtered: false,
            isLoading: false,
        };

        this.columns = [
            {
                title: 'Name',
                dataIndex: 'name',
                width: 300,
                key: 'name',
                editable: true,
                defaultSortOrder: 'ascend',
                sorter: (a, b) => {
                    return a.name.localeCompare(b.name)
                },
                filterDropdown: (
                    <div className='custom-filter-dropdown'>
                        <Search placeholder="Input search text"
                                ref={ele => this.searchInput = ele}
                                value={this.state.searchText}
                                onChange={this.onInputChange}
                                onKeyDown={this.onSearch()}/>
                    </div>
                ),
                filterIcon: <Icon icon={zoom} style={{color: this.state.filtered ? '#108ee9' : '#aaa'}}/>,
                filterDropdownVisible: this.state.filterDropdownVisible,
                onFilterDropdownVisibleChange: (visible) => {
                    this.setState({
                        filterDropdownVisible: visible,
                    }, () => this.searchInput && this.searchInput.focus());
                },
            }, {
                title: 'Brand',
                dataIndex: 'brand',
                key: 'brand',
                width: 300,
                sorter: (a, b) => {
                    return a.name.localeCompare(b.name)
                },
                editable: true,
            }, {
                title: 'Vendor',
                dataIndex: 'vendor',
                key: 'vendor',
                width: 300,
                sorter: (a, b) => {
                    return a.name.localeCompare(b.name)
                },
                editable: true,
            }, {
                title: 'Unit Price',
                dataIndex: 'unit_price',
                key: 'vendor',
                width: 150,
                editable: true,
            }, {
                title: 'Quantity',
                dataIndex: 'quantity',
                key: 'quantity',
                align: 'center',
                width: 150,
                editable: false,
                filters: [{
                    text: 'Understocked',
                    value: 3
                }],
                onFilter: (value, record) => parseInt(record.quantity) <= value,
                render: text => (
                    <span>
                        <CheckItem quantity={text}/>
                        <p className='quantity-text'>{text}</p>
                    </span>
                ),
            }, {
                title: '',
                key: 'action',
                align: 'center',
                render: record => {
                    const editable = this.isEditing(record);
                    return (
                        <div>
                            {editable ? (
                                    <span>
                                <EditableContext.Consumer>
                                    {form => (
                                        <a
                                            href="javascript:"
                                            onClick={() => this.save(form, record.key)}
                                            style={{marginRight: 8}}>
                                            Save
                                        </a>
                                    )}
                                </EditableContext.Consumer>
                                <Popconfirm
                                    title="Cancel without saving?"
                                    onConfirm={() => this.cancel(record.key)}>
                                    <a>Cancel</a>
                                </Popconfirm>
                            </span>
                                ) : (<span>
                            <Dropdown overlay={ItemActions(record, this)} trigger={['click']}>
                                <a href="#" className="ant-dropdown-link">
                                    Actions<Icon className="action-icon" icon={arrowSortedDown} size={14}/>
                                </a>
                            </Dropdown>
                        </span>)}

                        </div>
                    );
                },
            }]
    }

    /*
     * Area for methods
     */

    componentDidMount() {
        this.setState({isLoading: true});

        fetch('http://localhost:9000/inventory/items/')
             .then(response => {
                 console.log("response", response);
                 return response;
             })
            .then(response => response.json())
             .then(data => this.setState({data: data.items, isLoading: false}));
    }

    onInputChange = (e) => {
        this.setState({searchText: e.target.value});
    };

    onSearch = () => {
        const {searchText} = this.state;
        const reg = new RegExp(searchText, 'gi');
        this.setState({
            filtered: !!searchText,
            data: data.map((record) => {
                const match = record.name.match(reg);
                if (!match) {
                    return null;
                }
                return {
                    ...record,
                    name: (
                        <span>
                           {record.name.split(new RegExp(`(?:${searchText})|(?=${searchText})`, 'i')).map((text, i) => (
                               text.toLowerCase() === searchText.toLowerCase()
                                   ? <span key={i} className="highlight">{text}</span> : text
                           ))}
                        </span>
                    ),
                };
            }).filter(record => !!record),
        })
    };

    isEditing = (record) => {
        return record.key === this.state.editingKey;
    };

    onDelete = (key) => {
        const data = [...this.state.data];
        this.setState({data: data.filter(item => item.key !== key)});
    };

    edit(key) {
        this.setState({editingKey: key});
    }

    save(form, key) {
        form.validateFields((error, row) => {
            if (error) {
                return;
            }
            const newData = [...this.state.data];
            const index = newData.findIndex(item => key === item.key);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row,
                });
                this.setState({data: newData, editingKey: ''});
            } else {
                newData.push(data);
                this.setState({data: newData, editingKey: ''});
            }
        })
    }

    cancel = () => {
        this.setState({editingKey: ''});
    };

    render() {
        const components = {
            body: {
                row: EditableFormRow,
                cell: EditableCell,
            },
        };

        const columns = this.columns.map((col) => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    inputType: 'text',
                    dataIndex: col.dataIndex,
                    title: col.title,
                    editing: this.isEditing(record),
                }),
            }
        });

        const {data, isLoading} = this.state;
        if (isLoading) {
            return (
                <div>
                    <Table className="whole-table"
                           columns={columns}
                           loading={true}
                           components={components}
                           rowClassName='editable-row'
                           pagination={{pageSize: 30}}
                    />
                </div>
            )
        } else {
            console.log(this.state);
            return (
                <div>
                    <Table
                        className="whole-table"
                        components={components}
                        dataSource={this.state.data}
                        columns={columns}
                        rowClassName='editable-row'
                        pagination={{pageSize: 30}}/>
                </div>
            )
        }
    }
}

export class InventoryPage extends Component {
    // go to app.js and switch to PAGES[index of this page in the array] to
    // make inventory initial page. Navbar inventory button works tho so up to u gl
    render() {
        return (
            <div className="body-wrapper">
                <Header/>
                <div className='table-style'>
                    <EditableTable />
                    <div>

                    </div>
                </div>
            </div>
        )
    }
}