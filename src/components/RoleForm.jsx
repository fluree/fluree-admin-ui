import React, { Component } from "react";
import {
  Form,
  FormGroup,
  Col,
  FormControl,
  Button,
  DropdownButton,
  MenuItem,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import get from "lodash.get";
import AddModal from "./AddModal";
import Editor from "./PermissionsEditor";

class DeleteRole extends Component {
  state = {
    fullTransaction: [],
  };

  deleteRolesTransaction = (parentId, roleId) => {
    return {
      _id: parentId,
      roles: [roleId],
      _action: "delete",
    };
  };

  componentDidMount() {
   
    const transaction = this.deleteRolesTransaction(
      this.props.parentId,
      this.props.roleId
    );
    this.setState({ fullTransaction: [transaction] });
  }

  render() {
    let { handleClose, _db, fullRefresh } = this.props;
    return (
      <Editor
        value={this.state.fullTransaction}
        handleClose={handleClose}
        _db={_db}
        fullRefresh={fullRefresh}
      />
    );
  }
}

class AddNewRole extends Component {
  state = {
    id: "",
    doc: "",
    rules: [],
    originalRules: [],
    deleteRule: null,
    fullTransaction: [],
    showDeleteRuleModal: false,
  };

  onChangeID = (e) => {
    this.setState({ id: e.target.value, idChanged: true }, () =>
      this.calculatedTransaction()
    );
  };
  onChangeDoc = (e) => {
    this.setState({ doc: e.target.value }, () => this.calculatedTransaction());
  };

  resetForm = (props) => {
    let id = "";
    if (props.id) {
      id = props.id;
    }

    let doc = "";
    if (props.doc) {
      doc = props.doc;
    }

    const roleRulesArray = [];
    if (props.roleRules !== undefined) {
      props.roleRules.forEach((rule) => {
        roleRulesArray.push(get(rule, "_id"));
      });
    }

    this.setState(
      {
        id: id,
        idChanged: false,
        doc: doc,
        originalRules: roleRulesArray,
        rules: roleRulesArray,
        deleteRule: null,
        showDeleteRuleModal: false,
      },
      () => this.calculatedTransaction()
    );
  };

  componentDidMount() {
    this.resetForm(this.props);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.resetForm(nextProps);
  }

  removeRule(_id) {
    _id = Number(_id);
    const rules = this.state.rules.slice();
    const index = rules.indexOf(_id);
    rules.splice(index, 1);

    if (this.state.originalRules.filter((rule) => rule === _id).length !== 0) {
      this.setState({ showDeleteRuleModal: true, deleteRule: _id });
    } else {
      this.setState({ rules: rules }, () => this.calculatedTransaction());
    }
  }

  addRule(_id) {
    _id = Number(_id);
    let rulesArray = [...this.state.rules, _id];
    rulesArray = [...new Set(rulesArray)];
    this.setState({ rules: rulesArray }, () => this.calculatedTransaction());
  }

  handleClose = () => {
    this.setState({ showDeleteRuleModal: false });
  };

  calculatedTransaction = () => {
    let transaction = {
      _id: this.props._id ? this.props._id : "_role",
      doc: this.state.doc ? this.state.doc : "",
      rules: [...this.state.rules],
    };

    if (this.state.idChanged && this.props.id !== this.state.id) {
      transaction.id = this.state.id;
    }

    this.setState({ fullTransaction: [transaction] });
  };

  render() {
    const {
      _id,
      rules,
      transact,
      handleClose,
      edit,
      fullRefresh,
      _collection,
      _db,
      nestedRules,
      _fn,
    } = this.props;

    return (
      <div className="text-gray-light">
        {this.state.showDeleteRuleModal ? (
          <AddModal
            roleId={_id}
            ruleId={this.state.deleteRule}
            _db={_db}
            fullRefresh={fullRefresh}
            show={this.state.showDeleteRuleModal}
            handleClose={this.handleClose}
            component={"deleteRule"}
          />
        ) : null}
        <h2 className="mb20">Edit Role Details</h2>
        <Form horizontal onSubmit={(e) => e.preventDefault()}>
          <FormGroup controlId="role-name-edit">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-wrench bg-primary permission-icon-small mb10" />
              Role ID (name):
            </Col>
            <Col componentClass="div" sm={7}>
              <FormGroup>
                <FormControl
                  type="text"
                  name="roleId"
                  value={this.state.id}
                  placeholder="Role ID (Name)"
                  onChange={(e) => this.onChangeID(e)}
                />
              </FormGroup>
            </Col>
          </FormGroup>
          {edit ? (
            <FormGroup controlId="role-id-display">
              <Col componentClass="div" className="text-left" sm={4}>
                <i className="fas fa-wrench bg-primary permission-icon-small mb10" />
                _id:
              </Col>
              <Col
                componentClass="div"
                sm={7}
                style={{
                  border: "1px solid lightgrey",
                  borderRadius: "3px",
                  width: "160px",
                  height: "39px",
                  padding: "9px 12px",
                }}
              >
                {_id}
              </Col>
            </FormGroup>
          ) : null}
          <FormGroup controlId="role-doc-edit">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-wrench bg-primary permission-icon-small mb10" />
              Doc:
            </Col>
            <Col componentClass="div" sm={7}>
              <FormGroup>
                <FormControl
                  className="xs-90"
                  componentClass="textarea"
                  name="roleDoc"
                  value={this.state.doc}
                  placeholder="Doc"
                  onChange={(e) => this.onChangeDoc(e)}
                />
              </FormGroup>
            </Col>
          </FormGroup>
          <FormGroup controlId="roleRules">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-wrench bg-primary permission-icon-small mb10" />
              Rules
            </Col>
            <Col componentClass="div" sm={7}>
              <FormGroup className="text-left">
                <div
                  className="border-dashed-light-gray pt10"
                  style={{ minHeight: "45px", marginBottom: "5px" }}
                >
                  {rules
                    ? rules.map((rule) => {
                        let ruleId = get(rule, "_rule/id", "No _rule/Id");
                        ruleId = ruleId === "" ? "No id" : ruleId;
                        let rule_id = get(rule, "_id");
                        let doc = get(rule, "_rule/doc", "No documentation");
                        doc = doc === "" ? "No documentation" : doc;
                        return (
                          <OverlayTrigger
                            key={String(rule._id).concat("overlay")}
                            placement="top"
                            overlay={
                              <Tooltip
                                key={String(rule._id).concat("tooltip")}
                                id={get(rule, "_id")}
                              >
                                {doc}
                              </Tooltip>
                            }
                          >
                            <Button
                              key={String(rule._id).concat("button")}
                              className="mb10"
                              bsStyle="danger"
                              value={rule_id}
                              style={{
                                marginLeft: "5px",
                                display: this.state.rules.includes(rule_id)
                                  ? null
                                  : "none",
                              }}
                              onClick={() => this.removeRule(rule_id)}
                            >
                              {ruleId}&nbsp;&nbsp;
                              <i className="fas fa-times" />
                            </Button>
                          </OverlayTrigger>
                        );
                      })
                    : null}
                </div>
              </FormGroup>
            </Col>
            <FormGroup>
              <Col sm={4} />
              <Col sm={7}>
                <FormGroup className="text-left">
                  <DropdownButton
                    title="Add a Rule"
                    id="rule-selection-dropdown"
                    style={{ marginLeft: "5px" }}
                  >
                    {rules
                      ? rules.map((rule) => {
                          let ruleId = get(rule, "_rule/id", "No id");
                          ruleId = ruleId === "" ? "No id" : ruleId;

                          let ruleDoc = get(rule, "_rule/doc", "No doc");
                          ruleDoc = ruleDoc === "" ? "No doc" : ruleDoc;
                          return (
                            <MenuItem
                              key={get(rule, "_id")}
                              value={get(rule, "_id")}
                              onClick={() => {
                                this.addRule(get(rule, "_id"));
                              }}
                            >
                              {ruleId}: {ruleDoc}
                            </MenuItem>
                          );
                        })
                      : null}
                    {!rules || rules.length === 0 ? (
                      <MenuItem>No Rules</MenuItem>
                    ) : null}
                    {nestedRules ? null : (
                      <AddModal
                        _collection={_collection}
                        component={"addRule"}
                        _fn={_fn}
                        _db={_db}
                        fullRefresh={fullRefresh}
                        transact={transact}
                        handleClose={handleClose}
                      />
                    )}
                  </DropdownButton>
                </FormGroup>
              </Col>
            </FormGroup>
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

export { AddNewRole, DeleteRole };
