import React from "react";
import moment from "moment";
import { flureeFetch } from "../flureeFetch";
import AceEditor from "react-ace";
import "brace/mode/json";
import "brace/theme/xcode";
import Footer from "../components/Footer";
import get from "lodash.get";
import { Table, DropdownButton, MenuItem } from "react-bootstrap";

class Row extends React.Component {
  state = { open: false };

  expandToggle() {
    this.setState({ open: !this.state.open });
  }

  render() {
    const log = this.props.log._source || {};
    const tsMoment = moment(log.instant);
    const timeStr = tsMoment.format("H:mm:ss");
    const logStringify = JSON.stringify(log);
    const statusColor = log.status && log.status < 300 ? "#1E8449" : "#A93226";

    if (this.state.open) {
      return (
        <tr style={{ cursor: "pointer" }} onClick={(e) => this.expandToggle()}>
          <td className="pall3">
            <i className="fas fa-caret-down" aria-hidden="true"></i>
          </td>
          <td className="text-right pall3" style={{ width: "250px" }}>
            {tsMoment.format("YYYY-MM-DD")}
            <br />
            {timeStr}
          </td>
          <td className="text-right pall3">
            <span style={{ color: statusColor }}>{log.status}</span>
          </td>
          <td colSpan="3" className="pall3">
            <AceEditor
              mode="json"
              theme="xcode"
              width="100%"
              height="200px"
              highlightActiveLine={this.props.highlightActiveLine}
              readOnly={true}
              showPrintMargin={false}
              showGutter={false}
              name="flureeLog"
              value={JSON.stringify(log, null, 2)}
              editorProps={{ $blockScrolling: true }}
            />
          </td>
        </tr>
      );
    } else {
      return (
        <tr style={{ cursor: "pointer" }} onClick={(e) => this.expandToggle()}>
          <td className="pall3">
            <i className="fas fa-caret-right" aria-hidden="true"></i>
          </td>
          <td className="text-right pall3" style={{ width: "350px" }}>
            {timeStr}
          </td>
          <td className="text-right pall3">
            <span style={{ color: statusColor }}>{log.status}</span>
          </td>
          <td className="pall3">{log.op}</td>
          <td className="pall3">{log.db}</td>
          <td className="pall3" style={{ whiteSpace: "nowrap" }}>
            {logStringify}
          </td>
        </tr>
      );
    }
  }
}

function loadLogs(options, account, token) {
  const opts = {
    endpoint: "logs",
    network: account,
    auth: token,
    body: options,
  };

  return flureeFetch(opts).then((res) => res.json || res);
}

class Stats extends React.Component {
  state = {
    logs: [],
    loading: true,
    limit: 25,
    selectedDb: null,
    selectedOp: null,
    selectedStatus: null,
    searchTerm: null,
  };

  newSearch(changedOpts) {
    const existingOpts = {
      limit: this.state.limit,
      fromIndex: this.state.fromIndex,
      selectedDb: this.state.selectedDb,
      selectedOp: this.state.selectedOp,
      selectedStatus: this.state.selectedStatus,
    };
    const newOpts = Object.assign(existingOpts, changedOpts);
    const { account } = this.props._db;
    loadLogs(
      {
        db: newOpts.selectedDb,
        limit: newOpts.limit,
        from: newOpts.fromIndex,
        operation: newOpts.selectedOp,
        status: newOpts.selectedStatus,
      },
      account,
      this.props.token
    ).then((resp) => {
      if (resp.status === 401) {
        this.props.logout();
      }

      let newLogs;
      if (this.state.logs && resp.result) {
        newLogs = resp.result;
      } else {
        newLogs = [];
      }

      const haveLatest = newLogs.length <= newOpts.limit;

      if (newLogs.length > 0) {
        this.setState({
          logs: newLogs,
          fromIndex: newOpts.limit + this.state.fromIndex,
          haveLatest: haveLatest,
          loading: false,
          lastLatest: moment().format("H:mm:ss"),
        });
      } else {
        this.setState({
          logs: newLogs,
          haveLatest: haveLatest,
          lastLatest: moment().format("H:mm:ss"),
          loading: false,
        });
      }
    });
    this.setState(Object.assign(newOpts, { loading: true }));
  }

  UNSAFE_componentWillMount() {
    const { account } = this.props._db;
    const token = this.props.token;
    const {
      selectedDb,
      selectedOp,
      selectedStatus,
      searchTerm,
      fromIndex,
      limit,
    } = this.state;

    loadLogs(
      {
        db: selectedDb,
        operation: selectedOp,
        status: selectedStatus,
        search: searchTerm,
        limit: limit,
        from: fromIndex,
      },
      account,
      token
    ).then((resp) => {
      if (resp.status === 401) {
        this.props.logout();
      }

      if (resp.status === 200) {
        const logs = resp.result;
        if (logs.length > 0) {
          this.setState({
            logs: logs,
            fromIndex: this.state.limit + this.state.fromIndex,
            haveLatest: true,
            haveOldest: logs.length < this.state.limit,
            loading: false,
            error: false,

            // latestId: logs[0].id,
            // latestTs: logs[0].timestamp,
            // oldestId: logs[logs.length - 1].id,
            // oldestTs: logs[logs.length - 1].timestamp,
            lastLatest: moment().format("H:mm:ss"),
          });
        } else {
          this.setState({
            logs: logs,
            haveLatest: true,
            haveOldest: true,
            loading: false,
            error: false,

            lastLatest: moment().format("H:mm:ss"),
          });
        }
      } else {
        this.props._db.setGlobalProps("error", resp);
        this.setState({ loading: false, error: true });
      }
      return;
    });
  }

