import React, {Component} from 'react'
import {Icon} from 'react-icons-kit'
import PerfectScrollbar from '@opuscapita/react-perfect-scrollbar';
import {List, Row, Col, Menu, Button, Modal, Form, message, Input, Tag, Select} from 'antd'
import {ic_loop} from 'react-icons-kit/md/ic_loop'
import {postData, getData, putData} from "../../../network_requests/general"
import {ic_access_time} from 'react-icons-kit/md/ic_access_time'
import {ic_check} from 'react-icons-kit/md/ic_check'
import {ic_import_export} from 'react-icons-kit/md/ic_import_export'
import {ic_navigate_next} from 'react-icons-kit/md/ic_navigate_next'
import {withMinus} from 'react-icons-kit/entypo/withMinus'
import {plus} from 'react-icons-kit/entypo/plus'
import {AddItems} from './add_item_modal'
import {OutsourceForm} from './confirm_outsource'


const ButtonGroup = Button.Group;

const div_style = {
    border: 'solid', width: '100%',
    borderColor: '#E8E8E8', borderRadius: 5,
    borderWidth: 1, padding: 20,
    backgroundColor: 'white', height: '78vh'
};

function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field])
}

class FindingsForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            repair: props.repair,
            defective_item: null,
            finding: null,
            categories: [],

        };

        this.submitFinding = this.submitFinding.bind(this)
    }

    componentDidMount() {
        this.getCategories()
    }

    submitFinding() {
        const {finding, defective_item, repair} = this.state;
        console.log(finding + defective_item);
        let data = {
            category: defective_item,
            finding: finding,
        };
        postData('inventory/mechanic/findings/' + repair.id, data).then(data => {
            this.props.loadFindings(data.findings)
        });
        this.props.close()
    }

    getCategories() {
        getData('inventory/items/item_category/').then(data => {
            this.setState({
                categories: data.item_category,
            }, () => {
                console.log(this.state)
            })
        })
    }

    render() {
        const {categories, finding} = this.state;

        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 8},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 16},
            },
        };
        const formItemLayoutWithOutLabel = {
            wrapperCol: {
                xs: {span: 24, offset: 0},
                sm: {span: 20, offset: 8},
            },
        };
        return (
            <div>
                <Form.Item label="Finding" {...formItemLayout}>
                    <Input onChange={e => this.setState({
                        finding: e.target.value
                    })}/>
                </Form.Item>
                <Form.Item label="Item Defect" {...formItemLayout}>
                    <Select style={{width: "100%"}} onSelect={value => {
                        this.setState({
                            defective_item: value
                        })
                    }}>
                        <Select.Option value={null}>None</Select.Option>
                        {categories.map(function (category) {
                            return <Select.Option value={category.id}>{category.category}</Select.Option>
                        })}
                    </Select>
                </Form.Item>
                <Form.Item {...formItemLayoutWithOutLabel}>
                    <Button htmlType="button" type="primary" onClick={this.submitFinding} disabled={!finding && true}>
                        Add Finding
                    </Button>
                </Form.Item>
            </div>
        )
    }
}

