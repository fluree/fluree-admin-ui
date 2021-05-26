import React from "react";
import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  Modal,
  Checkbox,
} from "react-bootstrap";

class ConfigModal extends React.Component {
  state = {
    show: this.props.showConfig
  };

  handleClose = () => {
    this.setState({ show: false });
    this.props.setShowConfig()
  };

 
  componentDidMount() {
    if (this.props._db) {
      let { ip, openApiServer, defaultPrivateKey } = this.props._db;

      this.setState({
        ip: ip,
        openApiServer: openApiServer,
        defaultPrivateKey: defaultPrivateKey,
      });
    }
  }

  submitAndDismiss = () => {
    let { ip, defaultPrivateKey } = this.state;
    if (ip.substr(-1) === "/") {
      ip = ip.substr(0, ip.length - 1);
    }
    this.props.setConfig(ip, defaultPrivateKey);
  };

  getValidateDefaultPrivateKey = () => {
    if (this.state.defaultPrivateKey) {
      return false;
    } else {
      return true;
    }
  };

  render() {
    const error = this.props.error;
    let message;
    if (error !== undefined && error !== null) {
      message =
        error.message || error.error || "No Message Provided with Error.";
    }
  
    return (
      <div className="static-modal">
        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>
              {this.props.error ? <h1>{message}</h1> : <h1>Config Settings</h1>}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.props.error ? (
              <div>
                <div
                  className="row"
                  style={{
                    margin: "20px 0 25px",
                    border: "3px outset #d68484",
                    padding: "10px",
                    backgroundColor: "#ffeded",
                  }}
                >
                  <div className="col-sm-2">
                    <i style={{ fontSize: "35px" }} className="fas fa-wrench" />
                  </div>
                  <div className="col-sm-10">
                    Unable to communicate with server at: {this.state.ip}.
                    <br></br>
                    <br></br>
                    If you believe this error to have been caused by an
                    incorrect IP address or URL, you can change it below.
                  </div>
                  <br />
                </div>
              </div>
            ) : null}
            <Form onSubmit={this.submitAndDismiss}>
              <FormGroup>
                <ControlLabel>Target Server URL</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.ip}
                  onChange={(e) => this.setState({ ip: e.target.value })}
                />
              </FormGroup>

              {this.state.openApiServer === null ? null : (
                <FormGroup>
                  <ControlLabel>Default Private Key</ControlLabel>
                  <FormControl
                    type="text"
                    value={this.state.defaultPrivateKey}
                    placeholder="Default Private Key"
                    onChange={(e) =>
                      this.setState({ defaultPrivateKey: e.target.value })
                    }
                  />
                </FormGroup>
              )}
              <Button
                disabled={
                  this.state.openApiServer === false &&
                  this.getValidateDefaultPrivateKey()
                }
                className="buttonPurple"
                type="submit"
              >
                Set Config
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default ConfigModal;
