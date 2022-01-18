import React from "react";
import {
  Form,
  Col,
  InputGroup,
  FormGroup,
  FormControl,
  DropdownButton,
  MenuItem,
  Button,
} from "react-bootstrap";
import get from "lodash.get";
import psl from "psl";

import { flureeFetch } from "../flureeFetch";
import { Editor } from "../screens/FlureeQL";

import { signQuery, signTransaction } from "@fluree/crypto-utils";

class SignCommand extends React.Component {
  state = {
    results: "",
    loading: false,
  };

  componentDidMount() {
    const { ip, db, openApiServer, defaultPrivateKey, token } = this.props._db;
    const param = this.props.param;
    const fullDb = db.split("/");

    const nonce = Math.ceil(Math.random() * 100);
    const expire = Date.now() + 180000;

    const auth = [];
    let parsedParam = { select: ["*"], from: "_auth" };

    let queryPromise;

    if (openApiServer) {
      const qOpts = {
        endpoint: "query",
        ip: ip,
        network: fullDb[0],
        db: fullDb[1],
        body: parsedParam,
        auth: token,
      };
      queryPromise = flureeFetch(qOpts);
    } else {
      const stringParam = JSON.stringify(parsedParam);
      const { headers, body } = signQuery(
        defaultPrivateKey,
        stringParam,
        "query",
        db
      );

      const qOptsSigned = {
        endpoint: "query",
        ip: ip,
        network: fullDb[0],
        db: fullDb[1],
        body: JSON.parse(body),
        headers: headers,
        auth: token,
      };

      queryPromise = flureeFetch(qOptsSigned);
    }

    queryPromise
      .then((response) => {
        let resp = response.json || response;
        resp = resp.result || resp;
        resp.forEach((r) => auth.push(r));
      })
      .then(() => {
        let chosenAuth = auth.length > 0 ? get(auth[0], "_auth/id") : null;
        this.setState({
          auth: auth,
          chosenAuth: chosenAuth,
          fuel: 1000000,
          tx: param,
          nonce: nonce,
          expire: expire,
          privateKey: defaultPrivateKey,
        });
      })
      .catch((error) => {
        const { displayError } = this.props._db;
        const result = error.json || error;
        var formattedResult = JSON.stringify(result, null, 2);
        this.setState({ loading: false, results: formattedResult });
        displayError(result);
      });
  }

  changeState(k, v) {
    var update = {};
    update[k] = v;
    this.setState(update);
  }

