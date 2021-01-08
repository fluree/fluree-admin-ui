import React from "react";
import { Modal, Alert, Table } from "react-bootstrap";
import TransactEditor from "./PermissionsEditor";
import { generateKeyPair, getSinFromPublicKey } from "@fluree/crypto-utils";
import { convertArrayOfObjectsToCSV } from "../util";

export class GenerateKeysModal extends React.Component {
  state = {};

  handleClose() {
    this.props.toggleGenerateKeysModal();
  }

  componentDidMount() {
    this.generateKeys();
  }

  generateKeys = () => {
    const { publicKey, privateKey } = generateKeyPair();
    const authId = getSinFromPublicKey(publicKey);

    const tx = [{ _id: "_auth", id: authId, roles: [["_role/id", "root"]] }];

    this.setState({
      publicKey: publicKey,
      privateKey: privateKey,
      authId: authId,
      tx: tx,
      loading: false,
    });
  };

  downloadKeys() {
    let data = [
      {
        "Public Key": this.state.publicKey,
        "Private Key": this.state.privateKey,
        "Auth Id": this.state.authId,
      },
    ];

    let csv = convertArrayOfObjectsToCSV({ data: data });
    if (csv === null) return;

    var hiddenElement = document.createElement("a");
    hiddenElement.href = "data:text/csv;charset=utf-8," + csv;
    hiddenElement.target = "_blank";
    hiddenElement.download = "keys.csv";
    hiddenElement.click();
  }

  render() {
    return (
      <Modal show={true} onHide={this.handleClose.bind(this)}>
        <Modal.Header closeButton style={{ paddingBottom: "0px" }}>
          <Modal.Title style={{ fontSize: "20px", fontWeight: "lighter" }}>
            <i className="fas fa-key" /> &nbsp; <i className="fas fa-key" />{" "}
            &nbsp; Generate Keys
            <hr style={{ marginBottom: "0px" }} />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.state.loading &&
          !this.state.publicKey &&
          !this.state.privateKey &&
          !this.state.authId ? (
            <div className="loading1" />
          ) : (
            <div>
              <div className="row">
                <div className="col-sm-12">
                  <h3>Managing Your Public and Private Keys</h3>
                  <br />
                  <ul>
                    <li>
                      Please{" "}
                      <strong>
                        {" "}
                        <a
                          style={{ cursor: "pointer" }}
                          onClick={() => this.downloadKeys()}
                        >
                          save your public and private keys{" "}
                        </a>
                      </strong>
                      . This is the only time you will be able to view them
                      through the user interface.
                    </li>
                    <br />
                    <li>
                      In order to connect your key pair to an auth record,
                      please <strong>submit the below transaction</strong>. By
                      default, the below transaction will connect the new auth
                      record to the root role, but this can be modified.
                    </li>
                  </ul>
                  <br />
                </div>
              </div>
              <div className="row">
                <div className="col-sm-1" />
                <div className="col-sm-9">
                  <br />
                  <Table
                    striped
                    bordered
                    condensed
                    hover
                    style={{ tableLayout: "fixed" }}
                  >
                    <tbody>
                      <tr>
                        <td>Public Key</td>
                        <td style={{ wordWrap: "break-word" }}>
                          {this.state.publicKey}
                        </td>
                      </tr>
                      <tr>
                        <td>Private Key</td>
                        <td style={{ wordWrap: "break-word" }}>
                          {this.state.privateKey}
                        </td>
                      </tr>
                      <tr>
                        <td>Auth ID</td>
                        <td style={{ wordWrap: "break-word" }}>
                          {this.state.authId}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                  <br />
                </div>
                <div className="col-sm-2" />
              </div>
              <br />
              <div className="row">
                <div className="col-sm-12">
                  <TransactEditor value={this.state.tx} _db={this.props._db} />
                  {this.state.error ? (
                    <Alert bsStyle="danger">
                      <h4>Error</h4>
                      <p>{this.state.error}</p>
                    </Alert>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    );
  }
}
