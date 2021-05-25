import React, { Component } from "react";
import { FormGroup, Button } from "react-bootstrap";
import AceEditor from "react-ace";
import "brace/mode/json";
import "brace/theme/xcode";
import { flureeFetch } from "../flureeFetch";

class Editor extends Component {
  state = {
    value: JSON.stringify(this.props.value, null, 2),
    resultsFromTransaction: "Nothing transacted yet little fellow",
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({ value: JSON.stringify(nextProps.value, null, 2) });
  }

  onChange = (newValue) => {
    this.setState({ value: newValue });
  };

  transact = (transaction) => {
    this.setState({ loading: true });
    const { ip, db, token } = this.props._db;

    const fullDb = db.split("/");

    const opts = {
      endpoint: "transact",
      ip: ip,
      network: fullDb[0],
      db: fullDb[1],
      body: transaction,
      auth: token,
    };

    flureeFetch(opts)
      .then((res) => res.json || res)
      .then((res) => res.result || res)
      .then((res) => {
        console.log("response", res)
        this.props.fullRefresh(res);
        this.setState({resultsFromTransaction: JSON.stringify(res, null, 2)});
      })

      .catch((error) => {
        this.setState({ loading: false, response: error });
      });
  };

  render() {
    console.log("state in Permissions editor", this.state)
    return (
      <FormGroup>
        <div style={{ margin: "5px 40px 0px 20px" }}>
          <h2
            className="text-center"
            style={{
              padding: "2px",
              color: "#8e8989",
              fontFamily: "Open Sans",
            }}
          >
            Transaction
          </h2>
          <AceEditor
            mode="json"
            theme="xcode"
            name="user-transaction"
            fontSize={14}
            showPrintMargin={true}
            showGutter={true}
            onChange={this.onChange}
            width={"90%"}
            height={"150px"}
            highlightActiveLine={true}
            value={this.state.value}
            editorProps={{ $blockScrolling: true }}
            setOptions={{
              showLineNumbers: true,
              tabSize: 2,
            }}
          />
          <div style={{ width: "90%" }} className="text-right">
            <Button
              bsStyle="success"
              className="mt10 text-right"
              onClick={() => {
                this.transact(JSON.parse(this.state.value));
              }}
            >
              <i className="far fa-edit permission-icon-small" />
              Transact!
            </Button>
          </div>
          <div className="mt10">
            <h2
              className="text-center"
              style={{
                padding: "2px",
                color: "#8e8989",
                fontFamily: "Open Sans",
              }}
            >
              Results
            </h2>
            <AceEditor
              mode="json"
              theme="xcode"
              name="user-transaction"
              fontSize={14}
              showPrintMargin={true}
              showGutter={true}
              width={"90%"}
              height={"150px"}
              highlightActiveLine={true}
              value={this.state.resultsFromTransaction}
              editorProps={{ $blockScrolling: true }}
              setOptions={{
                showLineNumbers: true,
                tabSize: 2,
              }}
            />
          </div>
        </div>
      </FormGroup>
    );
  }
}

export default Editor;
