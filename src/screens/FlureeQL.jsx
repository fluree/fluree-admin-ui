import React from "react";
import get from "lodash.get";
import {
  Button,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  FormGroup,
} from "react-bootstrap";
import "brace";
import AceEditor from "react-ace";
import SplitPane from "react-split-pane";
import "brace/mode/json";
import "brace/theme/xcode";
import "brace/mode/sparql";
import hopscotch from "hopscotch";
import { signQuery } from "@fluree/crypto-utils";
import { getHost } from "../components/SignCommand";

import { GenerateKeysModal } from "../components/GenerateKeysModal";
import { History } from "../components/History";
import SignCommand from "../components/SignCommand";
import Footer from "../components/Footer";
import tour from "../components/Tour";

import { flureeFetch } from "../flureeFetch";
import {
  loadHistory,
  pushHistory,
  getLastHistory,
  getLastHistoryType,
  getLastHistoryAction,
} from "../util";
import { isCompositeType } from "graphql";

export class Editor extends React.Component {
  onChange(newValue) {
    const valueKey = this.props.valueKey;
    this.props.changeState(valueKey, newValue);
  }

  render() {
    const renderHeight = this.props.height + "px";
    const renderWidth = this.props.width + "px";
    return (
      <AceEditor
        mode={this.props.mode}
        height={renderHeight}
        theme="xcode"
        fontSize="14px"
        width="100%"
        highlightActiveLine={this.props.highlightActiveLine}
        readOnly={this.props.readOnly}
        showPrintMargin={false}
        showGutter={true}
        onChange={this.onChange.bind(this)}
        style={{ minHeight: "350px" }}
        name={this.props.editorName}
        value={this.props.value}
        editorProps={{ $blockScrolling: true }}
      />
    );
  }
}

class FlureeQL extends React.Component {
  state = {};

