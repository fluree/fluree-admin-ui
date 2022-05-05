import React, { Component, Fragment } from "react";
import { flureeFetch, gateway } from "../flureeFetch";
import { signRequest } from "@fluree/crypto-utils";
import {
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  ListGroupItem,
  Button,
  Modal,
  Alert,
  HelpBlock,
  MenuItem,
  OverlayTrigger,
  Tooltip,
  DropdownButton,
} from "react-bootstrap";
import get from "lodash.get";

import Draggable from "react-draggable";
import { RemoveUserModal } from "../components/DeleteAndArchive";

export class NewDatabaseModal extends Component {
  state = {
    id: "",
    error: null,
  };

  refreshForm = () => {
    this.setState({
      id: "",
      error: null,
      loading: false,
    });
  };

  getValidationState = () => {
    let regex = /^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/;
    if (this.state.id.length > 0 && this.state.id.match(regex) !== null) {
      return "success";
    }
    return "warning";
  };

  handleChange(key, e) {
    let newState = {};
    newState[key] = e.target.value;
    this.setState(newState);
  }

  onGenerate = (e) => {
    this.setState({ loading: true });
    e.preventDefault();

    let blockNumber =
      this.state.blockNumber && Number(this.state.blockNumber) > 0
        ? Number(this.state.blockNumber)
        : null;

    const tx = { "ledger/id": this.state.id };

    const endpoint = "new-ledger";
    const { ip, token } = this.props._db;
    const opts = {
      ip: ip,
      endpoint: endpoint,
      body: tx,
      auth: token,
    };

    const refreshDbs = this.props._db.refreshDbs;

    const request = () => {
      flureeFetch(opts)
        .then((response) => {
          if (response.status === 200) {
            refreshDbs(ip);
            this.props.newDatabaseModalToggle();
          } else {
            this.setState({ error: response.message, loading: false });
          }
        })
        .catch((response) => {
          this.setState({
            error:
              response.json.message ||
              response.error ||
              JSON.stringify(response),
            loading: false,
          });
        });
    };
    request();
  };

  render() {
    const { newDatabaseModalToggle, _db } = this.props;

    return (
      <Draggable enableUserSelectHack={false}>
        <Modal show onHide={() => newDatabaseModalToggle()}>
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: "20px", fontWeight: "lighter" }}>
              <i className="fas fa-cube" /> &nbsp; Create New Ledger
              <hr style={{ marginBottom: "0px" }} />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Fragment>
              <p>
                <b>Note:</b> A Ledger Id uniquely identifies a ledger within a
                network. A Ledger Id begins with the network name (e.g
                myNetwork) followed by a forward slash "/" and the Ledger name
                (e.g myLedger).
                <br></br>
              </p>
              <p>
                <em>
                  <b>A Ledger Id example:</b> myNetwork/myLedger
                </em>
              </p>
              <Form onSubmit={this.onGenerate.bind(this)}>
                <ControlLabel style={{ margin: "20px 0" }}>
                  Ledger Id
                </ControlLabel>
                <FormGroup
                  controlId="formBasicText"
                  validationState={this.getValidationState()}
                >
                  <span>
                    <FormControl
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      type="text"
                      value={this.state.id}
                      placeholder="Begin ledger id"
                      onChange={(e) => this.handleChange("id", e)}
                    />
                  </span>
                </FormGroup>
                <FormGroup className="text-right">
                  <Button
                    className="fluree-rounded-button"
                    type="submit"
                    disabled={
                      this.getValidationState() === "warning" ||
                      this.state.loading
                    }
                  >
                    Create
                  </Button>
                </FormGroup>
                {this.state.error ? (
                  <Alert
                    bsStyle="danger"
                    onDismiss={() => this.setState({ error: null })}
                  >
                    <h4>Error</h4>
                    <p>{this.state.error}</p>
                  </Alert>
                ) : null}
              </Form>
            </Fragment>
          </Modal.Body>
        </Modal>
      </Draggable>
    );
  }
}

