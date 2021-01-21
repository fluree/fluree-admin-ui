import React, { Component } from "react";
import { flureeFetch } from "../flureeFetch";
import get from "lodash.get";
import { Button, DropdownButton, MenuItem } from "react-bootstrap";
import { PanelStat } from "./Account";
import Footer from "../components/Footer";
import AddModal from "../components/AddModal";
import { AddNewAuth } from "../components/AuthForm";
import { AddNewRole } from "../components/RoleForm";
import { AddNewRule } from "../components/RuleForm";
import AddNewUser from "../components/UserForm";
import { GenerateKeysModal } from "../components/GenerateKeysModal";

class PermissionExplorer extends Component {
  state = {
    selectedType: "user",
    generateKeysModal: false,
    valueFromTnx: "",
  };

  setValueFromTnx = (tnx) => {
    this.setState((prevState) => ({ ...prevState, valueFromTnx: tnx }));
  };
  permissionQuery = {
    auth: {
      select: [
        "*",
        { "_user/_auth": ["_id", "_user/username"] },
        { "_auth/roles": ["*", { "_role/rules": ["*"] }] },
      ],
      from: "_auth",
    },
    user: {
      select: [
        "*",
        { "_user/roles": ["*"] },
        {
          "_user/auth": [
            "*",
            { "_auth/roles": ["*", { "_roles/rules": ["*"] }] },
          ],
        },
      ],
      from: "_user",
    },
    role: {
      select: ["*", { "_role/rules": ["*"] }],
      from: "_role",
    },
    rule: {
      select: ["*"],
      from: "_rule",
    },
    collection: {
      select: ["*"],
      from: "_collection",
    },
    fn: {
      select: ["*"],
      from: "_fn",
    },
  };

  componentDidMount() {
    const { openApiServer } = this.props._db;

    if (openApiServer) {
      this.getData();
    }
  }

  toggleGenerateKeysModal() {
    this.setState({ generateKeysModal: !this.state.generateKeysModal });
  }

  getData = () => {
    const { ip, db, displayError, token } = this.props._db;
    const fullDb = db.split("/");

    const opts = {
      endpoint: "multi-query",
      ip: ip,
      network: fullDb[0],
      db: fullDb[1],
      body: this.permissionQuery,
      auth: token,
    };

    flureeFetch(opts)
      .then((response) => {
        let resp = response.json || response;
        resp = resp.result || resp;
        const _auth = resp.auth;
        const _user = resp.user;
        const _role = resp.role;
        const _rule = resp.rule;
        const _collection = resp.collection;
        const _fn = resp.fn;
        this.setState({
          _auth: _auth,
          _user: _user,
          _role: _role,
          _collection: _collection,
          _fn: _fn,
          _rule: _rule,
        });
      })
      .catch((error) => {
        this.setState({ error: true });
      });
  };

  switchType(type) {
    this.setState({ selectedType: type });
  }

