import React from "react";
import { render } from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import get from "lodash.get";
import asyncComponent from "./components/AsyncComponent";
import AppliedRoute from "./components/AppliedRoute";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ErrorModal from "./components/ErrorModal";
import ConfigModal from "./components/ConfigModal";
import Footer from "./components/Footer";

import "./theme/bootstrap.css";
import "./theme/custom.css";
import { flureeFetch, gateway } from "./flureeFetch";
import GraphQL from "./screens/GraphQL";

const FlureeQL = asyncComponent(() => import("./screens/FlureeQL"));
const Transact = asyncComponent(() => import("./screens/Transact"));
const SparQL = asyncComponent(() => import("./screens/SparQL"));
const SQL = asyncComponent(() => import("./screens/SQL"));
const Account = asyncComponent(() => import("./screens/Account"));
const Schema = asyncComponent(() => import("./screens/Schema"));
const ExploreDB = asyncComponent(() => import("./screens/ExploreDB"));
const NetworkDashboard = asyncComponent(() =>
  import("./screens/NetworkDashboard")
);

const NewSignUp = asyncComponent(() => import("./screens/NewSignUp"));
const NotFound = asyncComponent(() => import("./screens/NotFound"));
const Permissions = asyncComponent(() => import("./screens/Permissions"));
const Import = asyncComponent(() => import("./screens/Import"));

class Wrapper extends React.Component {
  state = {};

  componentDidMount() {
    const newState = {};

    const { token, account } = this.props;
    let nwStateIp = gateway();
    let nwStateParams = {
      endpoint: "nw-state",
      ip: nwStateIp,
      noRedirect: true,
    };

    const queryLanguage = localStorage.getItem("queryLanguage");
    
    if (queryLanguage) {
      newState["queryLanguage"] = queryLanguage;
      this.setState(newState);
    } else {
      newState["queryLanguage"] = "FlureeQL";
      localStorage.setItem("queryLanguage", "FlureeQL");
      this.setState(newState);
    }

    flureeFetch(nwStateParams)
      .then((response) => {
        let isOpenApi = response.json["open-api"];
        let openApiServerStatusShow = this.getOpenApiServerStatus();
        if (openApiServerStatusShow === undefined) {
          this.setOpenApiServerStatus(isOpenApi);
          openApiServerStatusShow = !isOpenApi;
        }

        this.setState({
          showServerOpenApiAlert: openApiServerStatusShow,
          openApiServer: isOpenApi,
          ip: nwStateIp,
          networkData: response.json,
        });

        // determine if need to display config
        const config = this.getConfig();
        if ((!config || !config.defaultPrivateKey) && !isOpenApi) {
          newState["showConfig"] = true;
        }

        // Determine whether or not to prompt for "default" private key
        let defaultPrivateKey;
        if (config !== false) {
          defaultPrivateKey = config.defaultPrivateKey;
        }
        if ((config === false || !config.defaultPrivateKey) && !isOpenApi) {
          newState["showConfig"] = true;
        }
        newState["ip"] = nwStateIp;
        newState["defaultPrivateKey"] = defaultPrivateKey;
        newState["account"] = "Fluree";
        
        this.setState(newState);
        console.log(this.state);
      })
      .catch((error) => {
        this.displayError(error);
      });

    const dbs = this.getDbs(newState["ip"], token);
    dbs.then((res) => {
      if (res instanceof Error) {
        newState["showConfig"] = true;
        newState["error"] = res;
        this.setState(newState);
        return;
      } else {
        let dbArray = [];
        res.map((database) => {
          dbArray.push(`${database[0]}/${database[1]}`);
        });
        newState["dbs"] = dbArray;

        if (res.length === 0) {
          newState["noDbs"] = true;
          this.setState(newState);
          return;
        } else if (res.length === 1) {
          newState["db"] = dbArray[0];
          localStorage.setItem("database", dbArray[0]);
          this.setState(newState);
        } else {
          // if multiple, see if there is a chosen + existing db...
          const potentialDefaultDb = localStorage.getItem("database");
          if (dbArray.includes(potentialDefaultDb)) {
            newState["db"] = potentialDefaultDb;
            this.setState(newState);
          } else {
            newState["db"] = dbArray[0];
            localStorage.setItem("database", dbArray[0]);
            this.setState(newState);
          }
        }
      }
    });
    ;
  }

  setOpenApiServerStatus = (openApiServerStatus) => {
    const config = {
      openApiServerStatusShow: openApiServerStatus ? false : true,
    };
    localStorage.setItem("openApiServerConfig", JSON.stringify(config));
  };

