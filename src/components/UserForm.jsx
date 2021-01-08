import React, { Component } from "react";
import get from "lodash.get";
import {
  Form,
  FormGroup,
  Col,
  InputGroup,
  FormControl,
  OverlayTrigger,
  Tooltip,
  Button,
  DropdownButton,
  MenuItem,
} from "react-bootstrap";
import AddModal from "./AddModal";
import Editor from "./PermissionsEditor";

class AddNewUser extends Component {
  state = {
    username: "",
    roles: [],
    additionalAuth: [],
    originalRoles: [],
    originalAuth: [],
    fullTransaction: [],
    showDeleteRoleModal: false,
    showDeleteAuthModal: false,
    deleteRole: null,
    deleteAuth: null,
  };

  handleUsernameChange = (username) => {
    this.setState({ username: username, usernameChanged: true }, () =>
      this.calculatedTransaction()
    );
  };

  resetForm = (props) => {
    let results = this.props.results;
    let username = "";
    if (props.username) {
      username = props.username;
    }

    const userRoleArray = [];
    if (props.userRoles !== undefined) {
      props.userRoles.forEach((userRole) => {
        if (
          props.roles.filter((role) => role._id === userRole._id).length !== 0
        ) {
          userRoleArray.push(userRole._id);
        }
      });
    }

    const userAuthArray = [];
    if (props.userAuth !== undefined) {
      props.userAuth.forEach((userAuth) => {
        if (
          props.auth.filter((auth) => auth._id === userAuth._id).length !== 0
        ) {
          userAuthArray.push(userAuth._id);
        }
      });
    }

    this.setState(
      {
        originalRoles: userRoleArray,
        originalAuth: userAuthArray,
        roles: userRoleArray,
        additionalAuth: [],
        deleteRole: null,
        deleteAuth: null,
        usernameChanged: false,
        username: username,
        results: results,
        authChanged: false,
        showDeleteAuthModal: false,
        showDeleteRoleModal: false,
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

  removeRole(_id) {
    _id = Number(_id);
    const roles = this.state.roles.slice();
    const index = roles.indexOf(_id);
    roles.splice(index, 1);

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

  removeAuth(_id) {
    _id = Number(_id);
    const auth = this.state.additionalAuth.slice();
    const index = auth.indexOf(_id);
    auth.splice(index, 1);

    if (this.state.originalAuth.filter((auth) => auth === _id).length !== 0) {
      this.setState({ showDeleteAuthModal: true, deleteAuth: _id });
    } else {
      this.setState({ additionalAuth: auth }, () =>
        this.calculatedTransaction()
      );
    }
  }

  addAuth(_id) {
    _id = Number(_id);
    if (this.state.originalAuth.filter((auth) => auth === _id).length === 0) {
      let authArray = [...this.state.additionalAuth, _id];
      authArray = [...new Set(authArray)];
      this.setState({ additionalAuth: authArray, authChanged: true }, () =>
        this.calculatedTransaction()
      );
    }
  }

  calculatedTransaction = () => {
    let transaction =
      this.state.username === "" &&
      this.state.roles.length === 0 &&
      this.state.auth === 0
        ? null
        : {
            _id: this.props._id ? this.props._id : "_user",
            roles: [...this.state.roles],
          };

    if (
      this.state.usernameChanged &&
      this.props.username !== this.state.username
    ) {
      transaction.username = this.state.username;
    }

    if (this.state.authChanged && this.props.auth !== this.state.auth) {
      transaction.auth = this.state.additionalAuth;
    }

    this.setState({ fullTransaction: [transaction] });
  };

  handleAuthClose = () => {
    this.setState({ showDeleteAuthModal: false });
  };

  handleRoleClose = () => {
    this.setState({ showDeleteRoleModal: false });
  };

  render() {
    const {
      _id,
      edit,
      fullRefresh,
      roles,
      auth,
      transact,
      rules,
      handleClose,
      nestedAuth,
      nestedRoles,
      _db,
    } = this.props;

    let userlessAuth = [];

    auth.forEach((auth) => {
      if (
        get(auth, "_user/_auth", "none") === "none" ||
        get(auth, ["_user/_auth", 0, "_id"], "none") === "none" ||
        get(auth, "_user/_auth").length === 0
      ) {
        userlessAuth.push(auth);
      }
    });

    return (
      <div className="text-gray-light">
        {this.state.showDeleteRoleModal ? (
          <AddModal
            roleId={this.state.deleteRole}
            parentId={_id}
            _db={_db}
            fullRefresh={fullRefresh}
            show={this.state.showDeleteRoleModal}
            handleClose={this.handleRoleClose}
            component={"deleteRole"}
          />
        ) : null}
        {this.state.showDeleteAuthModal ? (
          <AddModal
            authId={this.state.deleteAuth}
            userId={_id}
            _db={_db}
            fullRefresh={fullRefresh}
            show={this.state.showDeleteAuthModal}
            handleClose={this.handleAuthClose}
            component={"deleteAuth"}
          />
        ) : null}
        <h2 className="mb20">
          {edit ? "Edit User Details" : "Create a New User"}
        </h2>
        <Form
          horizontal
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <FormGroup controlId="username-edit">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-user bg-info permission-icon-small mb10" />
              Username:
            </Col>
            <Col sm={7}>
              <FormGroup>
                <InputGroup>
                  <FormControl
                    type="text"
                    name="username"
                    value={this.state.username}
                    placeholder="Username"
                    onChange={(e) => this.handleUsernameChange(e.target.value)}
                  />
                </InputGroup>
              </FormGroup>
            </Col>
          </FormGroup>
          {edit ? (
            <FormGroup controlId="id-display">
              <Col componentClass="div" className="text-left" sm={4}>
                <i className="fas fa-user bg-info permission-icon-small mb10" />
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
          <FormGroup controlId="user-roles">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-user bg-info permission-icon-small mb10" />
              Roles
            </Col>
            <Col componentClass="div" sm={7}>
              <FormGroup className="text-left">
                <div
                  className="border-dashed-light-gray pt10"
                  style={{ minHeight: "45px", marginBottom: "5px" }}
                >
                  {
                    roles.map((role) => {
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
                            key={String(role_id).concat("button")}
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
                    })
                  }
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
                        edit={false}
                        roles={roles}
                        rules={rules}
                        nestedRules={true}
                        _db={_db}
                        fullRefresh={fullRefresh}
                        transact={transact}
                      />
                    )}
                  </DropdownButton>
                </FormGroup>
              </Col>
            </FormGroup>
          </FormGroup>
          <FormGroup controlId="user-auth">
            <Col componentClass="div" className="text-left" sm={4}>
              <span>
                <i className="fas fa-user bg-info permission-icon-small mb10" />
                Auth Records:
              </span>
            </Col>
            <Col componentClass="div" sm={7}>
              <FormGroup className="text-left">
                <OverlayTrigger
                  placement="left"
                  overlay={
                    <Tooltip id="authnote">
                      You may only add auth records that are not attached to any
                      other user.{" "}
                    </Tooltip>
                  }
                >
                  <div
                    className="border-dashed-light-gray pt10"
                    style={{ minHeight: "45px", marginBottom: "5px" }}
                  >
                    {
                    
                      auth.map((auth) => {
                        let authId = get(auth, "_auth/id", "No _auth/Id");
                        authId = authId === "" ? "No id" : authId;
                        let auth_id = get(auth, "_id");
                        let doc = get(auth, "_auth/doc", "No documentation");
                        doc = doc === "" ? "No documentation" : doc;
                        return (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={get(auth, "_id")}>{doc}</Tooltip>
                            }
                          >
                            <Button
                              className="mb10"
                              bsStyle="success"
                              value={auth_id}
                              style={{
                                marginLeft: "5px",
                                display:
                                  this.state.originalAuth.includes(auth_id) ||
                                  this.state.additionalAuth.includes(auth_id)
                                    ? null
                                    : "none",
                              }}
                              onClick={() => this.removeAuth(auth_id)}
                            >
                              {authId}&nbsp;&nbsp;
                              <i className="fas fa-times" />
                            </Button>
                          </OverlayTrigger>
                        );
                      })
                    }
                  </div>
                </OverlayTrigger>
              </FormGroup>
            </Col>
            <FormGroup>
              <Col sm={4} />
              <Col sm={7}>
                <FormGroup className="text-left">
                  <DropdownButton
                    title="Add an Auth Record"
                    id="auth-selection-dropdown"
                    style={{ marginLeft: "5px" }}
                  >
                    {userlessAuth.map((auth) => {
                      let authId = get(auth, "_auth/id", "No id");
                      authId = authId === "" ? "No id" : authId;

                      let authDoc = get(auth, "_auth/doc", "No doc");
                      authDoc = authDoc === "" ? "No doc" : authDoc;
                      return (
                        <MenuItem
                          key={get(auth, "_id")}
                          value={get(auth, "_id")}
                          onClick={() => {
                            this.addAuth(get(auth, "_id"));
                          }}
                        >
                          {authId}: {authDoc}
                        </MenuItem>
                      );
                    })}
                    {!userlessAuth || userlessAuth.length === 0 ? (
                      <MenuItem>No Available Auth</MenuItem>
                    ) : null}
                    {nestedAuth ? null : (
                      <AddModal
                        component={"addAuth"}
                        edit={false}
                        roles={roles}
                        _db={_db}
                        auth={auth}
                        nestedRoles={true}
                        fullRefresh={fullRefresh}
                        transact={transact}
                      />
                    )}
                  </DropdownButton>
                </FormGroup>
              </Col>
            </FormGroup>
          </FormGroup>
          <FormGroup controlId="edit-delete-user">
            <Editor
              value={this.state.fullTransaction}
              setValueFromTnx={this.props.setValueFromTnx}
              valueFromTnx={this.props.valueFromTnx}
              handleClose={handleClose}
              _db={_db}
              fullRefresh={fullRefresh}
            />
          </FormGroup>
        </Form>
      </div>
    );
  }
}

export default AddNewUser;
