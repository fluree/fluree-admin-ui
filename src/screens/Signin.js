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

export function hashCode(string) {
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

class SignIn extends React.Component {
  state = {
    username: "",
    password: "",
    showAccountModal: false,
  };

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    let username = urlParams.get("username") || "";
    this.setState({ username: username });
  }

  getAccounts = () => {
    const { username, password } = this.state;

    const opts = {
      endpoint: "accounts",
      body: {
        user: ["_user/username", username.toLowerCase()],
        password: password,
      },
      noRedirect: true,
    };

    return flureeFetch(opts)
      .then((response) => {
        if (response.status >= 400) {
          const errorMsg = get(
            response,
            ["json", "message"],
            get(response, ["message"], "Unknown error")
          );
          this.setState({ loading: false, error: errorMsg });
          return false;
        }
        let accounts = response.json || response;
        return accounts;
      })
      .catch((error) => {
        const errorMsg = get(
          error,
          ["json", "message"],
          get(error, ["message"], "Unknown error")
        );
        this.setState({ loading: false, error: errorMsg });
        return false;
      });
  };

  getToken = (account) => {
    const { username, password } = this.state;
    this.setState({ loading: true });

    const opts = {
      endpoint: "signin",
      body: {
        user: ["_user/username", username.toLowerCase()],
        password: password,
        account: account,
        expireSeconds: 86400, // 1 day
      },
    };

    return flureeFetch(opts)
      .then((res) => {
        let resp = res.json || res;
        return resp.token;
      })
      .then((res) => {
        localStorage.setItem("username", hashCode(username));
        localStorage.setItem("account", account);
        localStorage.setItem("token", res);
        this.props.authenticate(res, account);
        // debugger;
        // this.props.history.goBack();
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

  submitLogin = (e) => {
    this.setState({ error: null, loading: true });

    this.getAccounts()
      .then((res) => {
        // Tokens are tied to a particular user and a particular account
        if (res === false) {
          // An error should appear,
        } else if (res.length === 1) {
          // If a user only has one account, we attempt to fetch a token using that account
          this.getToken(res[0]["account/id"]);
        } else if (res.length === 0) {
          this.setState({
            error: "There are no accounts associated with this user.",
            loading: false,
          });
        } else {
          let accountArr = [];
          // If multiple arrays, we let the user choose which account they want to log in with.
          res.map((acc) => accountArr.push(get(acc, "account/id")));
          this.setState({ accounts: accountArr, loading: false });
        }
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
      <div className="background-gradient" style={{ height: "100%" }}>
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
                <h1 style={{ marginBottom: 30 }}>Sign in</h1>
                {this.props.message && (
                  <Alert bsStyle="info">{this.props.message}</Alert>
                )}
                <form
                  className="form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!this.state.accounts) {
                      this.submitLogin(e);
                    }
                  }}
                >
                  <FormGroup controlId="form-username">
                    <ControlLabel>Email</ControlLabel>
                    <FormControl
                      type="text"
                      placeholder="Email"
                      value={this.state.username}
                      autoFocus
                      onChange={(e) =>
                        this.setState({ username: e.target.value })
                      }
                    ></FormControl>
                  </FormGroup>
                  <FormGroup
                    controlId="form-password"
                    style={{ marginBottom: 20 }}
                  >
                    <ControlLabel>Password</ControlLabel>
                    <FormControl
                      type="password"
                      placeholder="Password"
                      value={this.state.password}
                      onChange={(e) =>
                        this.setState({ password: e.target.value })
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
                  {this.state.accounts ? (
                    <div>
                      <p>
                        Your email is associated with multiple accounts. Please
                        select one below:
                      </p>
                      {this.state.accounts.map((acct) => (
                        <Button onClick={() => this.getToken(acct)}>
                          {acct}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <Button
                      type="submit"
                      bsStyle="primary"
                      disabled={this.state.loading}
                      style={{ padding: "9px 20px" }}
                    >
                      {this.state.loading ? "Signing in..." : null}
                      {!this.state.loading && !this.state.accounts
                        ? "Sign In"
                        : null}
                    </Button>
                  )}
                </form>
                <hr />
                <div className="text-muted small prose">
                  {"Forgot password? "}
                  <Link to="/reset">
                    Reset Password{" "}
                    <i className="fas fa-arrow-right" aria-hidden="true"></i>
                  </Link>
                  <br />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SignIn;
