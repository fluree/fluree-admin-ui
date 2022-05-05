import React from "react";
import { Voyager } from "graphql-voyager";
import { flureeFetch } from "../flureeFetch";
import { buildClientSchema } from "graphql";
import { Button } from "react-bootstrap";

import "./voyager.css";

class Schema extends React.Component {
  state = {
    width: 0,
    height: 0,
    show: this.props.show,
    alertShown: false,
    displayAlert: false,
  };

  introspectionProvider = (query) => {
    const { ip, db, displayError, token } = this.props._db;
    const fullDb = db.split("/");

    const opts = {
      ip: ip,
      endpoint: "graphql",
      body: { query },
      network: fullDb[0],
      ledger: fullDb[1],
      auth: token,
    };
    return flureeFetch(opts)
      .then((res) => res.json || res)
      .then((res) => res.result || res)
      .catch((err) => displayError(err));
  };

  voyager = (<Voyager introspection={this.introspectionProvider} />);

  componentDidMount() {
    // Checks introspection results independently. Voyager does not display error if faulty schema.
    this.introspectionProvider(
      "\n  query IntrospectionQuery {\n    __schema {\n      queryType { name }\n      mutationType { name }\n      subscriptionType { name }\n      types {\n        ...FullType\n      }\n      directives {\n        name\n        description\n        locations\n        args {\n          ...InputValue\n        }\n      }\n    }\n  }\n\n  fragment FullType on __Type {\n    kind\n    name\n    description\n    fields(includeDeprecated: true) {\n      name\n      description\n      args {\n        ...InputValue\n      }\n      type {\n        ...TypeRef\n      }\n      isDeprecated\n      deprecationReason\n    }\n    inputFields {\n      ...InputValue\n    }\n    interfaces {\n      ...TypeRef\n    }\n    enumValues(includeDeprecated: true) {\n      name\n      description\n      isDeprecated\n      deprecationReason\n    }\n    possibleTypes {\n      ...TypeRef\n    }\n  }\n\n  fragment InputValue on __InputValue {\n    name\n    description\n    type { ...TypeRef }\n    defaultValue\n  }\n\n  fragment TypeRef on __Type {\n    kind\n    name\n    ofType {\n      kind\n      name\n      ofType {\n        kind\n        name\n        ofType {\n          kind\n          name\n          ofType {\n            kind\n            name\n            ofType {\n              kind\n              name\n              ofType {\n                kind\n                name\n                ofType {\n                  kind\n                  name\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"
    )
      .then((response) => {
        if (response.status === 400) {
          this.props._db.displayError(response);
          this.props.handleLaunchExplorerButton();
        } else {
          let resp = buildClientSchema(response.data);
          return resp;
        }
      })
      .catch((err) => {
        if (err.message) {
          err.message.replace(
            "Ensure that a full introspection query is used in order to build a client schema.",
            ""
          );
        } else if (err.json) {
          err = err.json;
        }
        this.props._db.displayError(err);
      });

    this.updateWindowDimensions();
    this.setState({ explorer: true });
    window.addEventListener("resize", () => this.updateWindowDimensions());
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({ show: nextProps.show });
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions);
  }

  updateWindowDimensions = () => {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
    if (
      (0 < window.innerWidth) &
      (window.innerWidth < 1000) &
      !this.state.alertShown &
      !this.state.displayAlert
    ) {
      this.setState({ displayAlert: true, alertShown: true });
    }
  };

  closeExplorer = () => {
    this.props.handleClose();
  };

  toggleAlert = () => {
    this.setState({ displayAlert: false });
  };

  render() {
    return (
      <div>
        {this.state.show ? (
          <div
            style={{
              backgroundColor: "white",
              width: this.state.width,
              height: this.state.height,
              position: "fixed",
              left: "0px",
              top: "0px",
              zIndex: 1000,
            }}
          >
            <div>
              <Button
                onClick={this.closeExplorer}
                bsStyle="primary"
                style={{
                  position: "fixed",
                  top: "50px",
                  left: this.state.width - 200 + "px",
                  zIndex: 1001,
                }}
              >
                Close Explorer
              </Button>
              {this.voyager}
              {this.state.displayAlert & (this.state.width < 1000) ? (
                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    zIndex: 1001,
                    height: this.state.height,
                    width: this.state.width,
                    left: "0px",
                    top: "0px",
                    position: "fixed",
                  }}
                >
                  <div
                    className="row"
                    style={{ paddingTop: this.state.height / 4 + "px" }}
                  >
                    <div className="col-sm-12" style={{ textAlign: "center" }}>
                      <h2>
                        This visualization is best viewed on larger screens.
                      </h2>
                      <Button bsStyle="primary" onClick={this.toggleAlert}>
                        Ok
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default Schema;