  render() {
    if (!this.props._db.openApiServer) {
      return (
        <div className="text-center mt20">
          <h3>
            The Permissions page is not currently available with a closed API.
          </h3>
        </div>
      );
    }

    if (this.state.error) {
      return <div />;
    }

    if (
      !this.state._user ||
      !this.state._auth ||
      !this.state._role ||
      !this.state._rule ||
      !this.state._collection ||
      !this.state._fn
    ) {
      return <div className="loading1">Loading...</div>;
    }

    if (
      this.state._user &&
      this.state._auth &&
      this.state._role &&
      this.state._rule &&
      this.state._collection &&
      this.state._fn
    ) {
      const { _user, _auth, _role, _rule } = this.state;
      const types = ["user", "auth", "role", "rule"];
      const db = this.props._db.db;

      return (
        <div style={{ paddingLeft: "40px", marginTop: "40px" }}>
          {this.state.generateKeysModal ? (
            <GenerateKeysModal
              {...this.props}
              toggleGenerateKeysModal={this.toggleGenerateKeysModal.bind(this)}
            />
          ) : null}
          <div className="row">
            <div className="col-sm-8">
              <h2 className="mb10 text-uppercase" style={{ color: "#091133" }}>
                <span className="account-header">
                  &nbsp;&nbsp;Permissions: {db}
                </span>
              </h2>
            </div>
            <div className="col-sm-4"></div>
          </div>
          <div className="row panel-stats">
            <div className="col-sm-6 col-md-3">
              <PanelStat
                iconClass="fas fa-user bg-info"
                stat={_user.length}
                statText={
                  _user.length === 1 ? "User in Ledger" : "Users in Ledger"
                }
                switchType={this.switchType.bind(this)}
                type={"user"}
              />
            </div>
            <div className="col-sm-6 col-md-3">
              <PanelStat
                iconClass="fas fa-chess-queen bg-success"
                stat={_auth.length}
                statText={"Auth in Ledger"}
                switchType={this.switchType.bind(this)}
                type={"auth"}
              />
            </div>
            <div className="col-sm-6 col-md-3">
              <PanelStat
                iconClass="fas fa-wrench bg-primary"
                stat={_role.length}
                statText={
                  _role.length === 1 ? "Role in Ledger" : "Roles in Ledger"
                }
                switchType={this.switchType.bind(this)}
                type={"role"}
              />
            </div>
            <div
              className="col-sm-6 col-md-3"
              onClick={() => this.setState({ selectedType: "rule" })}
            >
              <PanelStat
                iconClass="fas fa-unlock bg-danger"
                stat={_rule.length}
                statText={
                  _rule.length === 1 ? "Rule in Ledger" : "Rules in Ledger"
                }
                switchType={this.switchType.bind(this)}
                type={"rule"}
              />
            </div>
          </div>
          <div className="row">
            <div
              className="col-sm-9 second-row-panel"
              style={{
                background: "white",
                marginLeft: "15px",
                maxWidth: "95%",
              }}
            >
              <div className="row">
                <div className="col-sm-6">
                  {this.state.selectedType === "auth" ? (
                    <Button
                      onClick={() => this.setState({ generateKeysModal: true })}
                    >
                      Generate Keys
                    </Button>
                  ) : null}
                </div>
                <div className="col-sm-6 text-right">
                  <h3 style={{ display: "inline" }}>
                    View Permissions by:&nbsp;
                  </h3>
                  <DropdownButton
                    title={this.state.selectedType}
                    id="type-selection-dropdown"
                    className="text-capitalize"
                  >
                    {types.map((type) => (
                      <MenuItem
                        className="text-capitalize"
                        key={type}
                        onClick={() => {
                          this.setState({ selectedType: type });
                        }}
                      >
                        {type}
                      </MenuItem>
                    ))}
                  </DropdownButton>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-12">
                  <PermissionExplorerByType
                    valueFromTnx={this.state.valueFromTnx}
                    setValueFromTnx={this.setValueFromTnx}
                    {...this.props}
                    {...this.state}
                    type={this.state.selectedType}
                    refreshData={this.getData}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* <Footer account={this.props._db.account}/> */}
        </div>
      );
    }
  }
}


class PermissionExplorerByType extends Component {
  state = {
    selectedIndex: 0,
    loading: false,
  };

  transact = (transaction) => {
    this.setState({ loading: true });

    const { ip, db, token } = this.props._db;
    const fullDb = db.split("/");

    const opts = {
      endpoint: "transact",
      ip: ip,
      network: fullDb[0],
      db: fullDb[1],
      body: transaction,
      auth: token,
    };

    flureeFetch(opts)
      .then((res) => {
        this.setState({ loading: false });
        this.fullRefresh();
        this.props.setValueFromTnx("");
      })
      .catch((error) => {
        const errorMessage = error.json || error;
        this.setState({ loading: false, error: true });
        this.props._db.displayError(errorMessage);
      });
  };