class NewUserModal extends Component {
  state = {
    username: "",
    error: null,
  };

  refreshForm = () => {
    this.setState({
      username: "",
      error: null,
      loading: false,
    });
  };

  getValidationState() {
    const { username } = this.state;
    const emailRegex = /^[\w-+]+(\.[\w]+)*@[\w-]+(\.[\w]+)*(\.[a-z]{2,})$/;
    if (username.length < 1) return "success";
    else if (!emailRegex.test(username)) return "error";
    else return "success";
  }

  handleChange(e) {
    this.setState({ username: e.target.value });
  }

  onGenerate = (e) => {
    e.preventDefault();
    this.setState({ loading: true });
    const { account, token } = this.props._db;
    const { newUserModalToggle, getAccountInfo } = this.props;

    const action = [
      "new-user",
      {
        username: this.state.username.toLowerCase(),
        account: account,
        sendEmail: true,
      },
    ];

    const opts = {
      endpoint: "action",
      auth: token,
      body: action,
    };

    flureeFetch(opts)
      .then((response) => {
        if (response.status === 200) {
          this.setState({ username: "", loading: false });
          getAccountInfo();
          newUserModalToggle();
        } else {
          this.setState({ error: response.message, loading: false });
        }
      })
      .catch((response) => {
        this.setState({
          error: response.message || response.error || JSON.stringify(response),
          loading: false,
          dbName: this.props.account + ".",
        });
      });
  };

  render() {
    const { newUserModalToggle } = this.props;

    return (
      <Draggable enableUserSelectHack={false}>
        <Modal show onHide={() => newUserModalToggle()}>
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: "20px", fontWeight: "lighter" }}>
              <i className="fas fa-user" /> &nbsp; Add User to Account
              <hr />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.onGenerate.bind(this)}>
              <ControlLabel className="mt20 mb20">
                User Email Address
              </ControlLabel>
              <FormGroup
                controlId="formBasicText"
                validationState={this.getValidationState()}
              >
                <FormControl
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                  type="text"
                  value={this.state.username}
                  placeholder="Enter email address for new user"
                  onChange={this.handleChange.bind(this)}
                  autoFocus
                />
                <FormControl.Feedback />
              </FormGroup>
              <p>User will receive an email explaining next steps.</p>
              <FormGroup className="text-right">
                <Button
                  bsStyle="primary"
                  type="submit"
                  disabled={
                    this.getValidationState() === "error" || this.state.loading
                  }
                >
                  Create
                </Button>
              </FormGroup>
              {this.state.error ? (
                <Alert bsStyle="danger" onDismiss={() => this.refreshForm()}>
                  <h4>Error</h4>
                  <p>{this.state.error}</p>
                </Alert>
              ) : null}
            </Form>
          </Modal.Body>
        </Modal>
      </Draggable>
    );
  }
}

export class ConfirmDatabaseDeletionModal extends Component {
  state = {
    confirmDeletion: "",
    confirmDeletionAuthIDAndPrivateKey: null,
    error: null,
    confirmDeletionAuthID: null,
    confirmDeletionPrivateKey: null,
  };

