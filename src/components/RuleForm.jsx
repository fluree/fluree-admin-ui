import React, { Component } from "react";
import {
  Tooltip,
  Form,
  FormGroup,
  FormControl,
  Col,
  Checkbox,
  OverlayTrigger,
  ButtonToolbar,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  DropdownButton,
  MenuItem,
} from "react-bootstrap";
import get from "lodash.get";
import Editor from "./PermissionsEditor";
import AddModal from "./AddModal";

class DeleteRule extends Component {
  state = {
    fullTransaction: [],
  };

  deleteRuleTransaction = (roleId, ruleId) => {
    return {
      _id: roleId,
      rules: [ruleId],
      _action: "delete",
    };
  };

  componentDidMount() {
    const transaction = this.deleteRuleTransaction(
      this.props.roleId,
      this.props.ruleId
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

class DeleteOp extends Component {
  state = {
    fullTransaction: [],
  };

  deleteOpTransaction = (ruleId, op) => {
    return {
      _id: ruleId,
      ops: [op],
      _action: "delete",
    };
  };

  componentDidMount() {
    const transaction = this.deleteOpTransaction(
      this.props.ruleId,
      this.props.op
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

class DeleteFunction extends Component {
  state = {
    fullTransaction: [],
  };

  deleteFunctionTransaction = (ruleId, funId) => {
    return {
      _id: ruleId,
      fns: [funId],
      _action: "delete",
    };
  };

  componentDidMount() {
    const transaction = this.deleteFunctionTransaction(
      this.props.ruleId,
      this.props.funId
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

class AddNewRule extends Component {
  state = {
    fullTransaction: [],
    originalFunctions: [],
    originalOps: [],
    fns: [],
    deleteFunction: null,
    showDeleteFunctionModal: false,
    showDeleteOpModal: false,
  };

  cleanOps = (initOps) => {
    let opsCleaned = [];
    let ops = JSON.stringify(initOps);
    if (ops.includes("query")) {
      opsCleaned.push("query");
    }
    if (ops.includes("transact")) {
      opsCleaned.push("transact");
    }
    if (ops.includes("token")) {
      opsCleaned.push("token");
    }
    if (ops.includes("logs")) {
      opsCleaned.push("logs");
    }
    if (ops.includes("all")) {
      opsCleaned.push("all");
    }
    return opsCleaned;
  };

  componentDidMount = () => {
    if (this.props.edit) {
      this.handleReceiveProps(this.props, [
        "_id",
        "id",
        "doc",
        "collection",
        "fns",
        "predicates",
        "errorMessage",
      ]);
    } else {
      const newState = {
        fullTransaction: [],
        id: "",
        doc: "",
        collection: "",
        predicates: "",
        fns: [],
        errorMessage: "",
      };
      this.setState(newState);
    }

    this.setState({ idChanged: false });
    this.props.ops
      ? this.setState({ ops: this.cleanOps(this.props.ops) }, () =>
          this.calculatedTransaction()
        )
      : this.setState({ ops: [] }, () => this.calculatedTransaction());
    this.props.ops
      ? this.setState({ originalOps: this.cleanOps(this.props.ops) }, () =>
          this.calculatedTransaction()
        )
      : this.setState({ originalOps: [] }, () => this.calculatedTransaction());
    this.props.collectionDefault
      ? this.setState({ collectionDefault: true }, () =>
          this.calculatedTransaction()
        )
      : this.setState({ collectionDefault: false }, () =>
          this.calculatedTransaction()
        );
  };

  onChangeKey = (key, event) => {
    let newState = {};
    newState[key] = event.target ? event.target.value : event;
    if (key === "id") {
      newState.idChanged = true;
      this.setState(newState, () => this.calculatedTransaction());
    } else {
      this.setState(newState, () => this.calculatedTransaction());
    }
  };

  onChangeOps = (event) => {
    const ops = event;
    let deleteOp = false;

    this.state.originalOps.forEach((op) => {
      if (!ops.includes(op)) {
        deleteOp = true;
        this.setState({ deleteOp: op, showDeleteOpModal: true });
      }
    });

    if (!deleteOp) {
      this.setState({ ops: event }, () => this.calculatedTransaction());
    }
  };

  onChangeCheckKey = (key, event) => {
    let newState = {};
    newState[key] = event.target.checked;
    this.setState(newState, () => this.calculatedTransaction());
  };

  tooltip = (
    <Tooltip id="tooltip">
      Checking this box will make this rule the default for this collection.
      Either use this or _rule/fns on a rule, but not both.
    </Tooltip>
  );

  handleReceiveProps = (nextProp, keys) => {
    let newState = {};
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] === "fns") {
        let fnArray = [];
        if (nextProp["fns"] !== undefined) {
          nextProp["fns"].forEach((fn, index) => {
            let fn_id = get(fn, "_id") || get(fn, [index, "_id"]);
            fnArray.push(fn_id);
          });
        }
        newState["fns"] = fnArray;
        newState["originalFunctions"] = fnArray;
      } else {
        newState[keys[i]] = get(nextProp, keys[i], "");
      }
    }
    this.setState(newState);
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.edit) {
      this.handleReceiveProps(nextProps, [
        "_id",
        "id",
        "doc",
        "collection",
        "predicates",
        "fns",
        "errorMessage",
      ]);
    } else {
      const newState = {
        fullTransaction: "",
        id: "",
        doc: "",
        collection: "",
        predicates: "",
        fns: [],
        originalFunctions: [],
        errorMessage: "",
      };
      this.setState(newState);
    }

    this.setState({ idChanged: false });
    nextProps.ops
      ? this.setState({ ops: this.cleanOps(nextProps.ops) }, () =>
          this.calculatedTransaction()
        )
      : this.setState({ ops: [] }, () => this.calculatedTransaction());
    nextProps.ops
      ? this.setState({ originalOps: this.cleanOps(nextProps.ops) }, () =>
          this.calculatedTransaction()
        )
      : this.setState({ originalOps: [] }, () => this.calculatedTransaction());
    nextProps.collectionDefault
      ? this.setState({ collectionDefault: true }, () =>
          this.calculatedTransaction()
        )
      : this.setState({ collectionDefault: false }, () =>
          this.calculatedTransaction()
        );
  }

  calculatedTransaction = () => {
    const transaction = {
      _id: this.state._id ? this.state._id : "_rule",
      doc: this.state.doc,
      ops: [...this.state.ops],
    };

    if (this.state.idChanged && this.props.id !== this.state.id) {
      transaction.id = this.state.id;
    }

    if (this.state.collectionDefault) {
      transaction.collectionDefault = true;
    } else {
      transaction.collectionDefault = false;
    }

    let predicates =
      this.state.predicates !== null && this.state.predicates !== ""
        ? String(this.state.predicates).split(",")
        : null;

    if (predicates !== null) {
      predicates = predicates.map(
        (predicate) => (predicate = predicate.trim())
      );
      transaction.predicates = predicates;
    }

    if (this.state.collection !== null && this.state.collection !== "") {
      transaction.collection = this.state.collection;
    }

    if (this.state.fns !== null) {
      transaction.fns = this.state.fns;
    }

    if (this.state.errorMessage !== null) {
      transaction.errorMessage = this.state.errorMessage;
    }

    this.setState({ fullTransaction: [transaction] });
  };

  addFunction(_id) {
    _id = Number(_id);
    let funArray = [...this.state.fns, _id];
    funArray = [...new Set(funArray)];
    this.setState({ fns: funArray }, () => this.calculatedTransaction());
  }

  removeFunction(_id) {
    _id = Number(_id);
    const fns = this.state.fns.slice();
    const index = fns.indexOf(_id);
    fns.splice(index, 1);

    if (this.state.originalFunctions.filter((fn) => fn === _id).length !== 0) {
      this.setState({ showDeleteFunctionModal: true, deleteFunction: _id });
    } else {
      this.setState({ fns: fns }, () => this.calculatedTransaction());
    }
  }

  handleFunctionClose() {
    this.setState({ showDeleteFunctionModal: false, deleteFunction: null });
  }

  handleOpClose() {
    this.setState({ showDeleteOpModal: false, deleteOp: null });
  }

  render() {
    const {
      edit,
      _id,
      _collection,
      fullRefresh,
      _db,
      _fn,
      handleClose,
    } = this.props;
    return (
      <div className="text-gray-light">
        {edit ? <h2 className="mb20">Edit Rule Details</h2> : null}
        {this.state.showDeleteFunctionModal ? (
          <AddModal
            ruleId={_id}
            funId={this.state.deleteFunction}
            _db={_db}
            fullRefresh={fullRefresh}
            show={this.state.showDeleteFunctionModal}
            handleClose={this.handleFunctionClose.bind(this)}
            component={"deleteFunction"}
          />
        ) : null}
        {this.state.showDeleteOpModal ? (
          <AddModal
            ruleId={_id}
            op={this.state.deleteOp}
            _db={_db}
            fullRefresh={fullRefresh}
            show={this.state.showDeleteOpModal}
            handleClose={this.handleOpClose.bind(this)}
            component={"deleteOp"}
          />
        ) : null}
        <Form
          horizontal
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <FormGroup controlId="ruleName">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-unlock bg-danger permission-icon-small mb10" />
              Rule ID (name):
            </Col>
            <Col componentClass="div" sm={7}>
              <FormGroup>
                <FormControl
                  type="text"
                  name="ruleId"
                  value={this.state.id}
                  placeholder="Rule ID (Name)"
                  onChange={(e) => this.onChangeKey("id", e)}
                />
              </FormGroup>
            </Col>
          </FormGroup>
          {edit ? (
            <FormGroup controlId="rule-id-display">
              <Col componentClass="div" className="text-left" sm={4}>
                <i className="fas fa-unlock bg-danger permission-icon-small mb10" />
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
          <FormGroup controlId="rule-doc-edit">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-unlock bg-danger permission-icon-small mb10" />
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
                  onChange={(e) => this.onChangeKey("doc", e)}
                />
              </FormGroup>
            </Col>
          </FormGroup>

          <FormGroup controlId="rule-collection-edit">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-unlock bg-danger permission-icon-small mb10" />
              Collection:
            </Col>
            <Col componentClass="div" sm={7}>
              <FormGroup>
                <FormControl
                  componentClass="select"
                  value={this.state.collection}
                  onChange={(e) => this.onChangeKey("collection", e)}
                >
                  <option value=""></option>
                  <option value="*">All Collections</option>
                  {_collection.map((collection) => {
                    return (
                      <option
                        key={get(collection, "_id")}
                        value={get(collection, "_collection/name")}
                      >
                        {get(collection, "_collection/name")}
                      </option>
                    );
                  })}
                </FormControl>
              </FormGroup>
              <FormGroup controlId="ruleCollectionDefault">
                {this.state.collection === undefined ||
                this.state.collection === "" ? null : (
                  <Checkbox
                    checked={this.state.collectionDefault}
                    onChange={(e) =>
                      this.onChangeCheckKey("collectionDefault", e)
                    }
                    className="text-left"
                  >
                    <OverlayTrigger placement="right" overlay={this.tooltip}>
                      <p>Default</p>
                    </OverlayTrigger>
                  </Checkbox>
                )}
              </FormGroup>
            </Col>
          </FormGroup>

          <FormGroup controlId="rule-predicates-edit">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-unlock bg-danger permission-icon-small mb10" />
              Predicates
            </Col>
            <Col componentClass="div" sm={7}>
              <FormGroup>
                <FormControl
                  type="text"
                  placeholder="Rule Predicates"
                  value={this.state.predicates}
                  disabled={
                    this.state.collectionDefault && this.state.collection !== ""
                  }
                  onChange={(e) => this.onChangeKey("predicates", e)}
                />
              </FormGroup>
            </Col>
            <Col componentClass="div" className="text-left" sm={4} />
            <Col componentClass="div" className="text-left" sm={7}>
              <p>Separate each predicate with a comma.</p>
            </Col>
          </FormGroup>
          <FormGroup controlId="ruleFunction">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-unlock bg-danger permission-icon-small mb10" />
              Function
            </Col>
            <Col componentClass="div" sm={7}>
              <FormGroup className="text-left">
                <div
                  className="border-dashed-light-gray pt10"
                  style={{ minHeight: "45px", marginBottom: "5px" }}
                >
                  {_fn
                    ? _fn.map((fn) => {
                        let fnName = get(fn, "_fn/name", "No Name");
                        fnName = fnName === "" ? "No Name" : fnName;
                        let fn_id = get(fn, "_id");
                        let fnDoc = get(fn, "_fn/doc", "No doc");
                        fnDoc = fnDoc === "" ? "No doc" : fnDoc;
                        return (
                          <OverlayTrigger
                            key={String(fn_id).concat("overlay")}
                            placement="top"
                            overlay={
                              <Tooltip
                                key={String(fn_id).concat("tooltip")}
                                id={fn_id}
                              >
                                {fnDoc}
                              </Tooltip>
                            }
                          >
                            <Button
                              key={String(fn_id).concat("button")}
                              className="mb10"
                              bsStyle="warning"
                              value={fn_id}
                              style={{
                                marginLeft: "5px",
                                display: this.state.fns.includes(fn_id)
                                  ? null
                                  : "none",
                              }}
                              onClick={() => this.removeFunction(fn_id)}
                            >
                              {fnName}&nbsp;&nbsp;
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
                    title="Add a Function"
                    id="predicate-selection-dropdown"
                    style={{ marginLeft: "5px" }}
                  >
                    {_fn
                      ? _fn.map((fn) => {
                          let fnName = get(fn, "_fn/name", "No Name");
                          fnName = fnName === "" ? "No Name" : fnName;
                          let fn_id = get(fn, "_id");
                          let fnDoc = get(fn, "_fn/doc", "No doc");
                          fnDoc = fnDoc === "" ? "No doc" : fnDoc;
                          return (
                            <MenuItem
                              key={fnName}
                              value={fn_id}
                              onClick={() => {
                                console.log("you need to add new function");
                                this.addFunction(fn_id);
                              }}
                            >
                              {fnName}: {fnDoc}
                            </MenuItem>
                          );
                        })
                      : null}
                    {!_fn || _fn.length === 0 ? (
                      <MenuItem>No Functions</MenuItem>
                    ) : null}
                    <AddModal
                      component={"addFunction"}
                      _db={_db}
                      fullRefresh={fullRefresh}
                      handleClose={handleClose}
                    />
                  </DropdownButton>
                </FormGroup>
              </Col>
            </FormGroup>
          </FormGroup>
          <FormGroup controlId="rule-ops-edit">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-unlock bg-danger permission-icon-small mb10" />
              Ops
            </Col>
            <Col componentClass="div" sm={7}>
              <FormGroup>
                <ButtonToolbar>
                  <ToggleButtonGroup
                    key={this.state.ops ? "loaded" : "notLoaded"}
                    onChange={(e) => this.onChangeOps(e)}
                    type="checkbox"
                    name="ruleOps"
                    value={this.state.ops}
                  >
                    <ToggleButton value="query">Query</ToggleButton>
                    <ToggleButton value="transact">Transact</ToggleButton>
                    <ToggleButton value="token">Token</ToggleButton>
                    <ToggleButton value="logs">Logs</ToggleButton>
                    <ToggleButton value="all">All</ToggleButton>
                  </ToggleButtonGroup>
                </ButtonToolbar>
              </FormGroup>
            </Col>
          </FormGroup>

          <FormGroup controlId="rule-error-message-edit">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-unlock bg-danger permission-icon-small mb10" />
              Error Message
            </Col>
            <Col componentClass="div" sm={7}>
              <FormGroup>
                <FormControl
                  type="text"
                  value={this.state.errorMessage}
                  onChange={(e) => this.onChangeKey("errorMessage", e)}
                />
              </FormGroup>
            </Col>
          </FormGroup>
          <Editor
            value={this.state.fullTransaction}
            _db={_db}
            fullRefresh={fullRefresh}
          />
        </Form>
      </div>
    );
  }
}

export { AddNewRule, DeleteRule, DeleteOp, DeleteFunction };
