import React, { useEffect, useState } from "react";
import NetworkScreenCard from "../components/NetworkScreenCard";
import { Form, FormGroup, ControlLabel } from "react-bootstrap";

export default function NetworkDashboard({ _db }) {
  const Capitalize = (word) => {
    return word[0].toUpperCase() + word.substring(1).toLowerCase();
  };

  const networkData = _db.networkData;

  const { index, leader, raft, id, commit, term } = networkData;
  const serverStatusObject = networkData["svr-state"];

  const timeOut = networkData["timeout-ms"];
  const { networks, version } = raft;

  const tranxQueue = raft["cmd-queue"];
  const arrayOfNetworks = networks.map((item) => Object.keys(item)[0]);
  const numberOfNetworks = arrayOfNetworks.length;
  const newDbQueue = raft["new-db-queue"];
  const currentNetwork = _db.db.split("/")[0];
  const [selectedNetwork, setSelectedNetwork] = useState(currentNetwork);

  const currentNetworkDataObject = networks.filter(
    (item) => item[selectedNetwork]
  )[0][selectedNetwork]["dbs"];
  const currentNetworkDbsArray = Object.keys(currentNetworkDataObject);

  const currentNetworkDbsTableBody = currentNetworkDbsArray.map((item) => {
    return {
      db: `${selectedNetwork}/${item}`,
      status: currentNetworkDataObject[item]["status"],
      block: currentNetworkDataObject[item]["block"],
    };
  });

  const numberOfTranxInQueue = tranxQueue
    .filter((item) => {
      return selectedNetwork === Object.keys(item)[0];
    })
    .map((item) => item[selectedNetwork])[0];

  const numberOfNewDbInQueue = newDbQueue
    .filter((item) => {
      return selectedNetwork === Object.keys(item)[0];
    })
    .map((item) => item[selectedNetwork])[0];

  const serverStatusTableHeadings = ["Server", "Status"];
  const tableHeadings = ["Ledgers", "Status", "Block"];
  const renderTableHeader = (tableHeadings) => {
    return tableHeadings.map((key, index) => {
      return (
        <th style={{ textAlign: "center" }} key={index}>
          {key}
        </th>
      );
    });
  };

  const renderServerStatusTable = (arrayServerStatusObject) => {
    return arrayServerStatusObject.map((rowData) => {
      return (
        <tr>
          <td className="table-content-centered Block">{rowData.id}</td>
          <td className="table-content-centered ">
            {rowData["active?"] ? "Active" : "Inactive"}
          </td>
        </tr>
      );
    });
  };

  const renderNetworkDbsTable = (arrayOfNetworksDBs) => {
    return arrayOfNetworksDBs.map((rowData) => {
      return (
        <tr>
          <td className="table-content-centered Block">{rowData.db}</td>

          <td className="table-content-centered">
            {rowData.status.toUpperCase()}
          </td>
          <td className="table-content-centered">{rowData.block}</td>
        </tr>
      );
    });
  };

  return (
    <div className="network-page-wrapper" style={{ textAlign: "center" }}>
      <Form style={{ marginTop: "20px", textAlign: "left", paddingLeft: "2%" }}>
        <FormGroup>
          <ControlLabel style={{ marginRight: "4px" }}>Network:</ControlLabel>
          <select
            value={selectedNetwork}
            onChange={(e) => setSelectedNetwork(e.target.value)}
            style={{
              marginLeft: "10px",
              borderRadius: "20px",
              border: "none",
              padding: "2px 4px",
              color: "#13C6FF",
              fontWeight: "bold",
            }}
            placeholder={"Select Network"}
          >
            <option>Select Network</option>
            {arrayOfNetworks.map((item) => (
              <option value={item}>{item}</option>
            ))}
          </select>
        </FormGroup>
      </Form>

      <div className="network-page-main-content-wrapper">
        <div className="network-page-general-info">
          <div className="network-page-general-info-row">
            <div className="network-page-general-info-row-item">
              <NetworkScreenCard
                value={numberOfNetworks}
                name={"Networks"}
                tooltipText="Number of networks present"
              />
            </div>
            <div className="network-page-general-info-row-item">
              <NetworkScreenCard
                value={leader}
                name={"Leader"}
                tooltipText={"Server providing the status"}
              />
            </div>
          </div>
          <div className="network-page-general-info-row">
            <div className="network-page-general-info-row-item">
              <NetworkScreenCard
                value={index}
                name={"Index"}
                tooltipText={"Latest index of Server providing status"}
              />
            </div>
            <div className="network-page-general-info-row-item">
              <NetworkScreenCard
                value={term}
                name={"Term"}
                tooltipText={"Latest term in cycle"}
              />
            </div>
          </div>
          <div className="network-page-general-info-row">
            <div className="network-page-general-info-row-item">
              <NetworkScreenCard
                value={numberOfTranxInQueue ? numberOfTranxInQueue : 0}
                name={"Pending Transactions"}
                tooltipText={"Number of Transactions in queue"}
              />
            </div>
            <div className="network-page-general-info-row-item">
              <NetworkScreenCard
                value={numberOfNewDbInQueue}
                name={"Pending Ledgers"}
                tooltipText={"Number of pending new ledgers"}
              />
            </div>
          </div>
        </div>
        <div className="network-page-table-wrapper">
          <div style={{ paddingTop: "20px" }}>
            <div>
              <h3 style={{ padding: "5px", textAlign: "left" }}>
                Server Status
              </h3>
              <div
                id="scroll-div-container"
                className="network-page-table-container"
              >
                <table
                  className="block-table block-table-stripes"
                  striped
                  bordered
                  hover
                  size="sm"
                >
                  <thead style={{ padding: "15px" }}>
                    {renderTableHeader(serverStatusTableHeadings)}
                  </thead>
                  <tbody>{renderServerStatusTable(serverStatusObject)}</tbody>
                </table>
              </div>
            </div>
          </div>
          <div style={{ paddingTop: "20px" }}>
            <div>
              <h3 style={{ padding: "5px", textAlign: "left" }}>
                Ledgers In{" "}
                <span style={{ color: "#13c6ff" }}>
                  <em>"{selectedNetwork}"</em>
                </span>{" "}
                Network
              </h3>
              <div className="network-page-table-container">
                <table
                  className="block-table block-table-stripes"
                  striped
                  bordered
                  hover
                  size="sm"
                >
                  <thead style={{ padding: "15px" }}>
                    {renderTableHeader(tableHeadings)}
                  </thead>
                  <tbody>
                    {renderNetworkDbsTable(currentNetworkDbsTableBody)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
