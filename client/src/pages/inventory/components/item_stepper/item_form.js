/**
 * Created by Not Jason Deniega on 28/06/2018.
 */
import React, { Component } from "react";
import "../../../../utilities/colorsFonts.css";
import {
  Form,
  Input,
  Button,
  message,
  InputNumber,
  Checkbox,
  Upload,
  Icon
} from "antd";
import "./style.css";
import { postDataWithImage } from "../../../../network_requests/general";

const FormItem = Form.Item;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class ExtendedForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      consumable: false,
      receipt: null
    };
  }

  toggleChecked = () => {
    this.setState({ consumable: !this.state.consumable });
  };

  componentDidMount() {
    this.props.form.validateFields();
  }

  handleFileChange = e => {
    this.setState({
      receipt: e.target.files[0]
    });

    console.log(this.state.receipt);
  };

  handleSubmit(e) {
    e.preventDefault();

    let data = {
      name: this.props.name.value,
      description: this.props.description.value,
      brand: this.props.brand.value,
      quantity: this.props.quantity.value,
      average_price: this.props.unit_price.value,
      consumable: this.state.consumable,
      vendor: this.props.vendor.value,
      unit_price: this.props.unit_price.value,
      receipt: this.state.receipt
    };

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value));

   postDataWithImage("inventory/items/", formData).then(data => {
      if (!data.error) {
        message.success(data.item_name + " was added");
      } else {
        console.log(data.error);
      }
    });
    this.props.handleOk();
  }

  render() {
    const {
      getFieldDecorator,
      getFieldsError,
      getFieldError,
      isFieldTouched
    } = this.props.form;
    const nameError = isFieldTouched("name") && getFieldError("name");
    const descriptionError =
      isFieldTouched("description") && getFieldError("description");
    const brandError = isFieldTouched("brand") && getFieldError("brand");
    const vendorError = isFieldTouched("vendor") && getFieldError("vendor");
    const unitpriceError =
      isFieldTouched("unit_price") && getFieldError("unit_price");
    const quantityError =
      isFieldTouched("quantity") && getFieldError("quantity");

    return (
      <div className="item-form">
        <Form
          hideRequiredMark={true}
          onChange={this.handleFormChange}
          onSubmit={this.handleSubmit}
        >
          <FormItem
            label="Item Name"
            className="item-name-label"
            validateStatus={nameError ? "error" : ""}
            help={nameError || ""}
          >
            {getFieldDecorator("name", {
              rules: [
                {
                  required: true,
                  message: "Please input name"
                }
              ]
            })(
              <Input
                autoFocus="true"
                className="item-name"
                type="text"
                placeholder="Item Name"
              />
            )}
          </FormItem>
          <FormItem
            label="Item Description"
            className="item-description-label"
            validateStatus={descriptionError ? "error" : ""}
            help={descriptionError || ""}
          >
            {getFieldDecorator("description", {
              rules: [
                {
                  required: true,
                  message: "Please input description"
                }
              ]
            })(
              <Input
                className="item-name"
                type="text"
                placeholder="Item Description"
              />
            )}
          </FormItem>
          <FormItem
            className="brand-label"
            label="Brand"
            validateStatus={brandError ? "error" : ""}
            help={brandError || ""}
          >
            {getFieldDecorator("brand", {
              rules: [
                {
                  required: true,
                  message: "Please input brand"
                }
              ]
            })(<Input className="brand" type="text" placeholder="Brand" />)}
          </FormItem>
          <FormItem
            className="vendor-label"
            label="Vendor"
            validateStatus={vendorError ? "error" : ""}
            help={vendorError || ""}
          >
            {getFieldDecorator("vendor", {
              rules: [
                {
                  required: true,
                  message: "Please input vendor"
                }
              ]
            })(<Input className="vendor" type="text" placeholder="Vendor" />)}
          </FormItem>
          <FormItem
            className="unit-price-label"
            label="Unit Price"
            validateStatus={unitpriceError ? "error" : ""}
            help={unitpriceError || ""}
          >
            {getFieldDecorator("unit_price", {
              rules: [
                {
                  required: true,
                  message: "Please input unit price"
                }
              ]
            })(
              <InputNumber
                className="unit_price"
                type="text"
                placeholder="Unit Price"
                formatter={value =>
                  `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={value => value.replace(/₱\s?|(,*)/g, "")}
              />
            )}
          </FormItem>
          <FormItem
            className="quantity-label"
            label="Initial Quantity"
            validateStatus={quantityError ? "error" : ""}
            help={quantityError || ""}
          >
            {getFieldDecorator("quantity", {
              rules: [
                {
                  required: true,
                  message: "Please input quantity"
                }
              ]
            })(
              <InputNumber
                className="quantity"
                type="text"
                placeholder="Initial Quantity"
                formatter={value =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            )}
          </FormItem>
          <FormItem className="receipt" label="Receipt">
            <Input
              type="file"
              placeholder="select image"
              onChange={this.handleFileChange}
            />
          </FormItem>
          <FormItem className="consumable-label">
            {getFieldDecorator("consumable", {
              valuePropName: "checked"
            })(
              <Checkbox className="consumable" onChange={this.toggleChecked}>
                Consumable
              </Checkbox>
            )}
          </FormItem>
          <FormItem>
            <Button
              type="primary"
              htmlType="submit"
              className="item_submit"
              disabled={hasErrors(getFieldsError())}
            >
              Submit
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

const WrappedItemForm = Form.create({
  onFieldsChange(props, changedFields) {
    props.onChange(changedFields);
  },
  mapPropsToFields(props) {
    return {
      name: Form.createFormField({
        ...props.name,
        value: props.name.value
      }),
      description: Form.createFormField({
        ...props.description,
        value: props.description.value
      }),
      brand: Form.createFormField({
        ...props.brand,
        value: props.brand.value
      }),
      vendor: Form.createFormField({
        ...props.vendor,
        value: props.vendor.value
      }),
      unit_price: Form.createFormField({
        ...props.unit_price,
        value: props.unit_price.value
      }),
      quantity: Form.createFormField({
        ...props.quantity,
        value: props.quantity.value
      }),
      consumable: Form.createFormField({
        ...props.consumable,
        value: props.consumable.value
      })
    };
  }
})(ExtendedForm);

export class ItemForm extends Component {
  state = {
    formLayout: "vertical",
    fields: {
      name: {
        value: ""
      },
      description: {
        value: ""
      },
      brand: {
        value: ""
      },
      vendor: {
        value: ""
      },
      unit_price: {
        value: ""
      },
      quantity: {
        value: ""
      },
      consumable: {
        value: ""
      }
    }
  };

  handleFormChange = changedFields => {
    this.setState(({ fields }) => ({
      fields: { ...fields, ...changedFields }
    }));
  };

  handleOk = () => {
    this.props.handleOk();
  };

  render() {
    const fields = this.state.fields;
    return (
      <div>
        <WrappedItemForm
          {...fields}
          onChange={this.handleFormChange}
          handleOk={this.handleOk}
        />
      </div>
    );
  }
}
