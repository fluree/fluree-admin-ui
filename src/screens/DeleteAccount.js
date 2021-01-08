import React, { Component } from "react";
import { flureeFetch } from "../flureeFetch";
import Footer from "../components/Footer";
import {
  ListGroup,
  Well,
  Modal,
  ControlLabel,
  FormControl,
  ListGroupItem,
  Form,
  Alert,
  Button,
} from "react-bootstrap";
import get from "lodash.get";
import {
  ArchiveDatabaseModal,
  DeleteDatabaseModal,
  DeleteArchiveModal,
  RemoveUserModal,
} from "../components/DeleteAndArchive";
import { Database, ArchivedDatabase, Users } from "./Account";
import { hashCode } from "../screens/Signin";

// Sleep promise, used temporarily until syncTo is working to delay updated queries.
function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

class ArchiveAllDatabasesModal extends Component {
  state = {
    awsID: null,
    note: null,
  };

  archiveAllDatabases() {
    this.setState({ loading: true, error: null });
    const { account } = this.props;
    const token = localStorage.getItem("token");
    localStorage.removeItem(account.concat(".database"));

    const action = [
      "archive-all",
      {
        account: account,
        awsid: this.state.awsID,
      },
    ];

    if (this.state.awsID) {
      this.setState({
        note:
          "Archiving begun. Please do not close this menu. This may take some time depending on the size of your ledgers. This menu will close once the process is complete.",
      });
    }

    flureeFetch(`/api/action`, action, token)
      .then((response) => {
        return sleep(500);
      })
      .then((response) => {
        this.props.refreshAccount();
        this.props.archiveAllDatabasesModalToggle();
      })
      .catch((response) => {
        let error =
          response.message || response.error || JSON.stringify(response);

        if (error.includes("Invalid id")) {
          error =
            "Invalid AWS Canonical User ID. If you are logged into your root user in AWS, you should be able to find the Canonical User ID in My Security Credentials > Account Identifiers.";
        }
        this.setState({
          error: error,
          loading: false,
        });
      });
  }

  handleawsIDChange = (e) => {
    const awsID = e.target ? e.target.value : e;
    this.setState({ awsID: awsID });
  };

  render() {
    const { archiveAllDatabasesModalToggle, dbs } = this.props;
    const dbsThree = dbs.slice(0, 3).join(", ");
    return (
      <Modal show onHide={() => archiveAllDatabasesModalToggle()}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "20px", fontWeight: "lighter" }}>
            <i className="far fa-file-archive" /> &nbsp; Archive All Ledgers:{" "}
            <span className="text-primary">
              {dbs.length > 3 ? dbsThree.concat("...") : dbsThree}
            </span>
            <hr style={{ marginBottom: "0px" }} />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>What happens when you archive a ledger?</h3>
          <br />
          <ul>
            <li>
              You- and anyone else that has access to the ledger- will{" "}
              <strong>no longer be able to access it</strong> via this
              administrative interface.{" "}
            </li>
            <br />
            <li>
              The ledger will be stored as an{" "}
              <strong>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://docs.aws.amazon.com/AmazonS3/latest/dev/UsingBucket.html"
                >
                  Amazon S3 Bucket
                </a>
                .
              </strong>
              &nbsp;You will be able to find the link for your S3 bucket on this
              page.
            </li>
            {/* <br/>
              <li>You will also also have the <strong>option of completely deleting</strong> the archive via your S3 interface. </li> */}
          </ul>
          <hr />
          <p>
            In order to archive your ledger, please provide the Amazon Web
            Services Canonical User ID that you want to be able to access the
            archive.
          </p>
          <p>
            Need help&nbsp;
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.aws.amazon.com/general/latest/gr/acct-identifiers.html#FindingCanonicalId"
            >
              finding your canonical ID?
            </a>
          </p>
          <br />
          <Form>
            <ControlLabel>AWS Canonical User ID</ControlLabel>
            <FormControl
              type="text"
              value={this.state.awsID}
              placeholder="Enter your AWS Canonical User ID"
              onChange={this.handleawsIDChange}
            />
          </Form>
          <br />
          {this.state.note ? (
            <Alert bsStyle="info">{this.state.note}</Alert>
          ) : null}
          <br />
          <div className="text-right">
            <Button
              bsStyle="primary"
              onClick={() => this.archiveAllDatabases()}
              disabled={this.state.loading || !this.state.awsID}
            >
              Yes, I would like to{" "}
              <span style={{ fontWeight: "bolder" }}>archive</span> all
              ledgers.
            </Button>
          </div>
          <br />
          {this.state.error ? (
            <Alert
              bsStyle="danger"
              onDismiss={() => this.setState({ error: null })}
            >
              <h4>Error</h4>
              <p>{this.state.error}</p>
            </Alert>
          ) : null}
        </Modal.Body>
      </Modal>
    );
  }
}

