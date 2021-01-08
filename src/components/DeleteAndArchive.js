import React, { Component } from "react";
import { flureeFetch } from "../flureeFetch";
import {
  Form,
  ControlLabel,
  FormControl,
  Button,
  Modal,
  Alert,
} from "react-bootstrap";
import get from "lodash.get";
import { hashCode } from "../screens/Signin";


function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

class ArchiveDatabaseModal extends Component {
  state = {
    awsID: null,
  };

  archiveDatabase = () => {
    this.setState({ loading: true });
    const { db, account, token } = this.props._db;
    const dbid = get(db, "db/id");

    const selectedDB = localStorage.getItem(account.concat(".database"));

    if (selectedDB === dbid) {
      localStorage.removeItem(account.concat(".database"));
    }

    const opts = {
      endpoint: "action",
      auth: token,
      body: [
        "archive-database",
        {
          dbname: dbid,
          awsid: this.state.awsID,
        },
      ],
    };

    flureeFetch(opts)
      .then((response) => {
        return sleep(300);
      })
      .then((response) => {
        this.props._db.refreshAccount();
        this.props.archiveDatabaseModalToggle();
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
  };

  handleawsIDChange = (e) => {
    const awsID = e.target ? e.target.value : e;
    this.setState({ awsID: awsID });
  };

  render() {
    const { archiveDatabaseModalToggle, _db } = this.props;
    const dbid = get(_db.db, "db/id");

    return (
      <Modal show onHide={() => archiveDatabaseModalToggle()}> 
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "20px", fontWeight: "lighter" }}>
            <i className="far fa-file-archive" /> &nbsp; Archive Ledger:{" "}
            {dbid}
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
          <br />
          <div className="text-right">
            <Button
              bsStyle="primary"
              onClick={() => this.archiveDatabase()}
              disabled={this.state.loading}
            >
              Yes, I would like to{" "}
              <span style={{ fontWeight: "bolder" }}>archive</span>: {dbid}.
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

class DeleteDatabaseModal extends Component {
  state = {
    error: null,
  };

  deleteDatabase() {
    this.setState({ loading: true });
    const { dbName, account } = this.props;
    const token = localStorage.getItem("token");
    const fullDbName = account.concat(".", dbName);
    const selectedDB = localStorage.getItem(account.concat(".database"));
    if (selectedDB === fullDbName) {
      localStorage.removeItem(account.concat(".database"));
    }

    const opts = {
      body: ["delete-database", { dbname: fullDbName }],
      endpoint: "action",
      auth: token,
    };

    flureeFetch(opts)
      .then((response) => {
        return sleep(300);
      })
      .then((response) => {
        this.props.refreshAccount();
        this.props.deleteDatabaseModalToggle();
      })
      .catch((response) => {
        this.setState({
          error: response.message || response.error || JSON.stringify(response),
          loading: false,
        });
      });
  }

  render() {
    const { dbName, deleteDatabaseModalToggle } = this.props;
    return (
      <Modal show onHide={() => deleteDatabaseModalToggle()}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "20px", fontWeight: "lighter" }}>
            <i className="fas fa-cube" /> &nbsp; Delete Ledger: {dbName}
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
            this ledger?
          </h3>
          <br />
          <ul>
            <li>
              Deleting a ledger is <strong>permanent</strong>.
            </li>
            <br />
            <li>
              It will delete the ledger for your account,{" "}
              <strong>as well as any other accounts</strong> that may have
              access to this ledger.
            </li>
            <br />
            <li>
              If you would like the option of recovering your ledger at a
              later point, please{" "}
              <strong>archive your ledger instead.</strong>
            </li>
          </ul>
          <br />
          <div className="text-right">
            <Button
              bsStyle="danger"
              disabled={this.state.loading}
              onClick={() => this.deleteDatabase()}
            >
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
              delete: {dbName}.
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

class DeleteArchiveModal extends Component {
  state = {
    error: null,
  };

  deleteArchive() {
    this.setState({ loading: true });

    const { dbName, account, dbsArchived } = this.props;
    const token = localStorage.getItem("token");
    const fullDbName = account.concat(".", dbName);
    const fullArchive = dbsArchived.filter(
      (archive) => archive["db/name"] === fullDbName
    );
    const archiveId = get(fullArchive, [0, "db/archive", "_id"]);
    const archiveUrl = get(fullArchive, [0, "db/archive", "archive/url"]);
    const bucket = archiveUrl.substring(
      archiveUrl.indexOf("archive-fluree-"),
      archiveUrl.length - (dbName.length + 7 + account.length)
    );

    const action = [
      "delete-archive",
      {
        archiveid: archiveId,
        bucket: bucket,
        dbname: fullDbName,
      },
    ];

    const opts = {
      endpoint: "action",
      body: action,
      auth: token,
    };

    flureeFetch(opts)
      .then((response) => {
        return sleep(300);
      })
      .then((response) => {
        this.props.deleteArchiveModalToggle();
        this.props.refreshAccount();
      })
      .catch((response) => {
        this.setState({
          error: response.message || response.error || JSON.stringify(response),
          loading: false,
        });
      });
  }

  render() {
    const { account, dbName } = this.props;
    const fullDbName = account.concat(".", dbName);

    return (
      <Modal show onHide={() => this.props.deleteArchiveModalToggle()}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "20px", fontWeight: "lighter" }}>
            <i className="far fa-file-archive" /> &nbsp; Delete Archive
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
            the archive for {fullDbName}?
          </h3>
          <br />
          <ul>
            <li>
              Deleting an archive is <strong>permanent</strong>.
            </li>
            <br />
            <li>
              It will{" "}
              <strong>
                delete the archive and back-up files from the S3 bucket
              </strong>{" "}
              where they are stored.
            </li>
            <br />
            <li>
              Neither you nor anyone else will have access to the archive file,
              unless you have previously saved it to your{" "}
            </li>
          </ul>
          <br />
          <div className="text-right">
            <Button
              bsStyle="danger"
              disabled={this.state.loading}
              onClick={() => this.deleteArchive()}
            >
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
              delete the archive for: {fullDbName}.
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

class RemoveUserModal extends Component {
  state = {
    error: null,
  };

  refreshForm = () => {
    this.setState({
      error: null,
      loading: false,
    });
  };

  removeUser = () => {
    const { username, removeUserModalToggle, getAccountInfo } = this.props;
    const { account, token } = this.props._db;

    this.setState({ loading: true });

    const action = [
      "remove-user",
      {
        username: username,
        account: account,
      },
    ];

    const opts = {
      endpoint: "action",
      auth: token,
      body: action,
    };

    flureeFetch(opts)
      .then((response) => {
        return sleep(300);
      })
      .then((response) => {
      
        if (this.state.self) {
          this.props.logout();
        } else {
          this.setState({ loading: false });
          getAccountInfo();
        }
      })
      .then(() => removeUserModalToggle())
      .catch((response) => {
      
        this.setState({
          error: response.message || response.error || JSON.stringify(response),
          loading: false,
        });
      });
  };

  componentDidMount() {
    const chosenUsernameHash = hashCode(this.props.username);
    const loggedInUserHash = Number(localStorage.getItem("username"));

    if (chosenUsernameHash === loggedInUserHash) {
      this.setState({ self: true });
    } else {
      this.setState({ self: false });
    }
  }

  render() {
    const { removeUserModalToggle, username, account } = this.props;

    return (
      <Modal show onHide={() => removeUserModalToggle()}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "20px", fontWeight: "lighter" }}>
            <i className="fas fa-user-slash" /> &nbsp; Remove User:{" "}
            <strong className="text-primary">{username}</strong> from Account:{" "}
            <strong className="text-primary">{account}</strong>
            <hr />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>
            Removing user&nbsp;
            <strong className="text-primary">{username}</strong> from
            account:&nbsp;
            <strong className="text-primary">{account}</strong>.
          </h3>
          <br />
          {this.state.self ? (
            <Alert bsStyle="danger">
              <h3>You are logged in as {username}.</h3>
              <br />
              Removing yourself from this account will log you out and remove
              your access from the ledgers associated with this account.
            </Alert>
          ) : (
            <ul>
              <li>
                This user will not be able to view any of the ledgers
                associated with this account.{" "}
              </li>
              <br />
            </ul>
          )}
          <div className="text-right">
            <Button
              bsStyle="danger"
              disabled={this.state.loading}
              onClick={() => this.removeUser()}
            >
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

export {
  ArchiveDatabaseModal,
  DeleteDatabaseModal,
  DeleteArchiveModal,
  RemoveUserModal,
};