  deleteDB = (e, db, ip) => {
    const { openApiServer, displayError } = this.props._db;
    e.preventDefault();
    let opts;
    const tx = {
      "ledger/id": db,
    };

    const endpoint = "delete-ledger";
    const refreshDbs = this.props._db.refreshDbs;
    const request = (options) => {
      flureeFetch(options)
        .then((response) => {
          if (response.status === 200) {
            refreshDbs(ip);
          } else {
            this.setState({ error: response.message, loading: false });
            displayError(response.message);
          }
        })
        .catch((response) => {
          let result = response.json || response;
          let errorMessage =
            result.message || result.error || JSON.stringify(response);
          this.setState({
            error: errorMessage,
            loading: false,
          });
          displayError(errorMessage);
        });
    };
    if (openApiServer) {
      opts = {
        ip: ip,
        endpoint: endpoint,
        body: tx,
        auth: this.props.token,
      };
    } else {
      let authId = this.state.confirmDeletionAuthID;
      let privateKey = this.state.confirmDeletionPrivateKey;

      const baseUri = gateway(ip) || "";
      const { headers, body } = signRequest(
        "POST",
        `${baseUri}/fdb/delete-ledger`,
        JSON.stringify({ "ledger/id": db, auth: authId }),
        privateKey,
        authId
      );

      opts = {
        ip: ip,
        endpoint: endpoint,
        body: JSON.parse(body),
        headers: headers,
        auth: this.props.token,
        noRedirect: true,
      };
    }

    const { confirmDatabaseDeletionModalToggle } = this.props;
    request(opts);
    confirmDatabaseDeletionModalToggle();
  };

  handleChangeForConfirmDeleteTextbox = (e) => {
    this.setState({
      confirmDeletion: e.target.value,
    });
    console.log(this.state.confirmDeletion);
  };
  handleChangeForConfirmPrivateKeyTextbox = (e) => {
    this.setState({
      confirmDeletionPrivateKey: e.target.value,
    });
  };
  handleChangeForConfirmAuthIDTextbox = (e) => {
    this.setState({
      confirmDeletionAuthID: e.target.value,
    });
  };
  getValidationState = () => {
    const { openApiServer } = this.props._db;
    if (!openApiServer) {
      if (
        this.state.confirmDeletionAuthID &&
        this.state.confirmDeletionPrivateKey
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      if (this.state.confirmDeletion === "CONFIRM") {
        return false;
      } else {
        return true;
      }
    }
  };
  render() {
    const { confirmDatabaseDeletionModalToggle, db, ip } = this.props;
    const { openApiServer } = this.props._db;

    return (
      <Fragment>
        <Draggable enableUserSelectHack={false}>
          {/* <Button variant="primary" onClick={handleShow}>
				Launch demo modal
			</Button> */}

          <Modal show onHide={() => confirmDatabaseDeletionModalToggle()}>
            <Modal.Header closeButton>
              <Modal.Title>
                Are you sure you want to DELETE this ledger?{" "}
              </Modal.Title>
            </Modal.Header>
            <Form onSubmit={(e) => this.deleteDB(e, db, ip)}>
              {openApiServer && (
                <Modal.Body>
                  <p>Please, type CONFIRM to delete this ledger.</p>
                  <FormGroup>
                    <FormControl
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      type="text"
                      value={this.state.confirmDeletion}
                      placeholder="Type CONFIRM to delete ledger"
                      onChange={(e) =>
                        this.handleChangeForConfirmDeleteTextbox(e)
                      }
                      autoFocus
                    />
                  </FormGroup>
                </Modal.Body>
              )}
              {!openApiServer && (
                <Modal.Body>
                  <p>
                    Server Open-Api status is currently set to <i>'false'</i>.
                    Please provide an <b>AuthID</b> and <b>Private Key</b> to{" "}
                    <span style={{ color: "red" }}>DELETE</span> ledger.
                  </p>

                  <FormGroup>
                    <p>AuthID</p>
                    <FormControl
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      type="text"
                      value={this.state.confirmDeletionAuthID}
                      placeholder="Type your AuthID to delete this ledger"
                      onChange={(e) =>
                        this.handleChangeForConfirmAuthIDTextbox(e)
                      }
                      autoFocus
                    />
                    <br></br>
                    <p>Private Key</p>
                    <FormControl
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      type="text"
                      value={this.state.confirmDeletionPrivateKey}
                      placeholder="Type your Private Key to delete ledger"
                      onChange={(e) =>
                        this.handleChangeForConfirmPrivateKeyTextbox(e)
                      }
                      autoFocus
                    />
                  </FormGroup>
                </Modal.Body>
              )}

              <Modal.Footer>
                <Button
                  style={{ borderRadius: "32px" }}
                  bsStyle="danger"
                  type="submit"
                  disabled={this.getValidationState()}
                >
                  DELETE
                </Button>
              </Modal.Footer>
              {this.state.error ? (
                <Alert
                  style={{ margin: "0 10px 10px" }}
                  bsStyle="danger"
                  onDismiss={() => this.setState({ error: null })}
                >
                  <h4>Error</h4>
                  <p>{this.state.error}</p>
                </Alert>
              ) : null}
            </Form>
          </Modal>
        </Draggable>
      </Fragment>
    );
  }
}

export class Database extends Component {
  state = {
    loading: false,
    error: null,
    confirmDatabaseDeletionModal: false,
  };

