import React from "react";
import {
  Modal,
  Alert,
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
} from "react-bootstrap";
import get from "lodash.get";
import { Link } from "react-router-dom";
import { flureeFetch } from "../flureeFetch";

class ShowAccountModal extends React.Component {
  state = {
    show: this.props.show,
    accounts: [],
    error: null,
  };

  handleClose = () => {
    this.setState({ show: false });
    this.props.closeModal();
  };

  onSelect = (account) => {
    localStorage.setItem("account", account);
    this.props.closeModal();
  };

  getAccounts = () => {
    this.setState({ loading: true });
    let { username, password, accounts } = this.state;

    const opts = {
      endpoint: "accounts",
      body: {
        user: ["_user/username", username.toLowerCase()],
        password: password,
      },
    };

    return flureeFetch(opts)
      .then((response) => {
        let resp = response.json || response;
        resp = resp.result || resp;
        resp.map((account) => {
          let id = get(account, "account/id");
          accounts.push(id);
        });
        localStorage.setItem("accounts", accounts);
        this.setState({ accounts: accounts, error: null, loading: false });
      })
      .catch((error) => {
        const errorMsg = get(
          error,
          ["json", "message"],
          get(error, ["message"], "Unknown error")
        );
        this.setState({ loading: false, error: errorMsg });
      });
  };

  render() {
    return (
      <Modal show={this.state.show} onHide={this.handleClose}>
        <Modal.Header closeButton style={{ paddingBottom: "0px" }}>
          <Modal.Title style={{ fontSize: "20px", fontWeight: "lighter" }}>
            <i className="fas fa-user" /> &nbsp; View Accounts
            <hr style={{ marginBottom: "0px" }} />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert bsStyle="info">
            <p>You must sign in with a username, password, and account.</p>
            <p>
              To view the accounts that your user is associated with, enter your
              username and password below.
            </p>
          </Alert>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              this.getAccounts();
            }}
          >
            <FormGroup controlId="form-username">
              <ControlLabel>Username</ControlLabel>
              <FormControl
                type="text"
                placeholder="username"
                value={this.state.username}
                autoFocus
                onChange={(e) => this.setState({ username: e.target.value })}
              ></FormControl>
            </FormGroup>
            <FormGroup controlId="form-password" style={{ marginBottom: 20 }}>
              <ControlLabel>Password</ControlLabel>
              <FormControl
                type="password"
                placeholder="password"
                value={this.state.password}
                onChange={(e) => this.setState({ password: e.target.value })}
              ></FormControl>
            </FormGroup>
            <Button
              type="submit"
              bsStyle="primary"
              disabled={this.state.loading}
              style={{ padding: "9px 20px" }}
            >
              {this.state.loading ? "Fetching Accounts..." : "View Accounts"}
            </Button>
            <div className="mt10 text-muted small prose">
              {"Forgot password? "}
              <Link to="/reset">
                Reset Password{" "}
                <i className="fas fa-arrow-right" aria-hidden="true"></i>
              </Link>
              <br />
            </div>
          </form>
          {this.state.error ? (
            <Alert
              bsStyle="danger"
              onDismiss={() => this.setState({ error: null })}
            >
              <h4>Error</h4>
              {this.state.error}
            </Alert>
          ) : null}
          {this.state.accounts.length > 0 ? (
            <div>
              <h2 className="mt20 text-center">Select an Account</h2>
              <div className="row">
                {this.state.accounts.map((act) => (
                  <div
                    key={act}
                    className="col-sm-3 mb10"
                    style={{ cursor: "pointer" }}
                    onClick={this.onSelect.bind(this, act)}
                  >
                    <div className="user-selection-label text-capitalize">
                      {act}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </Modal.Body>
      </Modal>
    );
  }
}

export default ShowAccountModal;