class DeleteAllDatabasesModal extends Component {
  state = {
    error: null,
  };

  deleteAllDatabases() {
    const { dbs, account } = this.props;
    const token = localStorage.getItem("token");
    localStorage.removeItem(account.concat(".database"));
    this.setState({ loading: true });

    for (let i = 0; i < dbs.length; i++) {
      const action = [
        "delete-database",
        {
          dbname: dbs[i],
        },
      ];

      flureeFetch(`/api/action`, action, token)
        .then((response) => {
          return sleep(300);
        })
        .then((response) => {
          this.props.refreshAccount();
        })
        .catch((response) => {
          // error
          this.setState({
            error:
              response.message || response.error || JSON.stringify(response),
            loading: false,
          });
        });
    }

    this.setState({ loading: false });
    this.props.deleteAllDatabasesModalToggle();
  }

  render() {
    const { dbs, deleteAllDatabasesModalToggle } = this.props;
    return (
      <Modal show onHide={() => deleteAllDatabasesModalToggle()}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "20px", fontWeight: "lighter" }}>
            <i className="fas fa-cube" /> &nbsp; Delete All Ledgers
            <hr style={{ marginBottom: "0px" }} />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>
            Are you sure you want to{" "}
            <span
              style={{
                fontVariant: "small-caps",
                color: "#d61a3c",
                fontWeight: "bolder",
                fontSize: "150%",
              }}
            >
              delete
            </span>{" "}
            all ledgers?
          </h3>
          <br />
          <ul>
            <li>
              Deleting a ledger is <strong>permanent</strong>.
            </li>
            <br />
            <li>
              It will delete the ledgers for your account,{" "}
              <strong>as well as any other accounts</strong> that may have
              access to these ledgers.
            </li>
            <br />
            <li>
              If you would like the option of recovering your ledgers at a
              later point, please{" "}
              <strong>archive your ledgers instead.</strong>
            </li>
          </ul>
          <br />
          {dbs.map((db) => (
            <ListGroupItem className="text-primary">{db}</ListGroupItem>
          ))}
          <br />
          <div className="text-right">
            <Button bsStyle="danger" onClick={() => this.deleteAllDatabases()}>
              Yes, I would like to{" "}
              <span
                style={{
                  fontVariant: "small-caps",
                  fontWeight: "bolder",
                  fontSize: "150%",
                }}
              >
                permanently
              </span>{" "}
              delete all ledgers.
            </Button>
          </div>
          <br />
          {this.state.loading ? (
            <Alert bsStyle="success">
              <h3>This may take a few minutes</h3>
              <p>Please do not leave this page. </p>
            </Alert>
          ) : null}
          {this.state.error ? (
            <Alert
              bsStyle="danger"
              onDismiss={() => this.setState({ error: null })}
            >
              <h4>Error</h4>
              <p>{this.state.error}</p>
            </Alert>
          ) : null}
        </Modal.Body>
      </Modal>
    );
  }
}

class RemoveAllUsersModal extends Component {
  state = {
    error: null,
  };

  refreshForm = () => {
    this.setState({
      error: null,
      loading: false,
    });
  };

  removeAllUsers = () => {
    const {
      users,
      account,
      removeAllUsersModalToggle,
      refreshAccount,
    } = this.props;
    const token = localStorage.getItem("token");
    this.setState({ loading: true });

    for (let i = 0; i < users.length; i++) {
      const action = [
        "remove-user",
        {
          username: users[i],
          account: account,
        },
      ];

      flureeFetch(`/api/action`, action, token)
        .then((response) => {
          return sleep(300);
        })
        .then((response) => {
          refreshAccount();
        })
        .catch((response) => {
          // error
          this.setState({
            error:
              response.message || response.error || JSON.stringify(response),
            loading: false,
          });
        });
    }

    this.setState({ loading: false });
    removeAllUsersModalToggle();
  };