  confirmDatabaseDeletionModalToggle = () => {
    this.setState({
      confirmDatabaseDeletionModal: !this.state.confirmDatabaseDeletionModal,
    });
  };

  render() {
    const { db, ip, _db, block, size, flakes } = this.props;

    const idShort = db.length > 60 ? db.substring(0, 40).concat("...") : db;

    return (
      <Fragment>
        {this.state.confirmDatabaseDeletionModal === true ? (
          <ConfirmDatabaseDeletionModal
            confirmDatabaseDeletionModalToggle={
              this.confirmDatabaseDeletionModalToggle
            }
            db={db}
            ip={ip}
            _db={_db}
          />
        ) : null}

        <tr key={db}>
          <td style={{ textAlign: "left" }}>
            {/* &nbsp; */}
            <span style={{ display: "flex", direction: "row" }}>
              <span>{idShort}</span>
              <span
                class="snap-shot-delete-wrapper"
                style={{ marginLeft: "auto" }}
              >
                <span
                  style={{
                    padding: "4px 10px",
                    cursor: "pointer",
                    borderRadius: "32px",
                    marginLeft: "10px",
                  }}
                  className="danger"
                  onClick={() => this.confirmDatabaseDeletionModalToggle()}
                >
                  <i
                    className="fas fa-trash hidden-xs"
                    aria-hidden="true"
                    style={{ padding: "5px" }}
                  ></i>
                </span>{" "}
              </span>
            </span>
          </td>

          <td>{block}</td>
          <td>{(parseInt(size) / 1024).toFixed(2)}</td>
          <td>{flakes}</td>
        </tr>
      </Fragment>
    );
  }
}

export class ArchivedDatabase extends Component {
  viewURL = (link) => {
    if (link) {
      window.open(link, "_blank");
    } else {
      this.props._db.setGlobalProps("error", {
        error: "No URL Found",
        message:
          "No URL found for this ledger archive. Please contact support@flur.ee for additional assistance.",
      });
    }
  };

  viewArchive = (url, name) => {
    return (
      <MenuItem
        key={name.concat("viewArchive")}
        value={name.concat("viewArchive")}
        onClick={() => this.viewURL(url)}
      >
        <i className="far fa-file-archive" />
        &nbsp;&nbsp;View Archive
      </MenuItem>
    );
  };

  deleteArchive = (name) => {
    return (
      <MenuItem
        key={name.concat("deleteArchive")}
        value={name.concat("deleteArchive")}
        onClick={() => this.props.deleteArchiveModalToggle(name)}
      >
        <i className="far fa-trash-alt" />
        &nbsp;&nbsp;Delete Archive
      </MenuItem>
    );
  };

  viewBackups = (backup, name) => {
    return (
      <MenuItem
        key={name.concat("backup-view")}
        value={name.concat("backup-view")}
        onClick={() => this.viewURL(backup)}
      >
        <i className="fas fa-eye" />
        &nbsp;&nbsp;View Back-ups
      </MenuItem>
    );
  };