  getOpenApiServerStatus = () => {
    let config = localStorage.getItem("openApiServerConfig");
    config = JSON.parse(config);

    let openApiServerStatusShow = get(config, "openApiServerStatusShow");

    return openApiServerStatusShow;
  };

  dismiss = (key) => {
    const newState = {};
    newState[key] = null;
    if (key === "showConfig" || key === "displayError") {
      newState["error"] = null;
    }
    this.setState(newState);
  };

  displayError(error) {
    this.setState({ error: error });
  }

  displayConfig(error) {
    this.setState({ showConfig: true, displayError: false, error: error });
  }

  getConfig() {
    let config = localStorage.getItem("flureeConfig");
    config = JSON.parse(config);

    let ip = get(config, "ip");
    let defaultPrivateKey = get(config, "defaultPrivateKey");
    let openApiServerStatus = get(config, "openApiServerStatus");

    const configNotSet =
      ip === null ||
      ip === undefined ||
      defaultPrivateKey === undefined ||
      defaultPrivateKey === null;

    if (configNotSet) {
      return false;
    } else {
      return {
        ip: ip,
        defaultPrivateKey: defaultPrivateKey,
        openApiServerStatus: openApiServerStatus,
      };
    }
  }

  getDbs = (ip, auth) => {
    let opts = { ip: ip, auth: auth, endpoint: "dbs" };

    const dbs = flureeFetch(opts);

    if (dbs.status >= 400) {
      return dbs;
    }

    return dbs.then((response) => {
      if (response.json) {
        return response.json;
      }
      return response;
    });
  };

  setConfig = (ip, defaultPrivateKey, openApiServerStatus) => {
    let serverConfig = {
      ip: ip,
      defaultPrivateKey: defaultPrivateKey,
      openApiServerStatus: openApiServerStatus,
    };
    localStorage.setItem("flureeConfig", JSON.stringify(serverConfig));

    serverConfig["showConfig"] = false;
    serverConfig["error"] = null;

    this.setState(serverConfig, () => this.refreshDbs(ip));
  };

  changeDatabase(dbName) {
    localStorage.setItem("database", dbName);
    const account = dbName.substring(0, dbName.indexOf("."));
    this.setState({ db: dbName, account: account });
  }

  changeQueryLanguage(queryLang) {
    localStorage.setItem("queryLanguage", queryLang);
    this.setState({ queryLanguage: queryLang });
  }
  toggleshowServerOpenApiAlert() {
    this.setOpenApiServerStatus(true);
    let openApiServerStatusShow = this.getOpenApiServerStatus();
    this.setState({
      showServerOpenApiAlert: openApiServerStatusShow,
    });
  }
  refreshDbs() {
    const { ip } = this.state;
    const dbs = this.getDbs(ip, this.props.token);

    if (dbs.status >= 400) {
      this.setState({ error: dbs.message });
      return;
    }

    dbs.then((res) => {
      if (res instanceof Error) {
        this.setState({ showConfig: true, error: true });
        return;
      }

      let dbArray = [];
      res.map((database) => {
        dbArray.push(`${database[0]}/${database[1]}`);
      });

      if (res.length === 0) {
        this.setState({ dbs: dbArray, noDbs: true });
        return;
      } else if (res.length === 1) {
        localStorage.setItem("database", dbArray[0]);
        this.setState({ dbs: dbArray, db: dbArray[0], noDbs: false });
        return;
      } else {
        // if multiple, see if there is a chosen + existing db...
        const potentialDefaultDb = localStorage.getItem("database");
        if (dbArray.includes(potentialDefaultDb)) {
          this.setState({ dbs: dbArray, db: potentialDefaultDb });
        } else {
          localStorage.setItem("database", dbArray[0]);
          this.setState({ dbs: dbArray, db: dbArray[0], noDbs: false });
        }
      }
    });
  }

