import React from "react";
import { Link } from "react-router-dom";
import {
  Navbar,
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  Alert,
  HelpBlock,
} from "react-bootstrap";
import get from "lodash.get";
import { flureeFetch } from "../flureeFetch";

function getParameterByName(name) {
  var match = RegExp("[?&]" + name + "=([^&]*)").exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, " "));
}

class RequestToken extends React.Component {
  state = {
    username: "",
    success: false, // set to true once a successful reset has been performed
    loading: false,
    error: null,
  };

  submitRequest(e) {
    const { username } = this.state;
    e.preventDefault();
    this.setState({ error: null, loading: true });

    const opts = {
      endpoint: "reset-pw",
      body: { username: username },
    };

    flureeFetch(opts)
      .then((response) => {
        if (response.status !== 200) {
          this.setState({ error: response.message, loading: false });
        } else {
          this.setState({ success: true, loading: false });
        }
      })
      .catch((error) => {
        this.setState({
          loading: false,
          error: get(error, ["message"], "Unknown error"),
        });
      });
  }

  render() {
    return (
      <div className="well well-lg" style={{ color: "#222" }}>
        <h1 style={{ marginBottom: 30 }}>Reset Password</h1>
        <form className="form" onSubmit={(e) => this.submitRequest(e)}>
          {!this.state.success ? (
            <FormGroup controlId="form-username">
              <ControlLabel>Enter your Email (username)</ControlLabel>
              <FormControl
                type="text"
                placeholder="username"
                value={this.state.username}
                onChange={(e) => this.setState({ username: e.target.value })}
              ></FormControl>
            </FormGroup>
          ) : null}
          {this.state.success ? (
            <Alert bsStyle="success">
              <h4>Check your inbox!</h4>
              <p>
                We sent a message to {this.state.username}, please use the token
                we provided there to reset your password.
              </p>
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
          {!this.state.success ? (
            <Button
              type="submit"
              bsStyle="primary"
              disabled={this.state.loading}
              style={{ padding: "9px 20px" }}
            >
              {this.state.loading ? "Sending..." : "Send Reset Email"}
            </Button>
          ) : null}
          <hr />
          <div className="text-muted small prose">
            {"Return to login page: "}
            <Link to="/login">
              Login <i className="fas fa-arrow-right" aria-hidden="true"></i>
            </Link>
            <br />
          </div>
        </form>
      </div>
    );
  }
}

class ResetPassword extends React.Component {
  state = {
    password: "",
    loading: false,
    error: null,
  };

  submitReset(e) {
    e.preventDefault();

    const { password } = this.state;
    const { resetToken } = this.props;

    this.setState({ error: null, loading: true });

    const opts = {
      endpoint: "new-pw",
      body: { password, resetToken, expireSeconds: 86400 },
    };

    flureeFetch(opts) // return token that expires in 1 day\
      .then((response) => {
        if (response.status !== 200) {
          this.setState({ error: response.message, loading: false });
        } else {
          localStorage.removeItem("account");
          localStorage.removeItem("accounts");
          localStorage.removeItem("token");
          this.props.setMessage(response.json.message);
          this.props.history.push("/login");
        }
      })
      .catch((error) => {
        this.setState({
          loading: false,
          error: get(error, ["message"], "Unknown error"),
        });
      });
  }

  getValidationState() {
    const length = this.state.password.length;
    if (length > 7) return "success";
    else if (length > 5) return "warning";
    else if (length > 0) return "error";
  }

  render() {
    return (
      <div className="well well-lg" style={{ color: "#222" }}>
        <h1 style={{ marginBottom: 30 }}>Reset Password</h1>
        <form className="form" onSubmit={(e) => this.submitReset(e)}>
          <FormGroup
            controlId="form-password"
            validationState={this.getValidationState()}
            style={{ marginBottom: 20 }}
          >
            <ControlLabel>New Password</ControlLabel>
            <FormControl
              type="password"
              placeholder="Password"
              value={this.state.password}
              onChange={(e) => this.setState({ password: e.target.value })}
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
          <HelpBlock>Password must be at least 8 characters long.</HelpBlock>
          <Button
            type="submit"
            bsStyle="primary"
            disabled={
              this.state.loading || this.getValidationState() !== "success"
            }
            style={{ padding: "9px 20px" }}
          >
            {this.state.loading ? "Reseting..." : "Reset"}
          </Button>
        </form>
        <hr />
        <div className="text-muted small prose">
          {"Generate new reset token: "}
          <Link to="/reset">
            Reset <i className="fas fa-arrow-right" aria-hidden="true"></i>
          </Link>
          <br />
        </div>
        <div className="text-muted small prose">
          {"Return to login page: "}
          <Link to="/login">
            Login <i className="fas fa-arrow-right" aria-hidden="true"></i>
          </Link>
          <br />
        </div>
      </div>
    );
  }
}

class Reset extends React.Component {
  state = {
    username: "",
    newPassword: "",
  };

  render() {
    const resetToken = getParameterByName("resetToken");
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
              {resetToken ? (
                <ResetPassword resetToken={resetToken} {...this.props} />
              ) : (
                <RequestToken />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Reset;