  dropdown = (url, backup, name) => {
    if (url === "deleted") {
      return (
        <DropdownButton disabled title="Archive Deleted">
          {" "}
        </DropdownButton>
      );
    } else if (backup) {
      return (
        <DropdownButton title="Options" id="Archive Options">
          {this.viewArchive(url, name)}
          {this.viewBackups(backup, name)}
          {this.deleteArchive(name)}
        </DropdownButton>
      );
    } else {
      return (
        <DropdownButton title="Options" id="Archive Options">
          {this.viewArchive(url, name)}
          {this.deleteArchive(name)}
        </DropdownButton>
      );
    }
  };

  render() {
    const { name, url, backup } = this.props;
    return (
      <ListGroupItem>
        <div className="row">
          <div className="col-xs-6" style={{ lineHeight: "40px" }}>
            <i
              className="far fa-file-archive hidden-xs"
              aria-hidden="true"
              style={{ paddingRight: "5px" }}
            ></i>
            &nbsp;
            <h3 style={{ display: "inline" }}>{name}</h3>
          </div>
          <div className="col-xs-6">{this.dropdown(url, backup, name)}</div>
        </div>
      </ListGroupItem>
    );
  }
}

export class Users extends Component {
  render() {
    const { username, removeUserModalToggle } = this.props;
    const usernameShort =
      username.length > 18 ? username.substring(0, 15).concat("...") : username;
    return (
      <ListGroupItem key={username}>
        <div className="row">
          <div className="col-xs-7" style={{ lineHeight: "40px" }}>
            <i
              className="fas fa-user hidden-sm"
              aria-hidden="true"
              style={{ paddingRight: "5px" }}
            ></i>
            &nbsp;
            {usernameShort.length !== username.length ? (
              <OverlayTrigger
                key={username}
                placement="top"
                overlay={<Tooltip key={username}>{username}</Tooltip>}
              >
                <h3 style={{ display: "inline" }}>{usernameShort}</h3>
              </OverlayTrigger>
            ) : (
              <h3 style={{ display: "inline" }}>{usernameShort}</h3>
            )}
          </div>
          <div className="pull-right" style={{ marginRight: "10px" }}>
            <Button
              key={username}
              value={username}
              onClick={() => removeUserModalToggle(username)}
            >
              <i className="fas fa-user-slash" />
              &nbsp;&nbsp;Remove
            </Button>
          </div>
        </div>
      </ListGroupItem>
    );
  }
}

export class PanelStat extends Component {
  render() {
    const { switchType, type } = this.props;
    return (
      <div
        className="panel-stat"
        onClick={switchType ? () => switchType(type) : null}
        style={{
          cursor: switchType ? "pointer" : "default",
          borderRadius: "7px",
        }}
      >
        <div className="panel-stat-left">
          <i
            style={{
              padding:
                this.props.iconClass === "fas fa-tag bg-success"
                  ? "25px"
                  : null,
              borderRadius: "7px 0 0 7px",
            }}
            className={this.props.iconClass}
          />
        </div>
        <div className="panel-stat-right">
          <div className="stat">{this.props.stat}</div>
          <div className="stat-text">{this.props.statText}</div>
        </div>
      </div>
    );
  }
}

class AccountInfo extends Component {
  state = {
    newDatabaseModal: false,
    dataBasesWithInfo: [],
    isLoadingDatabaseInfo: true,
    configModal: false,
    confirmDatabaseDeletionModal: false,
    checkDbs: this.props._db,
    dbsLength: this.props._db.dbs.length,
    databaseHeader: ["Ledger", "Current Block", "Size(Kb)", "Flakes"],
  };
  componentDidMount() {
    this.loadDatabaseInfo();

    const { _db } = this.props;

    let nwStateIp = _db.ip;
    let nwStateParams = {
      endpoint: "nw-state",
      ip: nwStateIp,
      noRedirect: true,
    };

    flureeFetch(nwStateParams)
      .then((response) => {
        let statusCheck = this.getOpenApiServerStatus();
        if (statusCheck === undefined) {
          this.setOpenApiServerStatus(response.json["open-api"]);
          this.setState({
            openApiServer: response.json["open-api"],
          });
        } else {
          let openApiServerStatusShow = this.getOpenApiServerStatus();
          this.setState({
            openApiServer: response.json["open-api"],
            showServerOpenApiAlert: openApiServerStatusShow,
          });
        }
      })
      .catch((error) => {
        this.displayError(error);
      });
  }
  componentDidUpdate(prevProps, prevState) {
    //used to ensure re-render on deletion or creation of db
    if (prevState.dbsLength !== this.state.dbsLength) {
      this.loadDatabaseInfo();
    }
  }