  render() {
    const { removeAllUsersModalToggle, account, users } = this.props;

    return (
      <Modal show onHide={() => removeAllUsersModalToggle()}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "20px", fontWeight: "lighter" }}>
            <i className="fas fa-user-slash" /> &nbsp; Remove All Other Users
            from Account: <strong className="text-primary">{account}</strong>
            <hr />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>
            Removing all other users from account:&nbsp;
            <strong className="text-primary">{account}</strong>.
          </h3>
          <br />
          {users.map((user) => (
            <ListGroupItem className="text-primary">{user}</ListGroupItem>
          ))}
          <br />
          <h3>
            These users will not be able to view any of the ledgers associated
            with this account.{" "}
          </h3>
          <br />
          <div className="text-right">
            <Button bsStyle="danger" onClick={() => this.removeAllUsers()}>
              Remove User
            </Button>
          </div>
          <br />
          {this.state.error ? (
            <Alert bsStyle="danger" onDismiss={() => this.refreshForm()}>
              <h4>Error</h4>
              <p>{this.state.error}</p>
            </Alert>
          ) : null}
        </Modal.Body>
      </Modal>
    );
  }
}

class DeleteAccountModal extends Component {
  state = {};

  deleteAccount = () => {
    const { account } = this.props;
    const token = localStorage.getItem("token");
    const action = [
      "delete-account",
      {
        account: account,
      },
    ];

    flureeFetch(`/api/action`, action, token)
      .then((response) => {
        return sleep(300);
      })
      .then((response) => {
        this.props.logout();
      })
      .catch((response) => {
        // error
        this.setState({
          error: response.message || response.error || JSON.stringify(response),
          loading: false,
        });
      });
  };

  render() {
    const { deleteAccountModalToggle, account } = this.props;
    return (
      <Modal show onHide={() => deleteAccountModalToggle()}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "20px", fontWeight: "lighter" }}>
            <i className="fas fa-ban" /> &nbsp; Deleting Account:{" "}
            <strong className="text-primary">{account}</strong>
            <hr />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>Are you sure you want to delete {account}&nbsp;?</h3>
          <br />
          <ul>
            <li>
              Deleting an account is{" "}
              <strong style={{ color: "#d51a3c" }}>permanent</strong>.
            </li>
            <br />
            <li>
              You{" "}
              <strong style={{ color: "#d51a3c" }}>
                will lose access to archived ledgers,
              </strong>{" "}
              so please <strong>download those files from S3</strong>.
            </li>
            <br />
            <li>
              If you would like to simply remove yourself as a user from this
              account, you can do so on the Account Info page.
            </li>
          </ul>
          <br />
          <div className="text-right">
            <Button bsStyle="danger" onClick={() => this.deleteAccount()}>
              Delete Account
            </Button>
          </div>
          <br />
          {this.state.error ? (
            <Alert
              bsStyle="danger"
              onDismiss={() => this.setState({ error: null })}
            >
              <h4>Error</h4>
              <p>{this.state.error}</p>
            </Alert>
          ) : null}
        </Modal.Body>
      </Modal>
    );
  }
}

class DeleteAccount extends Component {
  state = {
    token: null,
    username: null,
    dbName: null, // when generating a token, archiving, or deleting a db, stores the dbName that was selected
    deleteDatabaseModal: false, // toggle to show modal for deleting a database
    archiveDatabaseModal: false, // toggle to show modal for archiving a database
    deleteArchiveModal: false, // toggle to show modal for deleting an archive
    removeUserModal: false, // toggle to show remove user modal
    removeAllUsersModal: false, // toggle to show remove *all* users modal
    archiveAllDatabasesModal: false, // toggle to show modal for archiving *all* databases
    deleteAllDatabases: false, // toggle to show modal for deleting *all* databases
    deleteAccountModal: false,
  };

