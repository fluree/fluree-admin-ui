import React from "react";
import { Panel, ListGroup, ListGroupItem } from "react-bootstrap";

export class History extends React.Component {
  closeHistory(e) {
    e.preventDefault();
    this.props.toggleHistory();
  }

  render() {
    const { history, loadHistoryItem, styles, historyType } = this.props;

    const historyHeight = this.props.height;
    const panelHeader = <span>History</span>;
    const arrayOfHistoryToDisplay = history.filter((item) => {
      return item.action === historyType;
    });

    return (
      <div
        id="historyBar"
        className="col-xs-3 bring-forward"
        style={{ height: this.props.height + "px", padding: 0 }}
      >
        <Panel>
          <Panel.Heading onClick={this.closeHistory.bind(this)}>
            {panelHeader}
          </Panel.Heading>
          <ListGroup
            fill
            style={{ overflowY: "auto", height: historyHeight + "px" }}
          >
            {arrayOfHistoryToDisplay.map((item, idx) => {
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
                    {item.action}: &nbsp;&nbsp;&nbsp;{item.type}
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