  displayError(error) {
    this.setState({ error: error });
  }
  loadDatabaseInfo() {
    let databaseInfoRequests = [];
    const { ip, token, dbs } = this.props._db;

    let fullDatabases = dbs.map((db) => [...db.split("/"), db]);
    fullDatabases.forEach((fullDb) => {
      const optsForLedgerStats = {
        endpoint: "ledger-stats",
        ip: ip,
        network: fullDb[0],
        ledger: fullDb[1],
        auth: token,
      };
      databaseInfoRequests.push(
        this.getDatabasesInfo(optsForLedgerStats, fullDb[2])
      );
    });

    Promise.all(databaseInfoRequests)
      .then((res) => {
        this.setState({
          dataBasesWithInfo: [...res],
          isLoadingDatabaseInfo: false,
        });
      })
      .catch((error) => {
        if (error.status === 401) {
          this.props._db.displayConfig();
        } else {
          this.setState({
            error: JSON.stringify(error),
            isLoadingDatabaseInfo: false,
            loading: false,
          });
        }
      });
  }

  getDatabasesInfo(optsForLedgerStats, databaseName) {
    return new Promise((resolve, reject) => {
      flureeFetch(optsForLedgerStats)
        .then((response) => {
          if (response.json && response.json.data) {
            let res = response.json.data;
            resolve({ ...res, databaseName });
          } else {
            let result = {
              msg: response.message ? response.message : response,
            };
            resolve({ ...result, databaseName });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  setOpenApiServerStatus = (openApiServerStatus) => {
    const config = {
      openApiServerStatusShow: openApiServerStatus ? false : true,
    };
    localStorage.setItem("openApiServerConfig", JSON.stringify(config));
  };

  getOpenApiServerStatus = () => {
    let config = localStorage.getItem("openApiServerConfig");
    config = JSON.parse(config);

    let openApiServerStatusShow = get(config, "openApiServerStatusShow");

    return openApiServerStatusShow;
  };
  static getDerivedStateFromProps(nextProps, prevState) {
    //used to ensure re-render on deletion or creation of db
    if (nextProps._db !== prevState.checkDbs) {
      return { dbsLength: nextProps._db.dbs.length };
    } else return null;
  }

  sortBy(array, attrName) {
    array.sort((a, b) => {
      let nameA = get(a, attrName, "z").toUpperCase();
      let nameB = get(b, attrName, "z").toUpperCase();
      return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
    });

    return array;
  }

  archiveDatabaseModalToggle(dbName) {
    this.setState({
      archiveDatabaseModal: !this.state.archiveDatabaseModal,
      dbName: dbName,
    });
  }

  backupDatabaseModalToggle(dbName) {
    this.setState({
      backupDatabaseModal: !this.state.backupDatabaseModal,
      dbName: dbName,
    });
  }

  newDatabaseModalToggle = () => {
    this.setState({ newDatabaseModal: !this.state.newDatabaseModal });
    this.forceUpdate();
  };

  newUserModalToggle = () => {
    this.setState({ newUserModal: !this.state.newUserModal });
  };

  removeUserModalToggle(username) {
    this.setState({
      removeUserModal: !this.state.removeUserModal,
      username: username,
    });
  }

  renderTableHeader = (arrayOfHeadings) => {
    return arrayOfHeadings.map((header) => {
      switch (header) {
        case "Ledger":
          return (
            <th style={{ textAlign: "left" }}>
              <span>
                <i
                  className="fas fa-database hidden-xs"
                  aria-hidden="true"
                  style={{ paddingRight: "5px" }}
                ></i>
              </span>
              {header}
              <span></span>
            </th>
          );
        case "Current Block":
          return (
            <th style={{ textAlign: "center" }}>
              <span>
                <i
                  className="fas fa-cube hidden-xs"
                  aria-hidden="true"
                  style={{ paddingRight: "5px" }}
                ></i>
              </span>
              {header}
            </th>
          );

        case "Size(Kb)":
          return <th style={{ textAlign: "center" }}>{header}</th>;
        case "Flakes":
          return (
            <th style={{ textAlign: "center" }}>
              <span>
                <i
                  className="fas fa-snowflake hidden-xs"
                  aria-hidden="true"
                  style={{ paddingRight: "5px" }}
                ></i>
              </span>
              {header}
            </th>
          );
      }
    });
  };

  render() {
    const _db = this.props._db;
    const { account, dbs, ip, token } = this.props._db;

    const { maxDbs, maxUsers, users } = this.state;
    const dataBasesText = dbs.length === 1 ? "LEDGER" : "LEDGERS";
    const numOfDatabases = dbs.length;

    if (!dbs) {
      return <div className="loading1"> Loading... </div>;
    }

    return (
      <div
        style={{
          marginTop: "40px",
          height: "100%",
          width: "100%",
        }}
      >
        {this.state.newDatabaseModal === true ? (
          <NewDatabaseModal
            _db={_db}
            newDatabaseModalToggle={this.newDatabaseModalToggle}
            openApiServerStatus={this.state.openApiServer}
          />
        ) : null}
        {this.state.newUserModal === true ? (
          <NewUserModal
            {...this.props}
            _db={_db}
            newUserModalToggle={this.newUserModalToggle}
            getAccountInfo={this.getAccountInfo.bind(this)}
          />
        ) : null}

        {this.state.removeUserModal === true ? (
          <RemoveUserModal
            {...this.props}
            _db={_db}
            account={account}
            username={this.state.username}
            history={this.props.history}
            removeUserModalToggle={this.removeUserModalToggle.bind(this)}
            getAccountInfo={this.getAccountInfo.bind(this)}
          />
        ) : null}

        <div
          style={{
            width: "100%",
            padding: "1% 3%",
          }}
        >
          <h3
            style={{
              alignItems: "center",
              marginBottom: "7px",
            }}
          >
            <span style={{ color: "#091133" }}>
              {`${dataBasesText} (${numOfDatabases})`}
            </span>
          </h3>

          <div>
            {this.state.isLoadingDatabaseInfo ? (
              "Loading...."
            ) : (
              <div
                id="scroll-div-container"
                className="table-container network-page-table-container"
                style={{
                  maxHeight: "585px",
                  width: "100%",
                }}
              >
                <table
                  className="block-table block-table-stripes"
                  ref="scrollContent"
                  striped
                  bordered
                  hover
                  size="sm"
                >
                  <thead style={{ padding: "15px" }}>
                    {this.renderTableHeader(this.state.databaseHeader)}
                  </thead>
                  <tbody>
                    {this.state.dataBasesWithInfo.map((dataBaseInfo) => (
                      <Database
                        key={dataBaseInfo.databaseName}
                        db={dataBaseInfo.databaseName}
                        block={dataBaseInfo.block}
                        size={dataBaseInfo.size}
                        flakes={dataBaseInfo.flakes}
                        dbLength={dbs.length}
                        ip={ip}
                        token={token}
                        _db={_db}
                        msg={dataBaseInfo.msg}
                        newDatabaseModalToggle={this.newDatabaseModalToggle}
                        openApiServerStatus={this.state.openApiServer}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{ textAlign: "center", marginTop: "7px" }}>
              <Button
                className="fluree-rounded-button"
                id="new-database-button"
                onClick={this.newDatabaseModalToggle}
              >
                <i className="fas fa-plus" /> &nbsp;Add Ledger
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AccountInfo;