  refreshAccount = () => {
    this.setState({ loading: true });
    this.getDbs();
  };

  hashCode(string) {
    var hash = 0;
    if (string.length === 0) {
      return hash;
    }
    for (var i = 0; i < string.length; i++) {
      var char = string.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  getDbs() {
    const account = this.props._db.account;
    const token = this.props.token || localStorage.getItem("token");
    const dbQuery = {
      select: [
        "*",
        {
          "account/dbs": [
            "db/name",
            "db/archived",
            "db/deleted",
            { "db/archive": ["_id", "archive/url"] },
          ],
        },
        { "account/users": ["_user/username"] },
      ],
      from: ["account/name", account],
    };

    flureeFetch("/api/db/query", dbQuery, token)
      .then((response) => {
        // Get DBs from response
        const dbArrayNotArchived = [];
        const dbArrayArchived = [];
        const dbs = get(response, ["result", "account/dbs"], null);

        if (dbs === null) {
        } else {
          dbs.forEach((db) => {
            if (get(db, ["db/archived"], false)) {
              dbArrayArchived.push(db);
            } else if (!get(db, ["db/deleted"], false)) {
              dbArrayNotArchived.push(get(db, "db/name"));
            }
          });
        }

        this.setState({
          dbs: dbArrayNotArchived,
          dbsArchived: dbArrayArchived,
        });

        // Get users from response
        const userArray = [];
        const nonSelfUserArray = [];
        const hashedUsername = Number(localStorage.getItem("username"));
        const users = get(response, ["result", "account/users"], null);
        if (Array.isArray(users)) {
          users.forEach((user) => userArray.push(get(user, "_user/username")));
          users.forEach((user) =>
            hashCode(get(user, "_user/username")) === hashedUsername
              ? null
              : nonSelfUserArray.push(get(user, "_user/username"))
          );
        }
        this.setState({ users: userArray, nonSelfUsers: nonSelfUserArray });

        // Get maxDBs and maxUsers
        const maxDbs = get(response, ["result", "account/maxDbs"]);
        const maxUsers = get(response, ["result", "account/maxUsers"]);
        this.setState({ maxDbs: maxDbs });
        this.setState({ maxUsers: maxUsers, loading: false });
      })
      .catch((error) => {
        if (error.status === 401 || error.status === 403) {
          this.props.logout();
          // main token expired, need to log back in.
        } else {
          this.props._db.setGlobalProps("error", error);
          this.setState({ loading: false });
        }
      });
  }

  componentDidMount() {
    this.getDbs();
    this.setState({
      dbName: null,
      deleteDatabaseModal: false,
      archiveDatabaseModal: false,
      deleteArchiveModal: false,
      removeUserModal: false,
      archiveAllDatabasesModal: false,
      deleteAllDatabasesModal: false,
      deleteAccountModal: false,
    });
  }

  deleteDatabaseModalToggle(dbName) {
    this.setState({
      deleteDatabaseModal: !this.state.deleteDatabaseModal,
      dbName: dbName,
    });
  }

  deleteAllDatabasesModalToggle(dbName) {
    this.setState({
      deleteAllDatabasesModal: !this.state.deleteAllDatabasesModal,
    });
  }

  archiveDatabaseModalToggle(dbName) {
    this.setState({
      archiveDatabaseModal: !this.state.archiveDatabaseModal,
      dbName: dbName,
    });
  }

  archiveAllDatabasesModalToggle() {
    this.setState({
      archiveAllDatabasesModal: !this.state.archiveAllDatabasesModal,
    });
  }

  deleteArchiveModalToggle(dbName) {
    this.setState({
      deleteArchiveModal: !this.state.deleteArchiveModal,
      dbName: dbName,
    });
  }

  removeUserModalToggle(username) {
    this.setState({
      removeUserModal: !this.state.removeUserModal,
      username: username,
    });
  }

  removeAllUsersModalToggle() {
    this.setState({ removeAllUsersModal: !this.state.removeAllUsersModal });
  }

  deleteAccountModalToggle() {
    this.setState({ deleteAccountModal: !this.state.deleteAccountModal });
  }

  render() {
    const { account } = this.props._db;
    const {
      maxDbs,
      maxUsers,
      dbs,
      users,
      dbsArchived,
      nonSelfUsers,
    } = this.state;
    const accountLength = account.length;
    const readyToDelete =
      dbs && nonSelfUsers
        ? dbs.length === 0 && nonSelfUsers.length === 0
        : false;

    if (!maxDbs || !maxUsers || !dbs || !users || this.state.loading) {
      return <div className="loading1"> Loading... </div>;
    }
    return (
      <div style={{ paddingLeft: "40px", marginTop: "40px" }}>
        {this.state.archiveDatabaseModal === true ? (
          <ArchiveDatabaseModal
            account={account}
            dbName={this.state.dbName}
            archiveDatabaseModalToggle={this.archiveDatabaseModalToggle.bind(
              this
            )}
            refreshAccount={this.refreshAccount.bind(this)}
          />
        ) : null}

        {this.state.deleteDatabaseModal === true ? (
          <DeleteDatabaseModal
            account={account}
            dbName={this.state.dbName}
            deleteDatabaseModalToggle={this.deleteDatabaseModalToggle.bind(
              this
            )}
            refreshAccount={this.refreshAccount.bind(this)}
          />
        ) : null}
        {this.state.deleteArchiveModal === true ? (
          <DeleteArchiveModal
            account={account}
            dbName={this.state.dbName}
            dbsArchived={this.state.dbsArchived}
            deleteArchiveModalToggle={this.deleteArchiveModalToggle.bind(this)}
            refreshAccount={this.refreshAccount.bind(this)}
          />
        ) : null}
        {this.state.removeUserModal === true ? (
          <RemoveUserModal
            account={account}
            username={this.state.username}
            history={this.props.history}
            removeUserModalToggle={this.removeUserModalToggle.bind(this)}
            refreshAccount={this.refreshAccount.bind(this)}
          />
        ) : null}
        {this.state.archiveAllDatabasesModal === true ? (
          <ArchiveAllDatabasesModal
            account={account}
            dbs={dbs}
            history={this.props.history}
            archiveAllDatabasesModalToggle={this.archiveAllDatabasesModalToggle.bind(
              this
            )}
            refreshAccount={this.refreshAccount.bind(this)}
          />
        ) : null}
        {this.state.deleteAllDatabasesModal === true ? (
          <DeleteAllDatabasesModal
            account={account}
            dbs={dbs}
            history={this.props.history}
            deleteAllDatabasesModalToggle={this.deleteAllDatabasesModalToggle.bind(
              this
            )}
            refreshAccount={this.refreshAccount.bind(this)}
          />
        ) : null}
        {this.state.removeAllUsersModal === true ? (
          <RemoveAllUsersModal
            account={account}
            users={nonSelfUsers}
            history={this.props.history}
            removeAllUsersModalToggle={this.removeAllUsersModalToggle.bind(
              this
            )}
            refreshAccount={this.refreshAccount.bind(this)}
          />
        ) : null}
        {this.state.deleteAccountModal === true ? (
          <DeleteAccountModal
            account={account}
            history={this.props.history}
            deleteAccountModalToggle={this.deleteAccountModalToggle.bind(this)}
            refreshAccount={this.refreshAccount.bind(this)}
          />
        ) : null}

        <div className="row">
          <div className="col-sm-6" style={{ marginBottom: "30px" }}>
            <h2 style={{ color: "#737171" }}>
              <span className="account-header text-uppercase">
                &nbsp;&nbsp;Delete Account : {account}
              </span>
            </h2>
          </div>
        </div>

        <div className="row">
          {/* <div className="col-sm-3"/> */}
          <div className="col-md-5" style={{ padding: "0 15px" }}>
            <Well style={{ paddingRight: "15px" }}>
              <h3>In order to delete an account:</h3>
              <br />
              <div style={{ marginLeft: "20px", cursor: "default" }}>
                {dbs.length === 0 ? (
                  <i
                    style={{ padding: "10px", color: "white" }}
                    className="fas fa-check bg-green-success"
                  />
                ) : (
                  <i
                    style={{ padding: "10px", color: "white" }}
                    className="fas fa-times bg-danger"
                  />
                )}
                &nbsp;&nbsp;Delete or archive all{" "}
                <strong className="text-primary">ledgers</strong>&nbsp;
                <i className="fas fa-cubes" />
              </div>
              <br />
              <br />
              <div style={{ marginLeft: "20px", cursor: "default" }}>
                {nonSelfUsers.length === 0 ? (
                  <i
                    style={{ padding: "10px", color: "white" }}
                    className="fas fa-check bg-green-success"
                  />
                ) : (
                  <i
                    style={{ padding: "10px", color: "white" }}
                    className="fas fa-times bg-danger"
                  />
                )}
                &nbsp;&nbsp;Remove all other&nbsp;
                <strong className="text-primary">users</strong>&nbsp;
                <i className="fas fa-users" />
              </div>
              <br />
              <div style={{ width: "100%", textAlign: "right" }}>
                <Button
                  bsStyle="danger"
                  disabled={!readyToDelete}
                  onClick={() => this.deleteAccountModalToggle()}
                >
                  {" "}
                  DELETE ACCOUNT{" "}
                </Button>
              </div>
            </Well>
          </div>
          <div className="col-sm-1" />
        </div>
        <div className="row">
          <div
            className="col-sm-5 second-row-panel"
            style={{ marginLeft: "15px" }}
          >
            {dbs.length === 0 ? (
              <h3 style={{ color: "#737171" }}>
                NO ACTIVE LEDGERSS IN ACCOUNT
              </h3>
            ) : (
              <div className="row pb10">
                <div className="col-sm-4">
                  <h3 style={{ color: "#737171" }}>LEDGERS</h3>
                </div>
                <div className="col-sm-4" />
                <div className="col-sm-4">
                  <Button onClick={() => this.archiveAllDatabasesModalToggle()}>
                    Archive All
                  </Button>
                </div>
                {/* <div className="col-sm-4">
                <Button onClick={() => this.deleteAllDatabasesModalToggle()}>Delete All</Button>
              </div> */}
              </div>
            )}
            <ListGroup>
              {dbs.map((db) => (
                <Database
                  key={db}
                  account={account}
                  dbName={db.substring(accountLength + 1)}
                  token={false}
                  dbLength={dbs.length}
                  deleteDatabaseModalToggle={this.deleteDatabaseModalToggle.bind(
                    this
                  )}
                  archiveDatabaseModalToggle={this.archiveDatabaseModalToggle.bind(
                    this
                  )}
                />
              ))}
            </ListGroup>
            {dbsArchived.length > 0 ? (
              <div>
                <hr />
                <h3 className="pb10" style={{ color: "#737171" }}>
                  ARCHIVED LEDGERS
                </h3>
                <ListGroup>
                  {dbsArchived.map((db) => (
                    <ArchivedDatabase
                      key={get(db, "db/name", "none").concat("Archived")}
                      deleteArchiveModalToggle={this.deleteArchiveModalToggle.bind(
                        this
                      )}
                      _db={this.props._db}
                      name={get(db, "db/name").substring(accountLength + 1)}
                      url={get(db, ["db/archive", "archive/url"])}
                    />
                  ))}
                </ListGroup>
              </div>
            ) : null}
            <p />
          </div>
          <div className="col-sm-1" />
          <div className="col-sm-5 second-row-panel mg-15-left-sm">
            {nonSelfUsers.length === 0 ? (
              <h3 style={{ color: "#737171" }}>NO OTHER USERS IN ACCOUNT</h3>
            ) : (
              <div className="row pb10">
                <div className="col-sm-8">
                  <h3 style={{ color: "#737171" }}>OTHER ACCOUNT USERS</h3>
                </div>
                <div className="col-sm-4">
                  <Button onClick={() => this.removeAllUsersModalToggle()}>
                    Remove All
                  </Button>
                </div>
              </div>
            )}
            <div className="list-group">
              {nonSelfUsers.map((user) => (
                <Users
                  key={user}
                  username={user}
                  removeUserModalToggle={this.removeUserModalToggle.bind(this)}
                />
              ))}
            </div>
            <p />
          </div>
        </div>
        {/* <div className="row">
          <div className="col-sm-10">
            <Footer account={account}/>
          </div>
        </div> */}
      </div>
    );
  }
}

export default DeleteAccount;
