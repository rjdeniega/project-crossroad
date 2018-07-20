/**
 * Created by Jason Deniega on 01/07/2018.
 */
import React, {Component} from 'react';
import {Header} from "./components/header/inventory-header"
import {Icon} from 'react-icons-kit'
import {warning} from 'react-icons-kit/typicons/warning'
import {arrowSortedDown} from 'react-icons-kit/typicons/arrowSortedDown'
import {zoom} from 'react-icons-kit/typicons/zoom'
import {Button, Modal, message, Table, Form, Menu, Dropdown, Input, InputNumber, Popconfirm} from 'antd'
import {ItemMovementTable} from "./components/item_movement/item_movement_display";
import '../../utilities/colorsFonts.css'
import './style.css'


const data = [];

function hasErrors(fieldsError){
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}

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

class RestockForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {
        item: props.item,
        inputValue: '',
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }


    componentDidMount(){
        this.props.form.validateFields();
    }

    handleSubmit(e){
        e.preventDefault();
        this.props.onSubmit();
        const new_quantity = this.props.quantity.value + this.props.item.quantity;
        console.log(this.props.quantity.value);
        console.log(this.props.item.quantity);
        let quants = {
            added_quantity: this.props.quantity.value,
            new_quantity: new_quantity
        };
        fetch('inventory/items/restock/' + this.props.item.id,{
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(quants),
        }).then(data => data).then(data => {message.success('Quantity has been added')});
        console.log(new_quantity)

    }

    render(){

        const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched} = this.props.form;
        const quantityError = isFieldTouched('quantity') && getFieldError('quantity');
        const unitpriceError = isFieldTouched('unit_price') && getFieldError('unit_price');

        return(
            <Form onSubmit={this.handleSubmit} hideRequiredMark={true}>
                        <FormItem className='quantity-label' label='Quantity'
                                  validateStatus={quantityError ? 'error' : ''}
                                  help={quantityError || ''}>
                                  {getFieldDecorator('quantity',{
                                      rules: [{
                                          required: true,
                                          message: 'Please input quantity',
                                      }]
                                  })(
                                      <InputNumber className='quantity' type="text" placeholder="Quantity"
                                                   formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}/>
                                )}
                            </FormItem>
                            <FormItem className='unit-price-label' label='Unit Price'
                              validateStatus={unitpriceError ? 'error' :''}
                                      help={unitpriceError || ''}>
                                {getFieldDecorator('unit_price',{
                                    rules: [{
                                        required: true,
                                        message: 'Please input unit price',
                                    }]
                                })(
                                    <InputNumber className='unit_price' type='text' placeholder="Unit Price"
                                             formatter={value => `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                             parser={value => value.replace(/₱\s?|(,*)/g, '')}/>
                                )}
                            </FormItem>
                            <FormItem>
                              <Button
                                type="primary"
                                htmlType="submit"
                                disabled={hasErrors(getFieldsError())}
                              >
                                Submit
                              </Button>
                            </FormItem>
                    </Form>
        )
    }
}

const RestockFormInit = Form.create({
    onFieldsChange(props, changedFields){
        props.onChange(changedFields);
    },
    mapPropsToFields(props){
        return{
            quantity: Form.createFormField({
                ...props.quantity,
                value: props.quantity.value,
            }),
        }
    },
})(RestockForm);

class RestockModal extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            visible: false,
            item: props.item,
            fields: {
                quantity: {
                    value: ''
                },
                vendor: {
                    value: ''
                },
                unit_price: {
                    value: ''
                }
            }

        };
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    handleOk = (e) => {
        this.setState({
            visible: false,
        });
    };

    handleCancel = (e) => {
        this.setState({
            visible: false,
        });
    };

    handleFormChange = (changedFields) => {
        this.setState(({fields}) => ({
            fields: {...fields, ...changedFields}
        }));
    };

    render(){
        const fields = this.state.fields;
        return(
            <div>
                <a onClick={this.showModal}>Restock</a>
                <Modal title={"Restock " + this.state.item.name}
                       visible={this.state.visible}
                       onCancel={this.handleCancel} footer={null}>
                    <RestockFormInit {...fields} onChange={this.handleFormChange}
                                     onSubmit={this.handleOk} item={this.state.item}/>
                </Modal>
            </div>
        )
    }

}

class ItemMovementModal extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            visible: false,
            item: props.item
        }
    }

    handleCancel = (e) => {
        this.setState({
            visible: false,
        });
    };

    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    render(){
        return(
            <div>
                <a onClick={this.showModal}>Item Movement</a>
                <Modal visible={this.state.visible} footer={null} onCancel={this.handleCancel}
                        title={this.state.item.name + " item movement"}>
                    <ItemMovementTable item={this.state.item}/>
                </Modal>
            </div>
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
        <Menu.Item key={props.id}>
            <ItemMovementModal item={props}/>
        </Menu.Item>
        <Menu.Item key={props.id}>
            <RestockModal item={props}/>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key={props.id}>
            <a onClick={() => table.edit(props.id)}>Edit</a>
        </Menu.Item>
        <Menu.Item key={props.id}>
            <Popconfirm
                title="Are you sure you want to delete this item?"
                onConfirm={() => table.onDelete(props)}>
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
            rowKey: 'id'
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
            }, {
                title: 'Brand',
                dataIndex: 'brand',
                key: 'brand',
                width: 200,
                sorter: (a, b) => {
                    return a.brand.localeCompare(b.brand)
                },
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
                        <p className='quantity-text'>{`${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
                    </span>
                ),
            }, {
                title: '',
                key: 'action',
                align: 'center',
                width: 100,
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
                                            onClick={() => this.save(form, record.id)}
                                            style={{marginRight: 8}}>
                                            Save
                                        </a>
                                    )}
                                </EditableContext.Consumer>
                                <Popconfirm
                                    title="Cancel without saving?"
                                    onConfirm={() => this.cancel(record.id)}>
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
        this.fetchItems()
    }

    componentDidUpdate(){
        this.fetchItems()
    }

    fetchItems(){
        fetch('inventory/items/')
             .then(response => {
                 return response;
             })
            .then(response => response.json())
            .then(data => this.setState({data: data.items, isLoading: false}));
    }

    isEditing = (record) => {
        return record.id === this.state.editingKey;
    };

    onDelete = (key) => {
        const data = [...this.state.data];
        message.success(key.name + " has been deleted");
        fetch('inventory/items/' + key.id,{
            method: "DELETE"
        })
            .then(response=>response);
    };

    edit(key) {
        this.setState({editingKey: key});
    }

    save(form, key) {
        form.validateFields((error, row) => {
            if (error) {
                return;
            }
            console.log(form.getFieldsValue());
            fetch('inventory/items/' + key,{
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(form.getFieldsValue()),
                }).then(data => data).then(() => {message.success('Item was edited')});
            this.setState({editingKey: ''});
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
                           rowKey='id'
                    />
                </div>
            )
        } else {
            return (
                <div>
                    <Table
                        className="whole-table"
                        components={components}
                        dataSource={data}
                        columns={columns}
                        rowClassName='editable-row'
                        rowKey='id'
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