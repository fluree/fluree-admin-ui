import React, { Component } from "react";
import { MenuItem, Modal, Alert } from "react-bootstrap";
import { AddNewRole, DeleteRole } from "./RoleForm";
import { AddNewAuth, DeleteAuth, DeleteAuthority } from "./AuthForm";
import { AddNewRule, DeleteRule, DeleteFunction, DeleteOp } from "./RuleForm";
import { AddNewFunction } from "./FunctionForm";
import AddNewUser from "./UserForm";

class AddModal extends Component {
  state = {
    show:
      this.props.component === "deleteRole" ||
      this.props.component === "deleteAuth" ||
      this.props.component === "deleteAuthority" ||
      this.props.component === "deleteFunction" ||
      this.props.component === "deleteOp"
        ? true
        : false,
  };

  handleClose = () => {
    this.props.handleClose
      ? this.props.handleClose()
      : this.setState({ show: false });
  };

  handleShow = () => {
    this.setState({ show: true });
  };

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.component === "deleteRole" ||
      nextProps.component === "deleteAuth" ||
      this.props.component === "deleteAuthority" ||
      nextProps.component === "deleteRule" ||
      nextProps.component === "deleteFunction" ||
      nextProps.component === "deleteOp"
    ) {
      this.setState({ show: nextProps.show });
    }
  }

  render() {
    return (
      <div>
        {this.props.component === "deleteRole" ||
        this.props.component === "deleteAuth" ||
        this.props.component === "deleteAuthority" ||
        this.props.component === "deleteRule" ||
        this.props.component === "deleteFunction" ||
        this.props.component === "deleteOp" ? null : (
          <MenuItem
            style={{
              display: "block",
              padding: "3px 20px",
              clear: "both",
              fontWeight: "normal",
              lineHeight: "1.3333333",
              whiteSpace: "nowrap",
            }}
            onClick={() => {
              this.handleShow();
              this.props.setValueFromTnx("");
            }}
          >
            {(() => {
              switch (this.props.component) {
                case "addRole":
                  return "Create New Role";
                case "addAuth":
                  return "Create New Auth Record";
                case "addRule":
                  return "Create New Rule";
                case "addFunction":
                  return "Create New Function";
                default:
                  return "Create New User";
              }
            })()}
          </MenuItem>
        )}
        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: "20px", fontWeight: "lighter" }}>
              <i
                className={(() => {
                  switch (this.props.component) {
                    case "addRole":
                      return "fas fa-wrench";
                    case "addAuth":
                      return "fas fa-chess-queen";
                    case "addRule":
                      return "fas fa-unlock";
                    case "addFunction":
                      return "fas fa-code";
                    case "deleteRole":
                      return "fas fa-wrench";
                    case "deleteRule":
                      return "fas fa-unlock";
                    case "deleteAuth":
                      return "fas fa-chess-queen";
                    case "deleteAuthority":
                      return "fas fa-chess-queen";
                    case "deleteFunction":
                      return "fas fa-code";
                    case "deleteOp":
                      return "fas fa-clipdoard-list";
                    default:
                      return "fas fa-user";
                  }
                })()}
              />{" "}
              &nbsp;
              {(() => {
                switch (this.props.component) {
                  case "addRole":
                    return "Create Role";
                  case "addAuth":
                    return "Create New Auth Record";
                  case "addRule":
                    return "Create New Rule";
                  case "addFunction":
                    return "Create New Function";
                  case "deleteRole":
                    return "Delete Role";
                  case "deleteRule":
                    return "Delete Rule";
                  case "deleteAuth":
                    return "Delete Auth";
                  case "deleteAuthority":
                    return "Delete Auth";
                  case "deleteFunction":
                    return "Delete Function";
                  case "deleteOp":
                    return "Delete Op";
                  default:
                    return "Create New User";
                }
              })()}
              <hr style={{ marginBottom: "0px" }} />
            </Modal.Title>
            {this.props.component === "addRule" ? (
              <div style={{ padding: "20px 0 0 20px" }}>
                To learn more about rules and rule predicates, refer to the{" "}
                <a
                  href="https://docs.flur.ee/#defining-rules"
                  rel="noopener noreferrer"
                  target="_blank"
                  style={{ color: "#d42c7f" }}
                >
                  <strong>docs.</strong>
                </a>
              </div>
            ) : null}
            {this.props.component === "deleteRole" ||
            this.props.component === "deleteAuth" ||
            this.props.component === "deleteAuthority" ||
            this.props.component === "deleteRule" ||
            this.props.component === "deleteFun" ||
            this.props.component === "deleteOp" ? (
              <Alert bsStyle="info">
                If you would like to both update and delete an subject in a
                record, you must perform each of those transactions separately.
              </Alert>
            ) : null}
          </Modal.Header>
          <Modal.Body>
            {(() => {
              switch (this.props.component) {
                case "addRole":
                  return (
                    <AddNewRole
                      {...this.props}
                      handleClose={this.handleClose}
                    />
                  );
                case "addAuth":
                  return (
                    <AddNewAuth
                      {...this.props}
                      handleClose={this.handleClose}
                    />
                  );
                case "addRule":
                  return (
                    <AddNewRule
                      {...this.props}
                      handleClose={this.handleClose}
                    />
                  );
                case "addFunction":
                  return (
                    <AddNewFunction
                      {...this.props}
                      handleClose={this.handleClose}
                    />
                  );
                case "deleteAuth":
                  return (
                    <DeleteAuth
                      {...this.props}
                      handleClose={this.handleClose}
                    />
                  );
                case "deleteAuthority":
                  return (
                    <DeleteAuthority
                      {...this.props}
                      handleClose={this.handleClose}
                    />
                  );
                case "deleteRole":
                  return (
                    <DeleteRole
                      {...this.props}
                      handleClose={this.handleClose}
                    />
                  );
                case "deleteRule":
                  return (
                    <DeleteRule
                      {...this.props}
                      handleClose={this.handleClose}
                    />
                  );
                case "deleteFunction":
                  return (
                    <DeleteFunction
                      {...this.props}
                      handleClose={this.handleClose}
                    />
                  );
                case "deleteOp":
                  return (
                    <DeleteOp {...this.props} handleClose={this.handleClose} />
                  );
                default:
                  return (
                    <AddNewUser
                      {...this.props}
                      handleClose={this.handleClose}
                    />
                  );
              }
            })()}
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default AddModal;