  fullRefresh = (resp) => {
    
    this.props.refreshData(resp);
  };

  // On receive newProps, only change selected index if the type changes 
  //or if the index of the item changes
  UNSAFE_componentWillReceiveProps = (nextProps) => {
    const type = this.props.type;
    const item = get(this.props, "_".concat(type))[this.state.selectedIndex];
    const newItem = get(nextProps, "_".concat(type))[this.state.selectedIndex];
    const newItems = get(nextProps, "_".concat(type));

    if (this.props.type !== nextProps.type) {
      this.setState({ selectedIndex: 0 });
    } else if (newItems.length === 0 || item === undefined) {
      this.setState({ selectedIndex: 0 });
    } else if (item._id !== newItem._id) {
      let newSelectedIndex;

      for (var i = 0; i < newItems.length; i++) {
        if (newItems[i]._id === item._id) {
          newSelectedIndex = i;
          break;
        }
        newSelectedIndex = 0;
      }

      this.setState({ selectedIndex: newSelectedIndex });
    }
  };


  generateDeleteSubjectTransaction = (type) => {
    const item = get(this.props, "_".concat(type))[this.state.selectedIndex];

    let transaction = {
      _id: item._id,
      _action: "delete",
    };

    return [transaction];
  };

  render() {
    const {
      _user,
      _auth,
      _role,
      _rule,
      _collection,
      _fn,
      _db,
      valueFromTnx,
      setValueFromTnx,
    } = this.props;

    const type = this.props.type;

    const results = this.props.results;
    const typeData = get(this.props, "_".concat(type));
  
    if (typeData.length === 0) {
      return (
        <div>
          <div
            className="text-center mt20"
            style={{
              backgroundColor: "#fcf8e3",
              border: "1px solid #faebcc",
              color: "#8a6d3b",
              padding: "15px",
            }}
          >
            <strong>There are no {type}s associated with this ledger.</strong>
            {this.state.loading ? (
              <div className="loading1"> Loading... </div>
            ) : null}
          </div>
          <div className="mt10 text-center">
            {(() => {
              switch (type) {
                case "auth":
                  return (
                    <AddNewAuth
                      edit={false}
                      roles={_role}
                      rules={_rule}
                      auth={_auth}
                      _collection={_collection}
                      _db={_db}
                      fullRefresh={this.fullRefresh}
                    />
                  );
                case "role":
                  return (
                    <AddNewRole
                      edit={false}
                      rules={_rule}
                      _collection={_collection}
                      _db={_db}
                      fullRefresh={this.fullRefresh}
                      _fn={_fn}
                    />
                  );
                case "rule":
                  return (
                    <AddNewRule
                      edit={false}
                      _db={_db}
                      _collection={_collection}
                      fullRefresh={this.fullRefresh}
                      _fn={_fn}
                      component={"addRule"}
                    />
                  );
                default:
                  return (
                    <AddNewUser
                      
                      edit={false}
                      roles={_role}
                      rules={_rule}
                      auth={_auth}
                      valueFromTnx={valueFromTnx}
                      setValueFromTnx={this.props.setValueFromTnx}
                      _db={_db}
                      fullRefresh={this.fullRefresh}
                      results={results}
                    />
                  );
              }
            })()}
          </div>
        </div>
      );
    }

    const dropdown = (typeData, keyName, type) => (
      <DropdownButton
        style={{ minWidth: "100px" }}
        title={
          get(typeData, [this.state.selectedIndex, keyName])
            ? get(typeData[this.state.selectedIndex], keyName)
            : `No ${keyName}`
        }
        id="permission-dropdown"
      >
        {typeData.map((data, index) => (
          <MenuItem
            key={data._id}
            onClick={() => {
              this.setState({ selectedIndex: index });
            }}
          >
            {get(data, keyName) ? get(data, keyName) : `No ${keyName}`}
          </MenuItem>
        ))}
        {(() => {
          switch (type) {
            case "auth":
              return (
                <AddModal
                  roles={_role}
                  _db={_db}
                  auth={_auth}
                  fullRefresh={this.fullRefresh}
                  component={"addAuth"}
                  setValueFromTnx={this.props.setValueFromTnx}
                  nestedRoles={true}
                />
              );
            case "role":
              return (
                <AddModal
                  {...this.props}
                  edit={false}
                  rules={_rule}
                  _fn={_fn}
                  _collection={_collection}
                  component={"addRole"}
                  _db={_db}
                  fullRefresh={this.fullRefresh}
                  nestedRules={true}
                />
              );
            case "rule":
              return (
                <AddModal
                  {...this.props}
                  _collection={_collection}
                  _fn={_fn}
                  component={"addRule"}
                  _db={_db}
                  fullRefresh={this.fullRefresh}
                />
              );
            default:
              return (
                <AddModal
                  edit={false}
                  auth={_auth}
                  roles={_role}
                  _db={_db}
                  valueFromTnx={this.props.valueFromTnx}
                  setValueFromTnx={this.props.setValueFromTnx}
                  fullRefresh={this.fullRefresh}
                  fullRefresh={this.fullRefresh}
                  nestedRoles={true}
                  nestedAuth={true}
                  component={"addUser"}
                />
              );
          }
        })()}
      </DropdownButton>
    );

    return (
      <div>
        {this.state.loading ? (
          <div className="loading1"> Loading... </div>
        ) : null}
        <div className="row mt20 border-top-light-gray">
          <div className="col-sm-9 mt20">
            <div className="text-center">
              {/* Select the specific User/Auth/Role/Rule to examine */}
              <div className="mt20">
                {(() => {
                  switch (type) {
                    case "auth":
                      return (
                        <div>
                          <i className="fas fa-chess-queen bg-success permission-icon-small" />{" "}
                          Auth Record:&nbsp;
                          {dropdown(_auth, "_auth/id", "auth")}
                        </div>
                      );
                    case "role":
                      return (
                        <div>
                          <i className="fas fa-wrench bg-primary permission-icon-small" />{" "}
                          Role:&nbsp;
                          {dropdown(_role, "_role/id", "role")}
                        </div>
                      );
                    case "rule":
                      return (
                        <div>
                          <i className="fas fa-unlock bg-danger permission-icon-small" />
                          &nbsp;Rule:&nbsp;
                          {dropdown(_rule, "_rule/id", "rule")}
                        </div>
                      );
                    default:
                      return (
                        <div>
                          <i className="fas fa-user bg-info permission-icon-small" />{" "}
                          User:&nbsp;
                          {dropdown(_user, "_user/username", "user")}
                        </div>
                      );
                  }
                })()}
              </div>
            </div>
          </div>
          <div className="col-sm-3 mt20">
            <div className="text-right mt20">
              <Button
                bsStyle="danger"
                className="text-capitalize"
                onClick={() => {
                  const transaction = this.generateDeleteSubjectTransaction(
                    type
                  );
                  this.transact(transaction);
                }}
              >
                <i className="far fa-trash-alt" />
                &nbsp; Delete
              </Button>
            </div>
          </div>
        </div>
        <div className="row mb10 mt10 pt20 border-top-light-gray border-bottom-light-gray">
          <div className="col-xs-12 mb10">
            {(() => {
              switch (type) {
                case "auth":
                  const authId = get(
                    _auth[this.state.selectedIndex],
                    "_auth/id"
                  );
                  const auth_id = get(_auth[this.state.selectedIndex], "_id");
                  const authDoc = get(
                    _auth[this.state.selectedIndex],
                    "_auth/doc"
                  );
                  const authUser = get(_auth[this.state.selectedIndex], [
                    "_user/_auth",
                  ]);
                  const authRoles = get(
                    _auth[this.state.selectedIndex],
                    "_auth/roles"
                  );
                  const authAuthority = get(
                    _auth[this.state.selectedIndex],
                    "_auth/authority"
                  );
                  return (
                    <AddNewAuth
                      edit={true}
                      id={authId}
                      _id={auth_id}
                      doc={authDoc}
                      user={authUser}
                      auth={_auth}
                      roles={_role}
                      rules={_rule}
                      _collection={_collection}
                      authRoles={authRoles}
                      authAuthority={authAuthority}
                      _db={_db}
                      fullRefresh={this.fullRefresh}
                    />
                  );
                case "role":
                  const roleId = get(
                    _role[this.state.selectedIndex],
                    "_role/id"
                  );
                  const role_id = get(_role[this.state.selectedIndex], "_id");
                  const roleDoc = get(
                    _role[this.state.selectedIndex],
                    "_role/doc"
                  );
                  const roleRules = get(
                    _role[this.state.selectedIndex],
                    "_role/rules"
                  );
                  return (
                    <AddNewRole
                      edit={true}
                      id={roleId}
                      _id={role_id}
                      rules={_rule}
                      doc={roleDoc}
                      _collection={_collection}
                      roleRules={roleRules}
                      _db={_db}
                      _fn={_fn}
                      fullRefresh={this.fullRefresh}
                    />
                  );
                case "rule":
                  const ruleId = get(
                    _rule[this.state.selectedIndex],
                    "_rule/id"
                  );
                  const rule_id = get(_rule[this.state.selectedIndex], "_id");
                  const ruleDoc = get(
                    _rule[this.state.selectedIndex],
                    "_rule/doc"
                  );
                  const ruleOps = get(
                    _rule[this.state.selectedIndex],
                    "_rule/ops"
                  );
                  const ruleCollectionDefault = get(
                    _rule[this.state.selectedIndex],
                    "_rule/collectionDefault"
                  );
                  const ruleCollection = get(
                    _rule[this.state.selectedIndex],
                    "_rule/collection"
                  );
                  const ruleFns = get(
                    _rule[this.state.selectedIndex],
                    "_rule/fns"
                  );
                  const ruleAttributes = get(
                    _rule[this.state.selectedIndex],
                    "_rule/attributes"
                  );
                  const ruleErrorMessage = get(
                    _rule[this.state.selectedIndex],
                    "_rule/errorMessage"
                  );
                  return (
                    <AddNewRule
                      edit={true}
                      _collection={_collection}
                      _fn={_fn}
                      id={ruleId}
                      _id={rule_id}
                      doc={ruleDoc}
                      ops={ruleOps}
                      collectionDefault={ruleCollectionDefault}
                      collection={ruleCollection}
                      fns={ruleFns}
                      predicates={ruleAttributes}
                      errorMessage={ruleErrorMessage}
                      _db={_db}
                      fullRefresh={this.fullRefresh}
                    />
                  );
                default:
                  const userUsername = get(
                    _user[this.state.selectedIndex],
                    "_user/username",
                    "No Username"
                  );
                  const user_id = get(_user[this.state.selectedIndex], "_id");
                  const userRoles = get(
                    _user[this.state.selectedIndex],
                    "_user/roles"
                  );
                  const userAuth = get(
                    _user[this.state.selectedIndex],
                    "_user/auth"
                  );
                  return (
                    <AddNewUser
                      edit={true}
                      username={userUsername}
                      _id={user_id}
                      roles={_role}
                      rules={_rule}
                      auth={_auth}
                      userRoles={userRoles}
                      userAuth={userAuth}
                      allUsers={_user}
                      _db={_db}
                      valueFromTnx={this.props.valueFromTnx}
                      setValueFromTnx={setValueFromTnx}
                      fullRefresh={this.fullRefresh}
                    />
                  );
              }
            })()}
          </div>
          <div className="col-sm-1" />
        </div>
      </div>
    );
  }
}

export default PermissionExplorer;
