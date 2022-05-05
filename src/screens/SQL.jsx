import React, { Component, Fragment } from "react";
import { Button, Panel, ListGroup, ListGroupItem } from "react-bootstrap";
import SplitPane from "react-split-pane";
import { flureeFetch } from "../flureeFetch";
import "brace";
import { loadHistory, pushHistory, getLastHistoryType } from "../util";
import { Editor } from "./FlureeQL";

class History extends Component {
  closeHistory(e) {
    e.preventDefault();
    this.props.toggleHistory();
  }

  render() {
    const { history, loadHistoryItem } = this.props;
    const historyHeight = this.props.height + 22;
    const panelHeader = <span>History</span>;

    return (
      <div
        id="historyBar"
        className="col-xs-3"
        style={{ height: `${this.props.height}px`, padding: 0 }}
      >
        <Panel>
          <Panel.Heading onClick={this.closeHistory.bind(this)}>
            {" "}
            {panelHeader}{" "}
          </Panel.Heading>
          <ListGroup
            fill
            style={{ overflowY: "auto", height: `${historyHeight}px` }}
          >
            {history.map((item, idx) => {
              return (
                <ListGroupItem
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    loadHistoryItem(item);
                  }}
                >
                  <div
                    className="text-uppercase"
                    style={{ fontSize: "75%", fontWeight: "bold" }}
                  >
                    {item.action}
                  </div>
                  <div style={{ fontSize: "75%" }}>
                    {item.param.substring(0, 60)}
                    &hellip;
                  </div>
                </ListGroupItem>
              );
            })}
          </ListGroup>
        </Panel>
      </div>
    );
  }
}

class SQL extends Component {
  constructor(props) {
    super(props);
    // check if query url search has a 'query' or 'transact' passed to it and set that for initial state if so.
    const searchparam = new URLSearchParams(window.location.search);
    // if a db name is passed in url, and current selected db is different then we need to change
    if (searchparam.get("db") && props._db.db !== searchparam.get("db")) {
      props._db.changeDatabase(searchparam.get("db"));
    }
    const history = loadHistory(this.props._db.db, "sql");
    const savedRes = localStorage.getItem(
      this.props._db.db.concat("_SQLResult")
    );
    let param = localStorage.getItem(this.props._db.db.concat("_SQLParam"));

    let result;
    // defaults
    param = param || getLastHistoryType(history, "SQL") || "";

    result = savedRes ? JSON.stringify(JSON.parse(savedRes), null, 2) : "";

    this.state = {
      param,
      history,
      results: result,
      loading: false,
      error: null,
    };
  }

  componentDidMount() {
    const historyOpenStatus = JSON.parse(
      localStorage.getItem("historyOpenSql")
    );
    const newState = {};
    newState.historyOpen = !!historyOpenStatus;
    this.setState(newState);
  }