export class MechanicView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            repairs: [],
            loadedRepair: '',
            problems: '',
            findings: '',
            modifications: '',
            currentTab: 1,
            findingsModal: false,
            itemsModal: false,
            outsourceModal: false,
            items: [],
            categories: [],
            suggestion: "Minor",
        };

        this.setfindingsVisible = this.setfindingsVisible.bind(this);
        this.setItemsVisible = this.setItemsVisible.bind(this);
        this.forwardToOperations = this.forwardToOperations.bind(this);
    }

    unloadRepair() {
        this.setState({
            loadedRepair: ''
        })
    }

    setfindingsVisible(findingsModal) {
        this.setState({findingsModal})
    }

    setItemsVisible(itemsModal) {
        this.setState({itemsModal})
    }

    setOutsourcedVisible(outsourceModal) {
        this.setState({outsourceModal})
    }

    componentDidMount() {
        this.loadRepairs();

        getData('inventory/items')
            .then(data => {
                if (!data.error) {
                    let categories = [];
                    data.categories.forEach(function (category) {
                        categories[category.id] = category.category
                    });
                    this.setState({
                        items: data.items,
                        categories: categories
                    }, () => console.log(this.state))
                } else {
                    console.log(data.error)
                }
            })
    }

    loadRepairs() {
        fetch('inventory/mechanic/repairs')
            .then(response => response.json())
            .then(
                data => {
                    if (!data.error) {
                        this.setState({
                            repairs: data.repairs
                        })
                    } else {
                        console.log(data.error)
                    }
                }
            )
    }

    repairAction(pk, action) {
        let data = {
            action: action
        };
        putData('inventory/mechanic/items/add/' + pk, data)
            .then(response => {
                return response;
            })
            .then(data => {
                this.loadRepairs();
                message.success('Repair ' + action);
                if (action === 'complete') {
                    this.setState({
                        loadedRepair: ''
                    })
                } else {
                    this.setState({
                        loadedRepair: data.repair
                    })
                }
            })
    }

    loadFindings(findings) {
        console.log('aw');
        this.setState({
            findings: findings,
        })
    }

    loadItems(items) {
        this.setState({
            modifications: items
        })
    }

    loadNewRepair = (record) => {
        fetch('inventory/shuttles/repairs/specific/' + record.id)
            .then(response => {
                return response;
            })
            .then(response => response.json())
            .then(data => this.setState({
                problems: data.problems,
                findings: data.findings,
                modifications: data.modifications,
                loadedRepair: record,
            }))
    };

    handleClick = (e) => {
        let content;
        switch (e.key) {
            case '1':
                content = 1;
                break;
            case '2':
                content = 2;
                break;
            case '3':
                content = 3;
                break;
        }
        this.setState({
            currentTab: content,
        })
    };

    renderCurrentPage = () => {
        const {currentTab, problems, findings, modifications, loadedRepair, items, categories} = this.state;

        switch (currentTab) {
            case 1:
                return (
                    <List bordered size='small'>
                        {problems.map(function (problem, index) {
                            return (
                                <List.Item>{problem.description}</List.Item>
                            )
                        })}
                    </List>);
            case 2:
                return (
                    <div>
                        {findings.length === 0 ? '' :
                            (
                                <List size='small'
                                      bordered>
                                    {findings.map(function (finding, index) {
                                        return (
                                            <List.Item>{categories[finding.item_defect]} - {finding.description}</List.Item>
                                        )
                                    })}
                                </List>
                            )}
                        <br/>
                        <Button type='dashed' onClick={() => this.setfindingsVisible(true)}
                                hidden={loadedRepair.status === 'IP' ? 'true' : ''}
                                style={{width: '100%'}}>Add Finding</Button>
                        <Modal
                            title='Add Findings'
                            onCancel={() => this.setfindingsVisible(false)}
                            footer={null} visible={this.state.findingsModal}>
                            <FindingsForm repair={loadedRepair} loadFindings={this.loadFindings.bind(this)}
                                          close={() => this.setfindingsVisible(false)}/>
                        </Modal>
                    </div>
                );
            default:
                return (
                    <div>
                        {modifications.length === 0 ? '' :
                            (
                                <List size='small'
                                      bordered>
                                    {modifications.map(function (modification, index) {
                                        return items.map(function (item, index) {
                                            if (item.id === modification.item_used) {
                                                console.log('nice');
                                                return (
                                                    <List.Item>{modification.quantity} - {item.brand} {categories[item.category]}</List.Item>
                                                )
                                            }

                                        })
                                    })}
                                </List>
                            )}
                        <br/>
                        <Button type='dashed' onClick={() => this.setItemsVisible(true)}
                                style={{width: '100%'}}>Add Item</Button>
                        <Modal
                            title='Add Items' width={450}
                            onCancel={() => this.setItemsVisible(false)}
                            footer={null} visible={this.state.itemsModal}>
                            <AddItems repair={this.state.loadedRepair.id} loadItems={this.loadItems.bind(this)}
                                      close={() => this.setItemsVisible(false)}/>
                        </Modal>
                    </div>
                );
        }
    };

    forwardToOperations(id) {
        message.success("Forwarded to operations manager!");

        let data = {
            status: 'NS',
            type: '',
            suggested_degree: this.state.suggestion
        };

        putData('inventory/repair/update_status/' + id, data).then(data => {
            this.loadNewRepair(data.repair)
        });

        this.loadRepairs()
    }

    completeRepair(id) {
        message.success('Repair completed!');
        let data = {
            status: "C",
            type: ''
        };

        putData('inventory/repair/update_status/' + id, data).then(data => {
            this.loadNewRepair(data.repair)
        });
    }

    render() {
        const {repairs, loadedRepair, problems, findings, modifications} = this.state;
        const loadNewRepair = this.loadNewRepair;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 4},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 20},
            },
        };


        return (
            <div style={{padding: 10}}>
                <Row gutter={16}>
                    <Col span={8}>
                        <div style={div_style}
                             align='middle'>
                            {repairs.length === 0 ? (
                                <h2>There are no outstanding repairs</h2>
                            ) : (
                                <PerfectScrollbar>
                                    <List header={<h3>Repairs</h3>} bordered itemLayout='horizontal'>
                                        {repairs.map(function (repair, index) {
                                            return (
                                                <List.Item actions={[<Icon icon={ic_navigate_next}
                                                                           onClick={() => loadNewRepair(repair)}
                                                                           size={24}
                                                                           style={{verticalAlign: 'middle'}}/>]}>
                                                    <List.Item.Meta
                                                        avatar={<Icon icon={repair.status === 'NS' ?
                                                            ic_access_time : ic_loop}
                                                                      style={{color: '#E9C46A'}}
                                                                      size={24}/>}
                                                        title={<h4>Repair {repair.id} </h4>}
                                                        description={'Date requested ' + repair.date_requested}
                                                        align="left"/>
                                                </List.Item>
                                            )
                                        })}
                                    </List>
                                </PerfectScrollbar>
                            )}
                        </div>
                    </Col>
                    <Col span={16}>
                        <div style={div_style}>
                            {!loadedRepair ? (
                                <h2>Select a repair to load</h2>
                            ) : (
                                <PerfectScrollbar>
                                    <div align='left'>
                                        <h2>Repair: {loadedRepair.id}</h2>
                                        <h3>Shuttle {loadedRepair.shuttle}</h3>
                                        <p><i>Date Requested: {loadedRepair.date_requested}</i></p>
                                        {loadedRepair.start_date ? new Date() > loadedRepair.start_date && (
                                            <p><b>Start Date: </b> {loadedRepair.start_date}</p>
                                        ) : ""}
                                        {loadedRepair.status === 'FO' ? (
                                            <div>
                                                <Button type='primary' onClick={() => this.setOutsourcedVisible(true)}>
                                                    <Icon icon={ic_check} size={18}
                                                          style={{verticalAlign: 'middle'}}/> Complete Repair
                                                </Button>
                                                <Modal
                                                    title='Enter Repair Summary' width={600}
                                                    onCancel={() => this.setOutsourcedVisible(false)}
                                                    footer={null} visible={this.state.outsourceModal}>
                                                    <OutsourceForm close={() => this.setOutsourcedVisible(false)}
                                                                   unload={this.unloadRepair.bind(this)}
                                                                   repair={loadedRepair}/>
                                                </Modal>
                                            </div>
                                        ) : loadedRepair.status === 'IP' ? (
                                            <Button type='primary' onClick={() => this.completeRepair(loadedRepair.id)}>
                                                <Icon icon={ic_check} size={18}
                                                      style={{verticalAlign: 'middle'}}/> Complete Repair
                                            </Button>
                                        ) : loadedRepair.status === 'FI' ? (
                                            <div>
                                                <Form.Item label="Suggested Degree" {...formItemLayout}>
                                                    <Select style={{width: '20%'}} defaultValue="Minor" onSelect={e => this.setState({suggestion: e})}>
                                                        <Select.Option value="Minor">Minor</Select.Option>
                                                        <Select.Option value="Intermediate">Intermediate</Select.Option>
                                                        <Select.Option value="Major">Major</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                                <br/>
                                                <Button type='primary' htmlType="button"
                                                        onClick={() => this.forwardToOperations(loadedRepair.id)}>
                                                    Forward to Operation Manager
                                                </Button>
                                            </div>
                                        ) : loadedRepair.status === 'NS' ? (
                                            <Tag color="green">Forwarded to Operations manager</Tag>
                                        ) : loadedRepair.status === 'SR' && (
                                            <div>
                                                {new Date() < loadedRepair.schedule &&
                                                <Tag color='blue'> Schedule: {loadedRepair.schedule}</Tag>}
                                                <br/>
                                                {new Date(loadedRepair.schedule) < new Date() &&
                                                <Button type='primary'
                                                        onClick={() => this.completeRepair(loadedRepair.id)}>
                                                    <Icon icon={ic_check} size={18}
                                                          style={{verticalAlign: 'middle'}}/> Complete Repair
                                                </Button>
                                                }
                                            </div>
                                        )}
                                        <Menu onClick={this.handleClick} selectedKeys={[this.state.currentTab]}
                                              mode='horizontal'>
                                            <Menu.Item key={1}>
                                                Problems
                                            </Menu.Item>
                                            <Menu.Item key={2}>
                                                Findings
                                            </Menu.Item>
                                            {loadedRepair.status === "IP" ? (
                                                <Menu.Item key={3}>
                                                    Items Used
                                                </Menu.Item>
                                            ) : loadedRepair.status === 'SR' && (
                                                <Menu.Item key={3}>
                                                    Items Used
                                                </Menu.Item>
                                            )}
                                        </Menu>
                                        <br/>
                                        {this.renderCurrentPage()}
                                    </div>
                                </PerfectScrollbar>
                            )}
                        </div>
                    </Col>
                </Row>
            </div>
        )
    }
}
