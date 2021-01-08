import React, { Component } from "react";
import {
  Form,
  FormGroup,
  Col,
  FormControl,
  OverlayTrigger,
  Button,
  Tooltip,
  DropdownButton,
  MenuItem,
} from "react-bootstrap";
import get from "lodash.get";
import AddModal from "./AddModal";
import Editor from "./PermissionsEditor";

class DeleteAuth extends Component {
  state = {
    fullTransaction: [],
  };

  deleteAuthTransaction = (userId, authId) => {
    return {
      _id: userId,
      auth: [authId],
      _action: "delete",
    };
  };

  componentDidMount() {
    const transaction = this.deleteAuthTransaction(
      this.props.userId,
      this.props.authId
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

class DeleteAuthority extends Component {
  state = {
    fullTransaction: [],
  };

  deleteAuthorityTransaction = (authId, authorityId) => {
    return {
      _id: authId,
      authority: [authorityId],
      _action: "delete",
    };
  };

  componentDidMount() {
    const transaction = this.deleteAuthorityTransaction(
      this.props.authId,
      this.props.authorityId
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

class AddNewAuth extends Component {
  state = {
    id: "",
    doc: "",
    roles: [],
    authority: [],
    originalRoles: [],
    deleteRole: null,
    originalAuthority: [],
    deleteAuthority: null,
    fullTransaction: [],
    showDeleteRoleModal: false,
    showDeleteAuthorityModal: false,
  };

  onChangeId = (e) => {
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

    const authRoleArray = [];
    if (props.authRoles !== undefined) {
      props.authRoles.forEach((role) => {
        authRoleArray.push(get(role, "_id"));
      });
    }

    const authAuthorityArray = [];
    if (props.authAuthority !== undefined) {
      props.authAuthority.forEach((authority) => {
        authAuthorityArray.push(get(authority, "_id"));
      });
    }

    this.setState(
      {
        id: id,
        idChanged: false,
        doc: doc,
        originalRoles: authRoleArray,
        originalAuthority: authAuthorityArray,
        showDeleteRoleModal: false,
        showDeleteAuthorityModal: false,
        roles: authRoleArray,
        authority: authAuthorityArray,
        deleteRole: null,
        deleteAuthority: null,
      },
      () => this.calculatedTransaction()
    );
  };

  componentDidMount() {
    this.resetForm(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.resetForm(nextProps);
  }

  removeRole(_id) {
    _id = Number(_id);
    const roles = this.state.roles.slice();
    const index = roles.indexOf(_id);
    roles.splice(index, 1);

    // We created state.originalRoles, which only has the _ids of the valid roles that belong to a given user
    if (this.state.originalRoles.filter((role) => role === _id).length !== 0) {
      this.setState({ showDeleteRoleModal: true, deleteRole: _id });
    } else {
      this.setState({ roles: roles }, () => this.calculatedTransaction());
    }
  }

  addRole(_id) {
    _id = Number(_id);
    let rolesArray = [...this.state.roles, _id];
    rolesArray = [...new Set(rolesArray)];
    this.setState({ roles: rolesArray }, () => this.calculatedTransaction());
  }

  removeAuthority(_id) {
    _id = Number(_id);
    const authority = this.state.authority.slice();
    const index = authority.indexOf(_id);
    authority.splice(index, 1);

    // We created state.originalAuth, which only has the _ids of the valid authority that belong to a given auth
    if (
      this.state.originalAuthority.filter((authority) => authority === _id)
        .length !== 0
    ) {
      this.setState({ showDeleteAuthorityModal: true, deleteAuthority: _id });
    } else {
      this.setState({ authority: authority }, () =>
        this.calculatedTransaction()
      );
    }
  }

  addAuthority(_id) {
    _id = Number(_id);
    let authorityArray = [...this.state.authority, _id];
    authorityArray = [...new Set(authorityArray)];
    this.setState({ authority: authorityArray }, () =>
      this.calculatedTransaction()
    );
  }

  calculatedTransaction = () => {
    let transaction = {
      _id: this.props._id ? this.props._id : "_auth",
      doc: this.state.doc ? this.state.doc : "",
      roles: [...this.state.roles],
      authority: [...this.state.authority],
    };

    if (this.state.idChanged && this.props.id !== this.state.id) {
      transaction.id = this.state.id;
    }
    this.setState({ fullTransaction: [transaction] });
  };

  handleClose = () => {
    this.setState({ showDeleteRoleModal: false });
  };

  render() {
    const {
      _id,
      edit,
      user,
      roles,
      rules,
      auth,
      transact,
      handleClose,
      fullRefresh,
      nestedRoles,
      _db,
    } = this.props;
    const username =
      user && user.length > 0
        ? user["_user/username"] ||
          user[0]["_user/username"] ||
          "No user currently associated with this auth record"
        : "No user currently associated with this auth record";
    return (
      <div className="text-gray-light">
        {this.state.showDeleteRoleModal ? (
          <AddModal
            roleId={this.state.deleteRole}
            parentId={_id}
            _db={_db}
            fullRefresh={fullRefresh}
            show={this.state.showDeleteRoleModal}
            handleClose={this.handleClose}
            component={"deleteRole"}
          />
        ) : null}
        {this.state.showDeleteAuthorityModal ? (
          <AddModal
            authId={_id}
            authorityId={this.state.deleteAuthority}
            _db={_db}
            fullRefresh={fullRefresh}
            show={this.state.showDeleteAuthorityModal}
            handleClose={this.handleAuthClose}
            component={"deleteAuthority"}
          />
        ) : null}
        {edit ? <h2 className="mb20">Edit Auth Record Details</h2> : null}
        <Form horizontal onSubmit={(e) => e.preventDefault()}>
          <FormGroup controlId="auth-id-edit">
            <Col componentClass="div" sm={4} className="text-left">
              <i className="fas fa-chess-queen bg-success permission-icon-small mb10" />
              Auth Id (Name):
            </Col>
            <Col sm={7}>
              <FormGroup>
                <FormControl
                  type="text"
                  name="authId"
                  value={this.state.id}
                  placeholder="Auth Id (Name)"
                  onChange={(e) => this.onChangeId(e)}
                />
              </FormGroup>
            </Col>
          </FormGroup>
          {edit ? (
            <FormGroup controlId="auth-id-display">
              <Col componentClass="div" sm={4} className="text-left">
                <i className="fas fa-chess-queen bg-success permission-icon-small mb10" />
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

          <FormGroup controlId="auth-doc-edit">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-chess-queen bg-success permission-icon-small mb10" />
              Doc:
            </Col>
            <Col sm={7}>
              <FormGroup>
                <FormControl
                  className="xs-90"
                  componentClass="textarea"
                  name="authDoc"
                  value={this.state.doc}
                  placeholder="Doc"
                  onChange={(e) => this.onChangeDoc(e)}
                />
              </FormGroup>
            </Col>
          </FormGroup>

          <FormGroup controlId="auth-authority">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-chess-queen bg-success permission-icon-small mb10" />
              Authority
            </Col>
            <Col componentClass="div" sm={7}>
              <FormGroup className="text-left">
                <div
                  className="border-dashed-light-gray pt10"
                  style={{ minHeight: "45px", marginBottom: "5px" }}
                >
                  {auth.map((auth) => {
                    let authId = get(auth, "_auth/id", "No _auth/Id");
                    authId = authId === "" ? "No id" : authId;
                    let auth_id = get(auth, "_id");
                    let doc = get(auth, "_auth/doc", "No documentation");
                    doc = doc === "" ? "No documentation" : doc;
                    return (
                      <OverlayTrigger
                        key={String(auth_id).concat("overlay")}
                        placement="top"
                        overlay={
                          <Tooltip
                            key={String(auth_id).concat("tooltip")}
                            id={auth_id}
                          >
                            {doc}
                          </Tooltip>
                        }
                      >
                        <Button
                          key={String(auth_id).concat("button")}
                          className="mb10"
                          bsStyle="success"
                          value={auth_id}
                          style={{
                            marginLeft: "5px",
                            display: this.state.authority.includes(auth_id)
                              ? null
                              : "none",
                          }}
                          onClick={() => this.removeAuthority(auth_id)}
                        >
                          {authId}&nbsp;&nbsp;
                          <i className="fas fa-times" />
                        </Button>
                      </OverlayTrigger>
                    );
                  })}
                </div>
              </FormGroup>
            </Col>
            <FormGroup>
              <Col sm={4} />
              <Col sm={7}>
                <FormGroup className="text-left">
                  <DropdownButton
                    title="Add an Authority"
                    id="auth-selection-dropdown"
                    style={{ marginLeft: "5px" }}
                  >
                    {auth.map((auth) => {
                      let authId = get(auth, "_auth/id", "No id");
                      authId = authId === "" ? "No id" : authId;

                      let authDoc = get(auth, "_auth/doc", "No doc");
                      authDoc = authDoc === "" ? "No doc" : authDoc;
                      return (
                        <MenuItem
                          key={get(auth, "_id")}
                          value={get(auth, "_id")}
                          onClick={() => {
                            this.addAuthority(get(auth, "_id"));
                          }}
                        >
                          {authId}: {authDoc}
                        </MenuItem>
                      );
                    })}
                    {!auth || auth.length === 0 ? (
                      <MenuItem>No Auth</MenuItem>
                    ) : null}
                  </DropdownButton>
                </FormGroup>
              </Col>
            </FormGroup>
          </FormGroup>

          <FormGroup controlId="user-roles">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-chess-queen bg-success permission-icon-small mb10" />
              Roles
            </Col>
            <Col componentClass="div" sm={7}>
              <FormGroup className="text-left">
                <div
                  className="border-dashed-light-gray pt10"
                  style={{ minHeight: "45px", marginBottom: "5px" }}
                >
                  {roles.map((role) => {
                    let roleId = get(role, "_role/id", "No _role/Id");
                    roleId = roleId === "" ? "No id" : roleId;
                    let role_id = get(role, "_id");
                    let doc = get(role, "_role/doc", "No documentation");
                    doc = doc === "" ? "No documentation" : doc;
                    return (
                      <OverlayTrigger
                        key={String(role._id).concat("overlay")}
                        placement="top"
                        overlay={
                          <Tooltip
                            key={String(role._id).concat("tooltip")}
                            id={get(role, "_id")}
                          >
                            {doc}
                          </Tooltip>
                        }
                      >
                        <Button
                          key={String(role._id).concat("button")}
                          className="mb10"
                          bsStyle="primary"
                          value={role_id}
                          style={{
                            marginLeft: "5px",
                            display: this.state.roles.includes(role_id)
                              ? null
                              : "none",
                          }}
                          onClick={() => this.removeRole(role_id)}
                        >
                          {roleId}&nbsp;&nbsp;
                          <i className="fas fa-times" />
                        </Button>
                      </OverlayTrigger>
                    );
                  })}
                </div>
              </FormGroup>
            </Col>
            <FormGroup>
              <Col sm={4} />
              <Col sm={7}>
                <FormGroup className="text-left">
                  <DropdownButton
                    title="Add a Role"
                    id="role-selection-dropdown"
                    style={{ marginLeft: "5px" }}
                  >
                    {roles.map((role) => {
                      let roleId = get(role, "_role/id", "No id");
                      roleId = roleId === "" ? "No id" : roleId;

                      let roleDoc = get(role, "_role/doc", "No doc");
                      roleDoc = roleDoc === "" ? "No doc" : roleDoc;
                      return (
                        <MenuItem
                          key={get(role, "_id")}
                          value={get(role, "_id")}
                          onClick={() => {
                            this.addRole(get(role, "_id"));
                          }}
                        >
                          {roleId}: {roleDoc}
                        </MenuItem>
                      );
                    })}
                    {!roles || roles.length === 0 ? (
                      <MenuItem>No Roles</MenuItem>
                    ) : null}
                    {nestedRoles ? null : (
                      <AddModal
                        component={"addRole"}
                        rules={rules}
                        nestedRules={true}
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

          {edit ? (
            <FormGroup controlId="auth-id-display">
              <Col componentClass="div" sm={4} className="text-left">
                <i className="fas fa-chess-queen bg-success permission-icon-small mb10" />
                Auth User:
              </Col>
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="authUserTip">
                    To edit the user associated with an auth record, go to "View
                    Permissions By User"
                  </Tooltip>
                }
              >
                <Col
                  componentClass="div"
                  sm={7}
                  style={{
                    border: "1px solid lightgrey",
                    borderRadius: "3px",
                    height: "39px",
                    padding: "9px 12px",
                  }}
                >
                  <span>{username}</span>
                </Col>
              </OverlayTrigger>
            </FormGroup>
          ) : null}
          <Editor
            value={this.state.fullTransaction}
            handleClose={handleClose}
            _db={_db}
            fullRefresh={fullRefresh}
          />
        </Form>
      </div>
    );
  }
}

export { AddNewAuth, DeleteAuth, DeleteAuthority };
