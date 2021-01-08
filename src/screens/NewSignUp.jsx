import React from "react";
import { Link } from "react-router-dom";
import {
  Navbar,
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  Alert,
} from "react-bootstrap";
import get from "lodash.get";
import { flureeFetch } from "../flureeFetch";

class NewSignUp extends React.Component {
  state = {
    account: "",
    confirmCode: "",
    password: "",
    response: null,
  };

  activateAccount() {
    this.setState({ loading: true });

    const { account, confirmCode, username, password } = this.state;
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("activate-token");

    const opts = {
      endpoint: "activate-account",
      body: {
        timestamp: confirmCode,
        account: account,
        username: username,
        token: token,
        password: password,
      },
    };

    flureeFetch(opts)
      .then((response) => {
        window.location.href =
          "/login?username=" + encodeURIComponent(username);
      })
      .catch((error) => {
        const errorMsg = get(
          error,
          ["json", "message"],
          get(error, ["message"], "Unknown error")
        );
        if (/account.*duplicates/.test(errorMsg)) {
          this.setState({
            loading: false,
            error: `A network account with the name of '${account}' already exists. Please choose another name.`,
          });
        } else if (/_user.*duplicates/.test(errorMsg)) {
          this.setState({
            loading: false,
            error: `A username (email address) with the name of '${username}' already exists. Please choose another name.`,
          });
        } else {
          this.setState({ loading: false, error: errorMsg });
        }
      });
  }

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    let username = urlParams.get("email");
    const confirmCode = urlParams.get("t");
    username = username ? username.replace(" ", "+") : "";

    this.setState({
      account: "",
      confirmCode: confirmCode,
      username: username,
      response: null,
      error: null,
    });
  }

  validPW() {
    const length = this.state.password.length;
    if (length > 7) return "success";
    else if (length > 5) return "warning";
    else if (length > 0) return "error";
  }

  validAccount() {
    const validAccount = /^[a-zA-Z0-9-]*$/.test(this.state.account);
    if (validAccount) return "success";
    else return "error";
  }

  validSubmission() {
    const validAcct = this.validAccount();
    const validPW = this.validPW();
    if (validAcct === "success" && validPW === "success") {
      return false;
    }
    return true;
  }

  render() {
    return (
      <div className="background-gradient" style={{ height: "100vh" }}>
        <Navbar collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/">
                <img
                  src={require("../theme/assets/logo_name_white.png")}
                  height="30"
                  alt="Fluree logo"
                />
              </Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
        </Navbar>
        <div className="container">
          <div className="row" style={{ marginTop: "25vh" }}>
            <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 col-xs-10 col-xs-offset-1">
              <div className="well well-lg" style={{ color: "#222" }}>
                <h1 style={{ marginBottom: 30 }}>Create an Account</h1>
                <form
                  className="form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    this.activateAccount();
                  }}
                >
                  <FormGroup
                    controlId="form-username"
                    style={{ marginBottom: 20 }}
                  >
                    <ControlLabel>Username (Email Address)</ControlLabel>
                    <FormControl
                      type="string"
                      placeholder="Username"
                      value={this.state.username}
                      disabled
                    ></FormControl>
                  </FormGroup>
                  <FormGroup
                    controlId="form-password"
                    validationState={this.validPW()}
                    style={{ marginBottom: 20 }}
                  >
                    <ControlLabel>Create Password</ControlLabel>
                    <FormControl
                      type="password"
                      placeholder="Password"
                      value={this.state.password}
                      onChange={(e) =>
                        this.setState({ password: e.target.value })
                      }
                    ></FormControl>
                  </FormGroup>
                  <FormGroup
                    controlId="form-account"
                    style={{ marginBottom: 20 }}
                    validationState={this.validAccount()}
                  >
                    <ControlLabel>Create Account/Network name</ControlLabel>
                    <FormControl
                      type="string"
                      placeholder="Your account/Fluree ledger network name (must be unique). It can only be comprised of letter, numbers, and -s."
                      value={this.state.account}
                      onChange={(e) =>
                        this.setState({ account: e.target.value })
                      }
                    ></FormControl>
                  </FormGroup>
                  <FormGroup
                    controlId="form-username"
                    style={{ marginBottom: 20 }}
                  >
                    <ControlLabel>Confirmation Code</ControlLabel>
                    <FormControl
                      type="string"
                      placeholder="Confirmation Code"
                      value={this.state.confirmCode}
                      onChange={(e) =>
                        this.setState({ confirmCode: e.target.value })
                      }
                    ></FormControl>
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

                  {this.state.response ? (
                    <Alert
                      bsStyle="success"
                      onDismiss={() => this.setState({ response: null })}
                    >
                      <h4>Success!</h4>
                      <p>{this.state.response}</p>
                    </Alert>
                  ) : (
                    <Button
                      type="submit"
                      bsStyle="primary"
                      disabled={this.validSubmission()}
                      style={{ padding: "9px 20px" }}
                    >
                      {this.state.loading
                        ? "Creating Account..."
                        : "Create an Account"}
                    </Button>
                  )}
                </form>
                <hr />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default NewSignUp;