  render() {
    const dbs = this.state.dbs;

    var _db = {
      dbs: dbs,
      db: this.state.db,
      queryLanguage: this.state.queryLanguage,
      changeQueryLanguage: this.changeQueryLanguage.bind(this),
      displayConfig: this.displayConfig.bind(this),
      displayError: this.displayError.bind(this),
      dismissError: this.dismiss.bind(this),
      loading: this.state.loading,
      changeDatabase: this.changeDatabase.bind(this),
      refreshDbs: this.refreshDbs.bind(this),
      ip: this.state.ip,

      defaultPrivateKey: this.state.defaultPrivateKey,
      openApiServer: this.state.openApiServer,
      networkData: this.state.networkData,
    };

    if (dbs === undefined) {
      return (
        <div>
          {this.state.showConfig ? (
            <ConfigModal
              _db={_db}
              error={this.state.error}
              setConfig={this.setConfig.bind(this)}
            />
          ) : (
            "Loading...."
          )}
        </div>
      );
    } else {
      return (
        <div key={_db.db} className="container-fluid" style={{ width: "100%" }}>
          {this.state.showServerOpenApiAlert ? (
            <div
              className="row"
              style={{
                margin: "0",
                paddingRight: "5px",
                backgroundColor: "#F8D7DA",
                color: "#721C24",
                position: "relative",
              }}
            >
              <p
                style={{
                  paddingTop: "4px",
                  marginLeft: "35%",
                  marginRight: "35s%",
                }}
              >
                Fluree server is running with closed API. fdb-api-open is set to
                false in settings.
              </p>
              <p
                style={{
                  position: "absolute",
                  top: "0",
                  right: "0",
                  cursor: "pointer",
                  paddingRight: "4px",
                }}
                onClick={() => this.toggleshowServerOpenApiAlert()}
              >
                x
              </p>
            </div>
          ) : null}
          <div
            className="col-md-3 col-xs-1"
            style={{
              height: "100vh",
              padding: "0px",
              position: "fixed",
              margin: "0",
            }}
          >
            <Sidebar
              _db={_db}
              openApiServer={this.state.openApiServer}
              {...this.props}
              style={{ width: "100%", margin: "0" }}
            />
          </div>

          {this.state.error ? (
            <ErrorModal
              error={this.state.error}
              dismiss={this.dismiss.bind(this, "error")}
            />
          ) : null}
          {this.state.showConfig ? (
            <ConfigModal
              _db={_db}
              error={this.state.error}
              setConfig={this.setConfig.bind(this)}
            />
          ) : null}

          <div
            id="main-content-wrapper"
            className="col-md-9 col-xs-11"
            style={{ paddingLeft: "20px", height: "100%", overflowX: "hidden" }}
          >
            <div style={{ padding: "0px" }}>
              <Header _db={_db} {...this.props} />
            </div>
            {this.state.noDbs ? (
              <Switch>
                <AppliedRoute
                  props={this.props}
                  _db={_db}
                  path="/account"
                  component={Account}
                />
                <AppliedRoute
                  props={this.props}
                  _db={_db}
                  path="/"
                  component={Account}
                />
                <Route component={NotFound} />
              </Switch>
            ) : (
              <Switch>
                <AppliedRoute
                  props={this.props}
                  _db={_db}
                  path="/account"
                  component={Account}
                />
                <AppliedRoute
                  props={this.props}
                  _db={_db}
                  path="/flureeql"
                  component={FlureeQL}
                />
                <AppliedRoute
                  props={this.props}
                  _db={_db}
                  path="/transact"
                  component={Transact}
                />
                <AppliedRoute
                  props={this.props}
                  _db={_db}
                  path="/sparql"
                  component={SparQL}
                />
                <AppliedRoute
                  props={this.props}
                  _db={_db}
                  path="/sql"
                  component={SQL}
                />
                <AppliedRoute
                  props={this.props}
                  _db={_db}
                  path="/graphql"
                  component={GraphQL}
                />
                <AppliedRoute
                  props={this.props}
                  _db={_db}
                  path="/schema"
                  component={Schema}
                />
                <AppliedRoute
                  props={this.props}
                  _db={_db}
                  path="/exploredb"
                  component={ExploreDB}
                />
                <AppliedRoute
                  props={this.props}
                  _db={_db}
                  path="/networkdashboard"
                  component={NetworkDashboard}
                />
                <AppliedRoute
                  props={this.props}
                  _db={_db}
                  path="/permissions"
                  component={Permissions}
                />
                <AppliedRoute
                  props={this.props}
                  _db={_db}
                  path="/import"
                  component={Import}
                />

                <AppliedRoute
                  props={this.props}
                  _db={_db}
                  path="/"
                  component={Account}
                />
                <Route component={NotFound} />
              </Switch>
            )}
            <div className="row">
              <Footer />
            </div>
          </div>
        </div>
      );
    }
  }
}

class App extends React.Component {
  state = {
    message: "",
  };

  setMessage = (message) => {
    this.setState({ message: message });
  };

  render() {
    const childProps = {
      message: this.state.message,
      setMessage: this.setMessage,
    };

    return (
      <div style={{ height: "100vh" }}>
        <Router>
          <Route path="/" component={Wrapper} />
        </Router>
      </div>
    );
  }
}

render(<App />, document.getElementById("fluree-app"));
