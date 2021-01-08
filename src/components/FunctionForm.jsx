import React, { Component } from "react";
import { Form, FormGroup, Col, FormControl } from "react-bootstrap";
import Editor from "./PermissionsEditor";

class AddNewFunction extends Component {
  state = {
    name: "",
    params: null,
    code: "",
    doc: "",
    spec: "",
    language: "",
  };

  onChangeValue(key, value) {
    const newState = {};
    newState[key] = value;
    this.setState(newState, () => this.calculatedTransaction());
  }

  resetForm = () => {
    this.setState({
      name: "",
      params: null,
      code: "",
      doc: "",
      spec: "",
      language: "",
    });
  };

  componentDidMount() {
    this.resetForm();
  }

  calculatedTransaction = () => {
    let transaction = {
      _id: "_fn",
      name: this.state.name ? this.state.name : "",
      doc: this.state.doc ? this.state.doc : "",
      code: this.state.code ? this.state.code : "",
      spec: this.state.spec ? this.state.spec : "",
      language: this.state.language ? this.state.language : "",
    };
    if (this.state.params !== null) {
      transaction.params = this.state.params.split(",");
    }

    this.setState({ fullTransaction: [transaction] });
  };

  handleClose = () => {
    this.setState({ showDeleteRoleModal: false });
  };

  render() {
    const { handleClose, fullRefresh, _db } = this.props;
    return (
      <div className="text-gray-light">
        <h2 className="mb20">Create New Function</h2>
        <Form horizontal onSubmit={(e) => e.preventDefault()}>
          <FormGroup controlId="auth-id-edit">
            <Col componentClass="div" sm={4} className="text-left">
              <i className="fas fa-code bg-success permission-icon-small mb10" />
              Name:
            </Col>
            <Col sm={7}>
              <FormGroup>
                <FormControl
                  type="text"
                  name="functionName"
                  value={this.state.name}
                  placeholder="Function Name"
                  onChange={(e) => this.onChangeValue("name", e.target.value)}
                />
              </FormGroup>
            </Col>
          </FormGroup>

          <FormGroup controlId="function-doc">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-code bg-success permission-icon-small mb10" />
              Doc:
            </Col>
            <Col sm={7}>
              <FormGroup>
                <FormControl
                  className="xs-90"
                  componentClass="textarea"
                  name="functionDoc"
                  value={this.state.doc}
                  placeholder="Doc"
                  onChange={(e) => this.onChangeValue("doc", e.target.value)}
                />
              </FormGroup>
            </Col>
          </FormGroup>

          <FormGroup controlId="function-code">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-code bg-success permission-icon-small mb10" />
              Code:
            </Col>
            <Col sm={7}>
              <FormGroup>
                <FormControl
                  className="xs-90"
                  componentClass="textarea"
                  name="functionCode"
                  value={this.state.code}
                  placeholder="Code"
                  onChange={(e) => this.onChangeValue("code", e.target.value)}
                />
              </FormGroup>
            </Col>
          </FormGroup>

          <FormGroup controlId="function-params">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-code bg-success permission-icon-small mb10" />
              Params:
            </Col>
            <Col sm={7}>
              <FormGroup>
                <FormControl
                  className="xs-90"
                  componentClass="textarea"
                  name="functionParams"
                  value={this.state.params}
                  placeholder="Params"
                  onChange={(e) => this.onChangeValue("params", e.target.value)}
                />
              </FormGroup>
            </Col>
            <FormGroup>
              <Col sm={4} />
              <Col sm={7}></Col>
            </FormGroup>
          </FormGroup>

          <FormGroup controlId="function-language">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-code bg-success permission-icon-small mb10" />
              Language:
            </Col>
            <Col sm={7}>
              <FormGroup>
                <FormControl
                  className="xs-90"
                  componentClass="textarea"
                  name="functionCode"
                  value={this.state.language}
                  placeholder="Language"
                  onChange={(e) =>
                    this.onChangeValue("language", e.target.value)
                  }
                />
              </FormGroup>
            </Col>
          </FormGroup>

          <Editor
            value={this.state.fullTransaction}
            _db={_db}
            handleClose={handleClose}
            fullRefresh={fullRefresh}
          />
        </Form>
      </div>
    );
  }
}

export { AddNewFunction };