  componentDidMount() {
    let newState = this.getParamsFromProps(this.props);

    //let { action, txParam, queryParam } = this.checkURLAndOverrideParam();

    const historyOpenStatus = JSON.parse(localStorage.getItem("historyOpen"));

    newState["historyOpen"] = historyOpenStatus ? true : false;

    this.setState(newState);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      this.props._db.db !== nextProps._db.db ||
      this.props._db.openApiServer !== nextProps._db.openApiServer
    ) {
      let newState = this.getParamsFromProps(nextProps);
      this.setState(newState);
    }
  }

  UNSAFE_componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));

    const { queryParam, txParam } = this.state;

    let queryParamStore =
      JSON.stringify(queryParam).length > 5000
        ? "Values greater than 5k are not saved in the admin UI."
        : queryParam;
    let txParamStore =
      JSON.stringify(txParam).length > 5000
        ? "Values greater than 5k are not saved in the admin UI."
        : txParam;

    localStorage.setItem(
      this.props._db.db.concat("_queryParam"),
      queryParamStore
    );
    localStorage.setItem(this.props._db.db.concat("_txParam"), txParamStore);
    localStorage.setItem(
      this.props._db.db.concat("_lastAction"),
      this.state.action
    );
  }

  changeQueryType(type) {
    let param = getLastHistoryType(this.state.history, type);
    if (param) {
      this.setState({ queryType: type, queryParam: param });
    } else if (type === "Multi-Query") {
      this.setState({
        queryType: type,
        queryParam: JSON.stringify(
          {
            collections: { select: ["*"], from: "_collection" },
            users: { select: ["*"], from: "_user" },
          },
          null,
          2
        ),
      });
    } else if (type === "History") {
      this.setState({
        queryType: type,
        queryParam: JSON.stringify(
          {
            history: [],
          },
          null,
          2
        ),
      });
    } else if (type === "Block") {
      this.setState({
        queryType: type,
        queryParam: JSON.stringify({ block: 1 }, null, 2),
      });
    } else if (type === "Query") {
      this.setState({
        queryType: type,
        queryParam: JSON.stringify(
          {
            select: ["*"],
            from: "_collection",
          },
          null,
          2
        ),
      });
    } else {
      this.setState({ queryType: type });
    }
  }

  checkURLAndOverrideParam() {
    const searchparam = new URLSearchParams(window.location.search);
    let action, txParam, queryParam;
    // if a db name is passed in url, and current selected db is different then we need to change
    if (searchparam.get("db") && this.props._db.db !== searchparam.get("db")) {
      this.props._db.changeDatabase(searchparam.get("db"));
    }

    // if query params, override defaults
    if (searchparam.get("query")) {
      action = "query";
      queryParam = searchparam.get("query");
    } else if (searchparam.get("transact")) {
      action = "transact";
      txParam = searchparam.get("transact");
    }
    return { action: action, txParam: txParam, queryParam: queryParam };
  }

  getParamsFromProps(props) {
    let sign = props._db.openApiServer ? false : true;
    const privateKey = props._db.defaultPrivateKey || "";
    const host = getHost(props._db.ip) || "";
    const history = loadHistory(props._db.db, "flureeQL") || [];
    const arrayOfQueryHistory = history.filter((item) => {
      return item.action === "query";
    });
    const lastItem = getLastHistory(arrayOfQueryHistory) || [];
    const newState = {
      sign: sign,
      host: host,
      privateKey: privateKey,
      history: history,
      action: "query",
    };
    newState["queryParam"] = lastItem
      ? lastItem.param
      : '{"select":["*"],"from":"_collection"}';
    return newState;
  }

  getQueryType(queryMap) {
    let keys = Object.keys(queryMap);

    if (keys.indexOf("history") !== -1) {
      return "History";
    } else if (keys.indexOf("select") !== -1) {
      return "Query";
    } else if (keys.indexOf("block") !== -1) {
      return "Block";
    }
    return "Multi-query";
  }

  updateDimensions() {
    this.setState({});
  }

  changeState(k, v) {
    var update = {};
    update[k] = v;
    this.setState(update);
  }

  handleResponse = (promise, action, db, history, param, queryType) => {
    if (JSON.stringify(param).length > 100000) {
      this.setState({
        results: JSON.stringify(
          [
            "Large transactions may take some time to process.",
            "Either wait or check the latest block for results.",
          ],
          null,
          2
        ),
      });
    }

    if (promise.status >= 400) {
      const { displayError } = this.props._db;
      const result = promise.message || promise;
      var formattedResult = JSON.stringify(result, null, 2);
      this.setState({ loading: false, results: formattedResult });
      displayError(result);
      return;
    }

    promise
      .then((res) => {
        if (res.status >= 400 || res.status === undefined) {
          const { displayError } = this.props._db;
          const result = res.message || res;
          var formattedResult = JSON.stringify(result, null, 2);
          this.setState({ loading: false, results: formattedResult });
          displayError(result);
          return;
        }

        let results = res.json || res;

        let fuel = res.headers.get("x-fdb-fuel") || results.fuel;
        let block = res.headers.get("x-fdb-block") || results.block;
        let time = res.headers.get("x-fdb-time") || results.time;
        let status = res.headers.get("x-fdb-status") || results.status;

        var formattedResult = JSON.stringify(
          results.result || results,
          null,
          2
        );

        const newHistory = pushHistory(
          db,
          history,
          action,
          param,
          results,
          queryType,
          "flureeQL"
        );
        const isBlockQuery = get(results, [0, "flakes"], null) ? true : false;
        if (isBlockQuery) {
          // attempt to put all flakes on a single line for transaction results
          formattedResult = formattedResult.replace(
            /\s{4}\[\n[^\]]+\]/g,
            function (a, b) {
              return "    " + a.replace(/[\s\n]+/g, " ");
            }
          );
        }
        this.setState({
          results: formattedResult,
          history: newHistory,
          loading: false,
          fuel: fuel,
          block: block,
          time: time,
          status: status,
        });
      })
      .catch((error) => {
        const { displayError } = this.props._db;
        const result = error.json || error;
        var formattedResult = JSON.stringify(result, null, 2);
        this.setState({ loading: false, results: formattedResult });
        displayError(result);
      });

    this.setState({ loading: true });
  };

  invoke = () => {
    let { action, queryParam, txParam, history, queryType } = this.state;
    const param = queryParam;
    let endpoint;
    if (action === "query" && queryType) {
      endpoint = queryType.toLowerCase();
    } else if (action === "query" && !queryType) {
      queryType = "query";
      endpoint = "query";
    } else {
      endpoint = action;
    }

    let parsedParam = JSON.parse(param);
    const { ip, db, token } = this.props._db;

    const fullDb = db.split("/");

    let queryParamStore =
      JSON.stringify(queryParam).length > 5000
        ? "Values greater than 5k are not saved in the admin UI."
        : queryParam;

    localStorage.setItem(db.concat("_queryParam"), queryParamStore);

    localStorage.setItem(db.concat("_lastAction"), this.state.action);
    localStorage.setItem(
      db.concat("_lastType"),
      action === "query" ? queryType : "transact"
    );

    let opts = {
      ip: ip,
      body: parsedParam,
      auth: token,
      network: fullDb[0],
      endpoint: endpoint,
      db: fullDb[1],
    };

    const res = flureeFetch(opts);

    this.handleResponse(res, action, db, history, param, queryType);
  };

  loadHistoryItem(item) {
    let newState = {
      action: item.action,
      queryParam: item.action === "query" ? item.param : this.state.queryParam,
    };

    if (item.type) {
      newState["queryType"] = item.type;
    }

    this.setState(newState);
  }

  signQuery = () => {
    let {
      privateKey,
      queryParam,
      queryType,
      action,
      history,
      host,
    } = this.state;
    const { ip, db } = this.props._db;
    const fullDb = db.split("/");
    let endpoint;

    const parsedParam = JSON.stringify(JSON.parse(queryParam));

    if (queryType) {
      endpoint = queryType.toLowerCase();
    } else {
      queryType = "query";
      endpoint = "query";
    }

    let queryParamStore =
      JSON.stringify(queryParam).length > 5000
        ? "Values greater than 5k are not saved in the admin UI."
        : queryParam;

    localStorage.setItem(db.concat("_queryParam"), queryParamStore);

    localStorage.setItem(db.concat("_lastAction"), this.state.action);

    const { headers, body } = signQuery(
      privateKey,
      parsedParam,
      queryType.toLowerCase(),
      host,
      db
    );

    const opts = {
      endpoint: endpoint,

      body: JSON.parse(queryParam),
      network: fullDb[0],
      db: fullDb[1],
      ip: ip,
      headers: headers,
    };

    this.handleResponse(
      flureeFetch(opts),
      action,
      db,
      history,
      queryParam,
      queryType
    );
  };

  toggleFeature = (feature) => {
    if (feature === "historyOpen") {
      const currentHistoryState = JSON.parse(localStorage.getItem(feature));
      let featureState = currentHistoryState;
      localStorage.setItem("historyOpen", JSON.stringify(!featureState));
      let newState = {};
      newState[feature] = !featureState;
      this.setState(newState);
    } else {
      let featureState = !get(this.state, feature);

      let newState = {};
      newState[feature] = featureState;
      this.setState(newState);
    }
  };

  toggleAction() {
    const newAction = this.state.action === "query" ? "transact" : "query";
    const lastHistory = getLastHistoryType(this.state.history, newAction);
    const queryParam =
      newAction === "transact"
        ? this.state.queryParam
        : this.state.queryParam || lastHistory;
    const txParam =
      newAction === "transact"
        ? this.state.txParam || lastHistory
        : this.state.txParam;

    this.setState({
      action: newAction,
      queryParam: queryParam,
      txParam: txParam,
    });
  }

  pushHistorySigned = (signedTxParam, resp) => {
    const newHistory = pushHistory(
      this.props._db.db,
      this.state.history,
      this.state.action,
      signedTxParam,
      resp,
      "transact",
      "flureeQL"
    );
    this.setState({ history: newHistory, txParam: signedTxParam });
  };

  prettify() {
    const currentParam =
      this.state.action === "query"
        ? this.state.queryParam
        : this.state.txParam;
    if (currentParam) {
      const newParam = JSON.stringify(JSON.parse(currentParam), null, 2);
      if (this.state.action === "query") {
        this.setState({ queryParam: newParam });
      } else {
        this.setState({ txParam: newParam });
      }
    }
  }

  queryTypes = ["Query", "Block", "Multi-Query", "History"];

  render() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const isSmall = windowWidth <= 500;
    const availHeight = windowHeight - 145.5;

    const historyOpen = this.state.historyOpen;

    const param = this.state.queryParam;

    const isLoading = this.state.loading || this.props._db.loading;

    return (
      <div style={{ width: "100%" }}>
        {this.state.generateKeysModal ? (
          <GenerateKeysModal
            {...this.props}
            toggleGenerateKeysModal={() =>
              this.toggleFeature("generateKeysModal")
            }
          />
        ) : null}
        <div className="row">
          {this.state.sign ? (
            <div
              style={{
                padding: "5px 10px",
                marginTop: "5px",
                color: "#091133",
                fontFamily: "Open Sans",
              }}
              className="mb10"
            >
              <div
                style={{
                  width: "62%",
                  display: "inline-block",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                }}
              >
                <h3 className="mb10">Private Key: </h3>
                <FormControl
                  style={{ borderRadius: "20px" }}
                  type="text"
                  name="type"
                  value={this.state.privateKey}
                  onChange={(e) =>
                    this.changeState("privateKey", e.target.value)
                  }
                />
              </div>
              <div
                style={{
                  width: "61%",
                  display: "inline-block",
                  paddingLeft: "20px",
                  paddingTop: "20px",
                }}
              >
                <h3 className="mb10">Host: </h3>
                <FormControl
                  style={{ borderRadius: "20px" }}
                  type="text"
                  name="type"
                  value={this.state.host}
                  onChange={(e) => this.changeState("host", e.target.value)}
                />
              </div>
              <Button
                className="fluree-rounded-button"
                style={{
                  marginLeft: "10px",

                  padding: "9px, 12px",
                }}
                disabled={isLoading}
                onClick={this.signQuery}
              >
                Sign Query&nbsp;
                <i id="play-transaction" className="fas fa-signature" />
              </Button>
            </div>
          ) : null}
        </div>
        <div
          className="fluree-page-button-wrapper"
          style={{ padding: "20px 10px 5px 20px" }}
        >
          <div className="fluree-page-button-wrapper-left">
            <Button
              className="fluree-rounded-button"
              style={{
                marginLeft: "0px",

                padding: "9px, 12px",
              }}
              bsSize="small"
              onClick={() => this.toggleFeature("generateKeysModal")}
            >
              Generate Keys
            </Button>
            <Button
              className="fluree-rounded-button"
              style={{
                display: "inline-block",
                marginLeft: "0px",

                padding: "9px, 12px",
              }}
              bsSize="small"
              onClick={() => this.toggleFeature("historyOpen")}
            >
              History
            </Button>

            <Button
              className="fluree-rounded-button"
              style={{
                marginLeft: "0px",
                padding: "9px, 12px",
              }}
              bsSize="small"
              onClick={this.prettify.bind(this)}
            >
              Prettify
            </Button>
            <Button
              className="fluree-rounded-button"
              style={{
                display: "inline-block",
                marginLeft: "0px",
                padding: "9px, 12px",
              }}
              bsSize="small"
              onClick={() => this.toggleFeature("sign")}
            >
              Sign
            </Button>
          </div>
          <div className="fluree-pageb-button-wrapper-center">
            <FormGroup style={{ display: "inline-block", marginBottom: "0" }}>
              <FormControl
                style={{
                  color: "#13C6FF",
                  borderRadius: "20px",
                  border: "solid 1px #13C6FF",
                }}
                componentClass="select"
                placeholder="Select Query Type"
                value={this.state.queryType}
                onChange={(e) => this.changeQueryType(e.target.value)}
              >
                {this.queryTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
          </div>
          <div className="fluree-page-button-wrapper-right">
            {this.state.sign ? null : (
              <Button
                style={{
                  marginLeft: "10px",
                  borderRadius: "100%",
                  backgroundColor: "#13C6FF",
                  border: "none",
                }}
                bsSize="small"
                bsStyle="primary"
                disabled={isLoading}
                onClick={this.invoke}
              >
                <i className="fas fa-play" />
              </Button>
            )}
          </div>
        </div>

        <div className="row" style={{ width: "100%" }}>
          {historyOpen ? (
            <History
              isSmall={isSmall}
              height={availHeight - 47}
              toggleHistory={() => this.toggleFeature("historyOpen")}
              loadHistoryItem={this.loadHistoryItem.bind(this)}
              history={this.state.history}
              historyType="query"
            />
          ) : null}
          <div
            className={historyOpen ? "col-xs-9" : "row"}
            style={{ padding: "0" }}
          >
            <div style={{ position: "relative", height: `${availHeight}px` }}>
              <SplitPane
                split="vertical"
                minSize="50%"
                defaultSize="50%"
                resizerStyle={{
                  width: "9px",
                  cursor: "col-resize",
                  height: `${availHeight}px`,
                }}
                style={{ marginLeft: "4%" }}
                defaultSize={parseInt(localStorage.getItem("splitPos"), 10)}
                onChange={(size) => localStorage.setItem("splitPos", size)}
              >
                <div
                  className="col-xs-6"
                  style={{
                    width: "100%",
                    padding: "0",
                    height: "100%",
                    backgroundColor: "#fff",
                    borderRadius: "10px",
                    padding: "20px",
                  }}
                >
                  <h2
                    style={{
                      color: "#000",
                      fontFamily: "Cooper Hewitt",
                      marginBottom: "15px",
                      marginBottom: "15px",
                    }}
                  >
                    {this.state.action === "query"
                      ? "FlureeQL"
                      : "FlureeQL Transaction"}
                  </h2>

                  <Editor
                    mode="json"
                    editorName="FlureeQL"
                    height={availHeight - 100}
                    showGutter={isSmall ? false : true}
                    value={param}
                    valueKey={"queryParam"}
                    highlightActiveLine={true}
                    readOnly={false}
                    changeState={this.changeState.bind(this)}
                  />
                </div>
                <div
                  className="col-xs-6"
                  style={{
                    width: "100%",
                    padding: "0",
                    height: "100%",
                    backgroundColor: "#fff",

                    padding: "20px",
                  }}
                >
                  <div className="results-header-wrapper">
                    <h2
                      style={{
                        color: "#000",
                        fontFamily: "Cooper Hewitt",
                        marginBottom: "15px",
                      }}
                    >
                      Results
                    </h2>
                    {this.state.fuel && (
                      <div className="results-header-wrapper-left-child">
                        <p style={{ padding: "0 5px 0 5px", color: "#091133" }}>
                          <b>Fuel Spent: </b>
                          {this.state.fuel}
                        </p>
                        <p style={{ padding: "0 5px 0 5px", color: "#091133" }}>
                          <b>Block: </b>
                          {this.state.block}
                        </p>
                        <p style={{ padding: "0 5px 0 5px", color: "#091133" }}>
                          <b>Status: </b>
                          {this.state.status}
                        </p>
                        <p style={{ padding: "0 5px 0 5px", color: "#091133" }}>
                          <b>Time: </b>
                          {this.state.time}
                        </p>
                      </div>
                    )}
                  </div>

                  <Editor
                    mode="json"
                    editorName="FlureeQLRes"
                    height={availHeight - 100}
                    showGutter={isSmall ? false : true}
                    value={this.state.results}
                    valueKey="results"
                    highlightActiveLine={false}
                    readOnly={true}
                    changeState={this.changeState.bind(this)}
                  />
                </div>
              </SplitPane>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default FlureeQL;