  submitCommand = () => {
    this.setState({ loading: true });

    const {
      ip,
      db,
      displayError,
      openApiServer,
      defaultPrivateKey,
      token,
    } = this.props._db;
    const { tx, chosenAuth, fuel, nonce, expire, privateKey } = this.state;

    const body = signTransaction(
      chosenAuth,
      db,
      expire,
      fuel,
      nonce,
      privateKey,
      tx
    );
    const fullDb = db.split("/");

    const opts = {
      endpoint: "command",
      body: body,
      ip: ip,
      network: fullDb[0],
      db: fullDb[1],
      auth: token,
    };

    flureeFetch(opts)
      .then(
        (res) => new Promise((resolve) => setTimeout(() => resolve(res), 1000))
      )
      .then((res) => {
        let resp = res.json || res;
        resp = resp.result || resp;
        this.props.pushHistory(tx, resp);
        const param = { select: ["*"], from: ["_tx/id", resp] };
        if (openApiServer) {
          const qOpenOpts = {
            ip: ip,
            network: fullDb[0],
            db: fullDb[1],
            endpoint: "query",
            body: param,
            auth: token,
          };
          return flureeFetch(qOpenOpts);
        } else {
          const stringParam = JSON.stringify(param);
          const { headers, body } = signQuery(
            defaultPrivateKey,
            stringParam,
            "query",
            db
          );

          const qClosedOpts = {
            ip: ip,
            network: fullDb[0],
            db: fullDb[1],
            endpoint: "query",
            body: JSON.parse(body),
            headers: headers,
            auth: token,
          };
          return flureeFetch(qClosedOpts);
        }
      })
      .then((res) => {
        let resp = res.json || res;
        resp.result || resp;
        const nonce = Math.ceil(Math.random() * 100);
        const expire = Date.now() + 180000;
        this.setState({
          loading: false,
          results: JSON.stringify(resp, null, 2),
          nonce: nonce,
          expire: expire,
        });
      })
      .catch((err) => {
        const nonce = Math.ceil(Math.random() * 100);
        const expire = Date.now() + 180000;
        this.setState(
          { loading: false, expire: expire, nonce: nonce },
          displayError(err)
        );
      });
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.param !== nextProps.param) {
      this.setState({ tx: nextProps.param });
    }
  }

  render() {
    const { availHeight, isSmall } = this.props;
    return (
      <div>
        <Form>
          <FormGroup controlId="type-edit">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-signature bg-success permission-icon-small mb10" />
              Type:
            </Col>
            <Col sm={7}>
              <FormGroup>
                <InputGroup>
                  <FormControl
                    type="text"
                    name="type"
                    value="tx"
                    placeholder="tx"
                    readOnly
                  />
                </InputGroup>
              </FormGroup>
            </Col>
          </FormGroup>

          <FormGroup controlId="db-edit">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-signature bg-success permission-icon-small mb10" />
              DB:
            </Col>
            <Col sm={7}>
              <FormGroup>
                <InputGroup>
                  <FormControl
                    type="text"
                    name="type"
                    value={this.props._db.db}
                    placeholder="Ledger"
                    readOnly
                  />
                </InputGroup>
              </FormGroup>
            </Col>
          </FormGroup>

          <FormGroup controlId="tx-edit">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-signature bg-success permission-icon-small mb10" />
              TX:
            </Col>
            <Col sm={7}>
              <FormGroup>
                <Editor
                  mode="json"
                  editorName="SignCommand"
                
                  height={availHeight / 3}
                  showGutter={isSmall ? false : true}
                  value={this.state.tx}
                  valueKey="tx"
                  highlightActiveLine={true}
                  readOnly={false}
                  changeState={this.changeState.bind(this)}
                />
              </FormGroup>
            </Col>
          </FormGroup>

          <FormGroup controlId="auth-edit">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-signature bg-success permission-icon-small mb10" />
              Auth:
            </Col>
            <Col sm={7}>
              <FormGroup className="text-left">
                <DropdownButton
                  title={this.state.chosenAuth ? this.state.chosenAuth : "Auth"}
                  id="auth-selection-dropdown"
                  style={{ marginLeft: "5px" }}
                >
                  {this.state.auth
                    ? this.state.auth.map((auth) => {
                        let authId = get(auth, "_auth/id", "No id");
                        authId = authId === "" ? "No id" : authId;

                        let authDoc = get(auth, "_auth/doc", "No doc");
                        authDoc = authDoc === "" ? "No doc" : authDoc;

                        return (
                          <MenuItem
                            key={get(auth, "_id")}
                            value={get(auth, "_id")}
                            onClick={() =>
                              this.changeState(
                                "chosenAuth",
                                get(auth, "_auth/id")
                              )
                            }
                          >
                            {authId}: {authDoc}
                          </MenuItem>
                        );
                      })
                    : null}
                </DropdownButton>
              </FormGroup>
            </Col>
          </FormGroup>

          <FormGroup controlId="fuel-edit">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-signature bg-success permission-icon-small mb10" />
              Max Fuel:
            </Col>
            <Col sm={7}>
              <FormGroup>
                <InputGroup>
                  <FormControl
                    type="number"
                    name="fuel"
                    value={this.state.fuel}
                    placeholder="1000000"
                    onChange={(e) => this.changeState("fuel", e.target.value)}
                  />
                </InputGroup>
              </FormGroup>
            </Col>
          </FormGroup>

          <FormGroup controlId="nonce-edit">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-signature bg-success permission-icon-small mb10" />
              Nonce:
            </Col>
            <Col sm={7}>
              <FormGroup>
                <InputGroup>
                  <FormControl
                    type="number"
                    name="nonce"
                    value={this.state.nonce}
                    placeholder="1000"
                    onChange={(e) => this.changeState("nonce", e.target.value)}
                  />
                </InputGroup>
              </FormGroup>
            </Col>
          </FormGroup>

          <FormGroup controlId="expire-edit">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-signature bg-success permission-icon-small mb10" />
              Expire:
            </Col>
            <Col sm={7}>
              <FormGroup>
                <InputGroup>
                  <div style={{ width: "90%" }}>
                    <FormControl
                      type="number"
                      name="expire"
                      value={this.state.expire}
                      readOnly={true}
                    />
                  </div>
                  <i
                    className="fas fa-sync-alt"
                    style={{
                      cursor: "pointer",
                      position: "absolute",
                      right: "30px",
                      zIndex: "100",
                      top: "12px",
                    }}
                    onClick={() =>
                      this.setState({ expire: Date.now() + 180000 })
                    }
                  ></i>
                </InputGroup>
              </FormGroup>
            </Col>
          </FormGroup>

          <FormGroup controlId="private-key-edit">
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-signature bg-success permission-icon-small mb10" />
              Private Key:
            </Col>
            <Col sm={7}>
              <FormGroup>
                <InputGroup>
                  <div style={{ width: "400px" }}>
                    <FormControl
                      type="text"
                      name="type"
                      value={this.state.privateKey}
                      onChange={(e) =>
                        this.changeState("privateKey", e.target.value)
                      }
                    />
                  </div>
                </InputGroup>
              </FormGroup>
            </Col>
          </FormGroup>
          <FormGroup>
            <Col sm={12} className="text-center mb20">
              <Button
                onClick={this.submitCommand}
                disabled={this.state.loading}
              >
                Submit
              </Button>
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="fas fa-signature bg-success permission-icon-small mb10" />
              Results:
            </Col>
            <Col sm={7}>
              <Editor
                height={availHeight / 3}
                showGutter={isSmall ? false : true}
                value={this.state.results}
                valueKey="tx"
                highlightActiveLine={true}
                readOnly={true}
              />
            </Col>
          </FormGroup>
        </Form>
      </div>
    );
  }
}

export default SignCommand;