  changeState(k, v) {
    const update = {};
    update[k] = v;
    this.setState(update);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props._db.db !== nextProps._db.db) {
      const history = loadHistory(nextProps._db.db, "SQL");
      const savedParam = localStorage.getItem(
        this.props._db.db.concat("_SQLParam")
      );
      const savedRes = localStorage.getItem(
        this.props._db.db.concat("_SQLResult")
      );

      this.setState({
        history,
        param: savedParam || getLastHistoryType(history, "SQL") || "",
        results: savedRes || "",
      });
    }
  }

  updateDimensions() {
    this.setState({});
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));

    const { param } = this.state;
    const paramStore =
      JSON.stringify(param).length > 5000
        ? "Values greater than 5k are not saved in the admin UI."
        : param;

    localStorage.setItem(this.props._db.db.concat("_SQLParam"), paramStore);
  }

  invoke() {
    const { param, history } = this.state;
    const { db, token, ip } = this.props._db;
    const fullDb = db.split("/");

    const parsedParam = param;

    const opts = {
      ip,
      endpoint: "sql",
      network: fullDb[0],
      ledger: fullDb[1],
      body: parsedParam,
      auth: token,
    };

    localStorage.setItem(
      this.props._db.db.concat("_SQLParam"),
      this.state.param
    );
    flureeFetch(opts)
      .then((response) => {
        const res = response.json || response;
        const formattedResult = JSON.stringify(res, null, 2);
        const newHistory = pushHistory(
          db,
          history,
          "query",
          param,
          response,
          "sql",
          "sql"
        );
        this.setState({
          results: formattedResult,
          history: newHistory,
          loading: false,
        });
      })
      .catch((error) => {
        const { displayError } = this.props._db;
        const result = error.json || error;
        const formattedResult = JSON.stringify(result, null, 2);
        this.setState({ loading: false, results: formattedResult });
        displayError(result);
      });

    this.setState({ loading: true });
  }

  toggleHistory() {
    const currentHistoryState = JSON.parse(
      localStorage.getItem("historyOpenSql")
    );

    localStorage.setItem(
      "historyOpenSql",
      JSON.stringify(!currentHistoryState)
    );
    const newState = {};
    newState.historyOpen = !currentHistoryState;
    this.setState(newState);
  }

  loadHistoryItem(item) {
    this.setState({
      param: item.param,
    });
  }

  render() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const isSmall = windowWidth <= 500;
    const availHeight = isSmall ? 500 : windowHeight - 145.5;
    const { historyOpen } = this.state;
    const { param } = this.state;
    const isLoading = this.state.loading || this.props._db.loading;
    const { openApiServer } = this.props._db;
    return (
      <>
        <div
          style={{ width: "100%", position: "relative", minHeight: "100vh" }}
        >
          {openApiServer ? (
            <div>
              <div
                className="sql-page-button-wrapper"
                style={{ padding: "20px 10px 5px 20px" }}
              >
                <Button
                  className="fluree-rounded-button"
                  style={{
                    display: "inline-block",
                    marginLeft: "20px",
                    padding: "2px 12px",
                    height: "26px",
                  }}
                  bsSize="small"
                  onClick={this.toggleHistory.bind(this)}
                >
                  History
                </Button>

                <Button
                  style={{
                    marginLeft: "10px",
                    borderRadius: "100%",
                    backgroundColor: "#13C6FF",
                    border: "none",
                    color: "white",
                    padding: "2px 12px",
                    height: "29px",
                  }}
                  bsSize="small"
                  bsStyle="primary"
                  onClick={this.invoke.bind(this)}
                  disabled={isLoading}
                >
                  <i id="play-transaction" className="fas fa-play" />
                </Button>
              </div>
              <div className="row" style={{ width: "100%" }}>
                {historyOpen ? (
                  <History
                    isSmall={isSmall}
                    height={availHeight - 70}
                    toggleHistory={this.toggleHistory.bind(this)}
                    loadHistoryItem={this.loadHistoryItem.bind(this)}
                    history={this.state.history}
                  />
                ) : null}
                <div
                  className={historyOpen ? "col-xs-9" : "row"}
                  style={{ padding: "0" }}
                >
                  <div
                    style={{ position: "relative", height: `${availHeight}px` }}
                  >
                    <SplitPane
                      split="vertical"
                      minSize="50%"
                      resizerStyle={{
                        width: "9px",
                        cursor: "col-resize",
                        height: `${availHeight}px`,
                      }}
                      style={{ marginLeft: "4%" }}
                      defaultSize={parseInt(
                        localStorage.getItem("splitPos"),
                        10
                      )}
                      onChange={(size) =>
                        localStorage.setItem("splitPos", size)
                      }
                    >
                      <div
                        className="col-xs-6"
                        style={{
                          width: "100%",
                          height: "100%",
                          backgroundColor: "#fff",
                          borderRadius: "10px",
                          padding: "20px",
                        }}
                      >
                        <h2
                          style={{
                            padding: "2px",
                            color: "#000",
                            fontFamily: "Cooper Hewitt",
                            marginBottom: "15px",
                          }}
                        >
                          SQL Query
                        </h2>
                        <Editor
                          mode="sql"
                          editorName="SQL"
                          height={availHeight - 100}
                          showGutter={!isSmall}
                          value={param}
                          valueKey="param"
                          highlightActiveLine
                          readOnly={false}
                          changeState={this.changeState.bind(this)}
                        />
                      </div>
                      <div
                        className="col-xs-6"
                        style={{
                          width: "100%",
                          height: "100%",
                          backgroundColor: "#fff",
                          borderRadius: "10px",
                          padding: "20px",
                        }}
                      >
                        <h2
                          style={{
                            padding: "2px",
                            color: "#000",
                            fontFamily: "copper Howeitt",
                            marginBottom: "15px",
                          }}
                        >
                          Results
                        </h2>
                        <Editor
                          mode="sql"
                          editorName="SQL"
                          height={availHeight - 100}
                          showGutter={!isSmall}
                          value={this.state.results}
                          valueKey="results"
                          highlightActiveLine={false}
                          readOnly
                          changeState={this.changeState.bind(this)}
                        />
                      </div>
                    </SplitPane>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center mt20">
              <h3>
                The SQL page is not currently available with a closed API.
              </h3>
            </div>
          )}
        </div>
      </>
    );
  }
}

export default SQL;