  getLater() {
    const { limit, fromIndex } = this.state;
    const { db, account } = this.props._db;
    const token = this.props.token;
    const dbid = get(db, "db/id");
    loadLogs({ db: dbid, limit: limit, from: fromIndex }, account, token).then(
      (resp) => {
        if (resp.status === 401) {
          this.props.logout();
        }

        let newLogs;
        if (this.state.logs && resp.result) {
          newLogs = resp.result.concat(this.state.logs);
        } else {
          newLogs = [];
        }

        const haveLatest = newLogs.length <= this.state.limit;

        if (newLogs.length > 0) {
          this.setState({
            logs: newLogs,
            fromIndex: limit + fromIndex,
            haveLatest: haveLatest,
            loading: false,

            // latestId: newLogs[0].id,
            // latestTs: newLogs[0].timestamp,
            lastLatest: moment().format("H:mm:ss"),
          });
        } else {
          this.setState({
            logs: newLogs,
            haveLatest: haveLatest,
            lastLatest: moment().format("H:mm:ss"),
            loading: false,
          });
        }
      }
    );
    this.setState({ loading: true });
  }

  getBefore() {
    const { limit, fromIndex } = this.state;
    const { db, account } = this.props._db;
    const token = this.props.token;
    const dbid = get(db, "db/id");

    loadLogs(
      { dbid: dbid, limit: limit, from: fromIndex },
      account,
      token
    ).then((resp) => {
      if (resp.status === 401) {
        this.props.logout();
      }
      const newLogs = this.state.logs.concat(resp.result);
      const haveOldest = resp.result.length <= this.state.limit;

      this.setState({
        logs: newLogs,
        // oldestId: newLogs[newLogs.length - 1].id,
        // oldestTs: newLogs[newLogs.length - 1].timestamp,
        haveOldest: haveOldest,
        loading: false,
      });
    });
    this.setState({ loading: true });
  }

  render() {
    const { haveLatest, haveOldest } = this.state;
    const dbs = this.props._db.dbs;

    return (
      <div className="container">
        <div>
          <h3 style={{ display: "inline" }}>Db:&nbsp;</h3>
          <DropdownButton
            title={this.state.selectedDb || "All"}
            id="type-selection-dropdown"
          >
            {dbs.map((db) => (
              <MenuItem
                key={db}
                onClick={() => {
                  this.newSearch({ selectedDb: db === "All" ? null : db });
                }}
              >
                {db}
              </MenuItem>
            ))}
          </DropdownButton>
          <h3 style={{ display: "inline" }}>&nbsp;Status:&nbsp;</h3>
          <DropdownButton
            title={this.state.selectedStatus || "All"}
            id="type-selection-dropdown"
          >
            {["All", "OK", "Error"].map((status) => (
              <MenuItem
                key={status}
                onClick={() => {
                  this.newSearch({
                    selectedStatus: status === "All" ? null : status,
                  });
                }}
              >
                {status}
              </MenuItem>
            ))}
          </DropdownButton>
          <h3 style={{ display: "inline" }}>&nbsp;Operation:&nbsp;</h3>
          <DropdownButton
            title={this.state.selectedOp || "All"}
            id="type-selection-dropdown"
          >
            {["All", "query", "transact", "logs", "signin"].map((op) => (
              <MenuItem
                key={op}
                onClick={() => {
                  this.newSearch({ selectedOp: op === "All" ? null : op });
                }}
              >
                {op}
              </MenuItem>
            ))}
          </DropdownButton>
        </div>
        {!this.state.error ? (
          <Table responsive striped>
            <thead>
              <tr>
                <th>#</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
                <th>Db</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: "80%" }}>
              <tr
                style={{ cursor: "pointer" }}
                onClick={(e) => this.getLater()}
              >
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td className="pall3">
                  {haveLatest
                    ? "Caught up as of " + this.state.lastLatest + "... "
                    : null}{" "}
                  Check for new logs.{" "}
                  <i
                    className={
                      this.state.loading
                        ? "fas fa-spin fa-refresh"
                        : "fas fa-refresh"
                    }
                    aria-hidden="true"
                  ></i>
                </td>
              </tr>
              {this.state.logs.map((log) => (
                <Row key={log._id} log={log} />
              ))}
              {haveOldest ? null : (
                <tr
                  style={{ cursor: "pointer" }}
                  onClick={(e) => this.getBefore()}
                >
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="pall3">
                    Load More...{" "}
                    <i
                      className={
                        this.state.loading
                          ? "fas fa-spin fa-refresh"
                          : "fas fa-refresh"
                      }
                      aria-hidden="true"
                    ></i>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        ) : null}
        {/* <Footer account={this.props._db.account} /> */}
      </div>
    );
  }
}

export default Stats;
