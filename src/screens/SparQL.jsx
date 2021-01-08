import React, { Fragment } from "react";
import { flureeFetch } from "../flureeFetch";
import { Button, Panel, ListGroup, ListGroupItem } from "react-bootstrap";
import "brace";
import Footer from "../components/Footer";
import { loadHistory, pushHistory, getLastHistoryType } from "../util";
import { Editor } from "./FlureeQL";
import SplitPane from "react-split-pane";

class History extends React.Component {
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
        style={{ height: this.props.height + "px", padding: 0 }}
      >
        <Panel>
          <Panel.Heading onClick={this.closeHistory.bind(this)}>
            {" "}
            {panelHeader}{" "}
          </Panel.Heading>
          <ListGroup
            fill
            style={{ overflowY: "auto", height: historyHeight + "px" }}
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
                    {item.param.substring(0, 60)}&hellip;
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

class SparQL extends React.Component {
  constructor(props) {
    super(props);
    // check if query url search has a 'query' or 'transact' passed to it and set that for initial state if so.
    const searchparam = new URLSearchParams(window.location.search);
    // if a db name is passed in url, and current selected db is different then we need to change
    if (searchparam.get("db") && props._db.db !== searchparam.get("db")) {
      props._db.changeDatabase(searchparam.get("db"));
    }
    const history = loadHistory(this.props._db.db, "sparQL");
    const savedRes = localStorage.getItem(
      this.props._db.db.concat("_sparQLResult")
    );
    let param = localStorage.getItem(this.props._db.db.concat("_sparQLParam"));

    var result;
    param = param ? param : getLastHistoryType(history, "sparQL") || "";

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
      localStorage.getItem("historyOpenSparql")
    );
    let newState = {};
    newState["historyOpen"] = historyOpenStatus ? true : false;
    this.setState(newState);
  }
  changeState(k, v) {
    var update = {};
    update[k] = v;
    this.setState(update);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props._db.db !== nextProps._db.db) {
      const history = loadHistory(nextProps._db.db, "sparQL");
      const savedParam = localStorage.getItem(
        this.props._db.db.concat("_sparQLParam")
      );
      const savedRes = localStorage.getItem(
        this.props._db.db.concat("_sparQLResult")
      );

      this.setState({
        history: history,
        param: savedParam
          ? savedParam
          : getLastHistoryType(history, "sparQL") || "",
        results: savedRes ? savedRes : "",
      });
    }
  }

  updateDimensions() {
    this.setState({});
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));

    const { param } = this.state;
    let paramStore =
      JSON.stringify(param).length > 5000
        ? "Values greater than 5k are not saved in the admin UI."
        : param;

    localStorage.setItem(this.props._db.db.concat("_sparQLParam"), paramStore);
  }

  invoke = () => {
    const { param, history } = this.state;
    const { db, token, ip } = this.props._db;
    const fullDb = db.split("/");

    let parsedParam = param;

    const opts = {
      ip: ip,
      endpoint: "sparql",
      network: fullDb[0],
      db: fullDb[1],
      body: parsedParam,
      auth: token,
    };

    localStorage.setItem(
      this.props._db.db.concat("_sparQLParam"),
      this.state.param
    );
    flureeFetch(opts)
      .then((response) => {
        let res = response.json || response;
        var formattedResult = JSON.stringify(res, null, 2);
        const newHistory = pushHistory(
          db,
          history,
          "query",
          param,
          response,
          "sparQL",
          "sparQL"
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
        var formattedResult = JSON.stringify(result, null, 2);
        this.setState({ loading: false, results: formattedResult });
        displayError(result);
      });

    this.setState({ loading: true });
  };

  toggleHistory() {
    const currentHistoryState = JSON.parse(
      localStorage.getItem("historyOpenSparql")
    );

    localStorage.setItem(
      "historyOpenSparql",
      JSON.stringify(!currentHistoryState)
    );
    let newState = {};
    newState["historyOpen"] = !currentHistoryState;
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
    const historyOpen = this.state.historyOpen;
    const param = this.state.param;
    const isLoading = this.state.loading || this.props._db.loading;
    const openApiServer = this.props._db.openApiServer;
    return (
      <Fragment>
        <div
          style={{ width: "100%", position: "relative", minHeight: "100vh" }}
        >
          {/* 100vh keeps footer at the bottom of page */}
          {openApiServer ? (
            <div>
              <div
                className="sparql-page-button-wrapper"
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
                      defaultSize="50%"
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
                          padding: "0",
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
                          SPARQL Query
                        </h2>
                        <Editor
                          mode="sparql"
                          editorName="SPARQL"
                          height={availHeight - 100}
                          showGutter={isSmall ? false : true}
                          value={param}
                          valueKey="param"
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
                         
                          mode="sparql"
                          editorName="SPARQL"
                         
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
          ) : (
            <div className="text-center mt20">
              <h3>
                The SPARQL page is not currently available with a closed API.
              </h3>
            </div>
          )}
        </div>
      </Fragment>
    );
  }
}

export default SparQL;
