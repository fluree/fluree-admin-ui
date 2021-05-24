import React, { Component, Fragment } from "react";
import SplitPane from "react-split-pane";
import AceEditor from "react-ace";
import Footer from "../components/Footer";
import JSONTree from "react-json-tree";
import Draggable from "react-draggable";
import ModalDialog from "react-bootstrap/lib/ModalDialog";
import { Tab, Tooltip, OverlayTrigger, Modal, Tabs } from "react-bootstrap";

import { flureeFetch } from "../flureeFetch";
import { pickBy, get } from "lodash";

class BlockInfoModal extends Component {
  renderTableHeader = (arrayOfHeadings) => {
    return arrayOfHeadings.map((key, index) => {
      return (
        <th style={{ textAlign: "center" }} key={index}>
          {key}
        </th>
      );
    });
  };
  renderTxnTableBody = (arrayOfTableData, block, align = "center") => {
    return arrayOfTableData.map((rowData) => {
      if (block == 1) {
        return (
          <tr style={{ textAlign: align }}>
            <td colSpan="4">Nothing Here</td>
          </tr>
        );
      } else {
        return (
          <tr style={{ textAlign: align }}>
            <td style={{ padding: "4px 0 4px 0" }}>{rowData.auth}</td>
            <td style={{ maxWidth: "100px" }}>
              {new Date(rowData.nonce).toLocaleString()}
            </td>
            <td
              style={{
                padding: "0",
                minWidth: "300px",
              }}
            >
              <textarea
                style={{
                  width: "100%",
                  margin: "0",
                  border: "none",
                  minHeight: "300px",
                }}
              >
                {JSON.stringify(rowData.tx, null, 2)}
              </textarea>
            </td>
            <td style={{ maxWidth: "100px" }}>
              {new Date(rowData.expire).toLocaleString()}
            </td>
          </tr>
        );
      }
    });
  };

  renderFlakesTableBody = (arrayToMap, align = "left") => {
    return arrayToMap.map((rowData, index) => {
      return (
        <tr>
          {rowData.map((item) => {
            return (
              <td
                style={{
                  textAlign: align,
                  minWidth: "150px",
                  wordWrap: "break-word",
                  maxWidth: "300px",
                }}
              >
                {JSON.stringify(item, null, 2)}
              </td>
            );
          })}
        </tr>
      );
    });
  };
  render() {
    const {
      block,
      flakesHeader,
      flakesBody,
      heading,
      transactionHeader,
      transactionBody,
    } = this.props;

    if (heading === "Transactions") {
      return (
        <Draggable>
          <Modal
            id="block-tnx-info-modal"
            show
            onHide={() => this.props.toggleBlockInfoModal()}
          >
            <Modal.Header closeButton>
              <Modal.Title
                style={{
                  fontSize: "20px",
                  fontWeight: "lighter",
                  textAlign: "center",
                }}
              >
                {heading} in Block {block}.
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="table-container">
                <table className="block-table" striped bordered hover size="sm">
                  <thead>{this.renderTableHeader(transactionHeader)}</thead>
                  <tbody>
                    {this.renderTxnTableBody(transactionBody, block)}
                  </tbody>
                </table>
              </div>
            </Modal.Body>
          </Modal>
        </Draggable>
      );
    } else {
      let withoutMetaData = flakesBody.map((item) => {
        return item.filter((itemNested) => itemNested != null);
      });
      return (
        <Draggable>
          <Modal
            id="block-flakes-info-modal"
            show
            onHide={() => this.props.toggleBlockInfoModal()}
          >
            <Modal.Header closeButton>
              <Modal.Title
                style={{
                  fontSize: "20px",
                  fontWeight: "lighter",
                  textAlign: "center",
                }}
              >
                {heading} in Block {block}.
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="table-container">
                <table className="block-table" bordered hover size="sm">
                  <thead>{this.renderTableHeader(flakesHeader)}</thead>
                  <tbody>{this.renderFlakesTableBody(withoutMetaData)}</tbody>
                </table>
              </div>
            </Modal.Body>
          </Modal>
        </Draggable>
      );
    }
  }
}

export default class ExploreDB extends Component {
  state = {
    openSmartFuncs: [],
    showCollectionDetails: false,
    showBlockDetails: false,
    flakesOpen: false,
    diff: 9,
    blockInfoModal: false,
    showSubjectHistory: false,
    showPredicateHistory: false,
    showHashValueModal: false,
    modalHashValue: "",
    itemType: "",
    showItemHistory: false,
  };

  schemaQuery = {
    collections: {
      select: ["*", { "_collection/spec": ["*"] }],
      from: "_collection",
    },
    predicates: {
      select: ["*", { "_predicate/spec": ["*"] }],
      from: "_predicate",
    },
  };

  start_ = /^_/;

  componentDidUpdate() {
    this.scrollToBottom();
  }
  componentDidMount() {
    const { ip, db, displayError, openApiServer, token, dbs } = this.props._db;
    const fullDb = db.split("/");

    const opts = {
      endpoint: "multi-query",
      ip: ip,
      network: fullDb[0],
      db: fullDb[1],
      body: this.schemaQuery,
      auth: token,
    };

    if (openApiServer) {
      flureeFetch(opts)
        .then((response) => {
          let res = response.json || response;
          res = res.result || res;
          const collections = res.collections;

          const predicates = res.predicates;
          const predicatesHeader = [
            "Name",
            "Type",
            "Unique",
            "Index",
            "Full Text",
            "Multi",
          ];
          const collectionsHeader = ["Name"];

          const collectionsWithMoreInfo = collections
            .filter((collection) => {
              return !this.start_.test(get(collection, "_collection/name"));
            })
            .map((collection) => {
              let collectionItem;
              if (!this.start_.test(get(collection, "_collection/name"))) {
                collectionItem = {
                  id: get(collection, "_id", null),
                  name: get(collection, "_collection/name", null),
                };
                return collectionItem;
              }
              return null;
            });

          const predicatesWithMoreInfo = predicates
            .filter((predicate) => {
              return !this.start_.test(get(predicate, "_predicate/name"));
            })
            .map((predicate) => {
              let predicateTx;
              if (!this.start_.test(get(predicate, "_predicate/name"))) {
                predicateTx = {
                  id: get(predicate, "_id", null),
                  name: get(predicate, "_predicate/name", null),
                  type: get(predicate, "_predicate/type", null),
                  unique: get(
                    predicate,
                    "_predicate/unique",
                    "false"
                  ).toString(),
                  multi: get(predicate, "_predicate/multi", "false").toString(),
                  index: get(predicate, "_predicate/index", "false").toString(),
                  fulltext: get(
                    predicate,
                    "_predicate/fullText",
                    "false"
                  ).toString(),
                };
                return predicateTx;
              }
              return null;
            });
          this.setState({
            collections: collections,
            predicates: predicatesWithMoreInfo,
            predicatesHeader: predicatesHeader,
            collectionsHeader: collectionsHeader,
            collectionsWithMoreInfo: collectionsWithMoreInfo,
          });
        })
        .catch((error) => {
          this.setState({ error: error });
        });
    }

    const optsForLedgerStats = {
      endpoint: "ledger-stats",
      ip: ip,
      network: fullDb[0],
      db: fullDb[1],
      auth: token,
    };

    if (openApiServer) {
      flureeFetch(optsForLedgerStats)
        .then((response) => {
          let res = response.json.data;

          this.setState({
            block: res.block,
          });
          this.getDatabaseBlocks();
        })
        .catch((error) => {
          displayError(error);
        });
    }

    this.scrollToBottom();
  }
  checkSpec = (functionMap, specs, specTx) => {
    specs.map((spec) => {
      let fnName = get(spec, "_fn/name", null);
      let fnId = get(spec, "_id", null);

      if (fnName === "true") {
        specTx.push(["_fn/name", "true"]);
      } else if (fnName === "false") {
        specTx.push(["_fn/name", "false"]);
      } else {
        // If function already in functionMap, just include _fn tempid in transaction
        let fnInMap = get(functionMap, fnId, null);
        if (fnInMap !== null) {
          specTx.push(fnInMap);
        } else {
          let fnTempid;
          if (String(fnId).search("_fn[^a-zA-Z]") !== -1) {
            fnTempid = fnId;
          } else {
            fnTempid = "_fn$" + fnId;
          }

          spec["_id"] = fnTempid;
          functionMap[fnId] = fnTempid;
          specTx.push(spec);
        }
      }
      return null;
    });

    return [functionMap, specTx];
  };

  scrollToBottom = () => {
    const { tableEndRef } = this.refs;
    tableEndRef &&
      tableEndRef.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
  };

  toggleCollection = () =>
    this.setState({
      collectionOpen: !this.state.collectionOpen,
    });
  togglePredicate = () =>
    this.setState({ predicateOpen: !this.state.predicateOpen });
  toggleSmartFunc = (e) => {
    const key = e.target.offsetParent.id;
    if (this.state.openSmartFuncs.includes(key)) {
      this.setState({
        openSmartFuncs: this.state.openSmartFuncs.filter((x) => x !== key),
      });
    } else {
      this.setState({
        openSmartFuncs: this.state.openSmartFuncs.concat(key),
      });
    }
  };

  toggleBlockInfoModal = () => {
    this.setState({
      blockInfoModal: !this.state.blockInfoModal,
    });
    this.getDatabaseBlocks();
  };

  toggleDisplayHashValueModal = (e, hash) => {
    this.setState({
      showHashValueModal: !this.state.showHashValueModal,
      modalHashValue: hash,
    });
  };
  toggleShowCollectionDetails = () => {
    this.setState({
      showCollectionDetails: !this.state.showCollectionDetails,
    });
  };

  toggleShowSubjectHistory = () => {
    this.setState({
      showSubjectHistory: !this.state.showSubjectHistory,
    });
  };
  toggleShowPredicateHistory = (type) => {
    this.setState({
      showPredicateHistory:
        type === "typePredicate"
          ? !this.state.showPredicateHistory
          : this.state.showPredicateHistory,
      showCollectionHistory:
        type === "typeCollection"
          ? !this.state.showCollectionHistory
          : this.state.showCollectionHistory,
    });
  };

  toggleShowItemHistory = () => {
    this.setState({
      showItemHistory: !this.state.showItemHistory,
    });
  };
  getSubjectHistory = (e) => {
    e.preventDefault();
    let id = parseInt(e.target.id);

    let schemaQuery = {
      history: id,
    };
    const { ip, db, displayError, openApiServer, token } = this.props._db;
    const fullDb = db.split("/");

    const opts = {
      endpoint: "history",
      ip: ip,
      network: fullDb[0],
      db: fullDb[1],
      body: schemaQuery,
      auth: token,
    };

    if (openApiServer) {
      flureeFetch(opts)
        .then((res) => {
          let subjectHistory = res.json || res;
          let subjectHistoryJSON = res.json || res;
          subjectHistoryJSON = subjectHistoryJSON.map((item) => ({
            block: item.block,
            flakes: item.flakes.map((item) => ({
              Subject: item[0],
              Predicate: item[1],
              Object: item[2],
              Time: item[3],
              Assertion: item[4],
            })),
            t: item.t,
          }))[0];
          let subjectHistoryStringify = JSON.stringify(subjectHistory, null, 2);
          subjectHistoryStringify = subjectHistoryStringify.replace(
            /\s{4}\[\n[^\]]+\]/g,
            function (a, b) {
              return "    " + a.replace(/[\s\n]+/g, " ");
            }
          );
          this.setState((prevState) => ({
            ...prevState,
            subjectHistoryStringify,
            showSubjectHistory: true,
            subjectID: id,
            subjectHistoryJSON,
          }));
        })
        .catch((error) => {
          this.setState({ error: error });
          displayError(error);
        });
    }
  };

  getPredicateHistory = (e, predicateName, predicateID, type) => {
    e.preventDefault();

    let schemaQuery = {
      history: predicateID,
    };
    const { ip, db, displayError, openApiServer, token } = this.props._db;
    const fullDb = db.split("/");

    const opts = {
      endpoint: "history",
      ip: ip,
      network: fullDb[0],
      db: fullDb[1],
      body: schemaQuery,
      auth: token,
    };

    if (openApiServer) {
      flureeFetch(opts)
        .then((res) => {
          // transactor returns history result in response.json
          // query server returns history result in response.json.result
          let predicateHistoryJSON = res.json || res;

          predicateHistoryJSON = predicateHistoryJSON.map((item) => ({
            block: item.block,
            flakes: item.flakes.map((item) => ({
              Subject: item[0],
              Predicate: item[1],
              Object: item[2],
              Time: item[3],
              Assertion: item[4],
            })),
            t: item.t,
          }))[0];

          let predicateHistoryStringify = JSON.stringify(
            predicateHistoryJSON,
            null,
            2
          );

          predicateHistoryStringify = predicateHistoryStringify.replace(
            /\s{4}\[\n[^\]]+\]/g,
            function (a, b) {
              return "    " + a.replace(/[\s\n]+/g, " ");
            }
          );

          this.setState((prevState) => ({
            ...prevState,
            predicateHistoryJSON,
            predicateHistoryStringify,
            showPredicateHistory: type === "typePredicate" ? true : false,
            selectedPredicate: predicateName,
            showCollectionHistory: type === "typeCollection" ? true : false,
          }));
        })
        .catch((error) => {
          this.setState({ error: error });
          displayError(error);
        });
    }
  };
  getItemHistory = (e, itemName, itemId, itemType) => {
    e.preventDefault();

    let schemaQuery = {
      history: itemId,
    };
    const { ip, db, displayError, openApiServer, token } = this.props._db;
    const fullDb = db.split("/");

    const opts = {
      endpoint: "history",
      ip: ip,
      network: fullDb[0],
      db: fullDb[1],
      body: schemaQuery,
      auth: token,
    };

    if (openApiServer) {
      flureeFetch(opts)
        .then((res) => {
          let itemHistoryJSON = res.json || res;

          itemHistoryJSON = itemHistoryJSON.map((item) => ({
            block: item.block,
            flakes: item.flakes.map((item) => ({
              Subject: item[0],
              Predicate: item[1],
              Object: item[2],
              Time: item[3],
              Assertion: item[4],
            })),
            t: item.t,
          }))[0];

          let itemHistoryStringify = JSON.stringify(itemHistoryJSON, null, 2);

          itemHistoryStringify = itemHistoryStringify.replace(
            /\s{4}\[\n[^\]]+\]/g,
            function (a, b) {
              return "    " + a.replace(/[\s\n]+/g, " ");
            }
          );

          this.setState((prevState) => ({
            ...prevState,
            itemHistoryJSON,
            itemHistoryStringify,
            showItemHistory: true,
            itemSelected: itemName,
            itemType: itemType,
          }));
        })
        .catch((error) => {
          this.setState({ error: error });
          displayError(error);
        });
    }
  };
  generateTransactionForMoreInfo = (collection, id) => {
    let schemaQuery = {
      predicateDetails: {
        select: ["*"],
        from: collection,
      },
      predicates: {
        select: {
          "?collection-predicates": ["_predicate/name"],
        },
        where: [["?collection-predicates", "_predicate/name", "?field"]],
        filter: [`(re-find (re-pattern \"^${collection}\") ?field)`],
      },
    };
    const { ip, db, displayError, openApiServer, token } = this.props._db;
    const fullDb = db.split("/");

    const opts = {
      endpoint: "multi-query",
      ip: ip,
      network: fullDb[0],
      db: fullDb[1],
      body: schemaQuery,
      auth: token,
    };

    if (openApiServer) {
      flureeFetch(opts)
        .then((response) => {
          let res = JSON.stringify(response.json, null, 2) || response;
          let moreDetails = JSON.parse(res).predicateDetails;

          let predicatesFromResponse = JSON.parse(res).predicates.map(
            (item) => item["_predicate/name"]
          );
          let predicatesWithID = ["_id", ...predicatesFromResponse];

          this.setState({
            showCollectionDetails: !this.state.showCollectionDetails,
            moreDetails: moreDetails,
            predicatesWithID: predicatesWithID,
            currentIDToDisplay: id,
          });
        })
        .catch((error) => {
          this.setState({ error: error });
          displayError(error);
        });
    }
  };

  renderCollectionItemTableHeader = () => {
    let header = this.state.predicatesWithID;
    return header.map((key, index) => {
      let keyValue = key.slice(key.lastIndexOf("/") + 1);
      return (
        <th style={{ textAlign: "center" }} key={index}>
          {keyValue}
        </th>
      );
    });
  };

  renderTableHeader = (arrayOfHeadings) => {
    return arrayOfHeadings.map((key, index) => {
      return (
        <th style={{ textAlign: "center" }} key={index}>
          {key}
        </th>
      );
    });
  };

  renderPredicatesTableBody = (arrayOfPredicatesData, align = "center") => {
    return arrayOfPredicatesData.map((predicateData) => {
      return (
        <tr>
          <td
            id={predicateData.id}
            style={{
              textAlign: "left",
            }}
          >
            {predicateData.name}
          </td>
          <td>{predicateData.type}</td>
          <td>{predicateData.unique}</td>
          <td>{predicateData.index}</td>
          <td>{predicateData.fulltext}</td>
          <td>{predicateData.multi}</td>
        </tr>
      );
    });
  };

  renderCollectionsTableBody = (arrayOfCollectionData, align = "left") => {
    return arrayOfCollectionData.map((collectionData) => {
      return (
        <tr>
          <td
            id={collectionData.id}
            style={{
              textAlign: "left",
            }}
          >
            {collectionData.name}
          </td>
        </tr>
      );
    });
  };
  renderBlocksTableHeader = (arrayOfHeadings) => {
    return arrayOfHeadings.map((header, index) => {
      switch (header) {
        case "Block":
          return (
            <OverlayTrigger
              placement={"top"}
              overlay={
                <Tooltip
                  style={{
                    maxWidth: "auto",
                    textAlign: "left",
                  }}
                >
                  Each block is an atomic update that is cryptographically
                  signed to prevent tampering and linked to the previous block
                  in the chain.
                </Tooltip>
              }
            >
              <th style={{ textAlign: "center" }} key={index}>
                <span>
                  <i
                    className="fas fa-cube hidden-xs"
                    aria-hidden="true"
                    style={{ paddingRight: "5px" }}
                  ></i>
                </span>
                {header}
              </th>
            </OverlayTrigger>
          );
        case "t":
          return (
            <OverlayTrigger
              placement={"top"}
              overlay={
                <Tooltip
                  style={{
                    maxWidth: "auto",
                    textAlign: "left",
                  }}
                >
                  "t" is a negative integer. t is a more granular notion of time
                  than a block.
                </Tooltip>
              }
            >
              <th style={{ textAlign: "center" }} key={index}>
                {header}
              </th>
            </OverlayTrigger>
          );
        case "Hash":
          return (
            <th style={{ textAlign: "center" }} key={index}>
              <span>
                <i
                  className="fas fa-hashtag hidden-xs"
                  aria-hidden="true"
                  style={{ paddingRight: "5px" }}
                ></i>
              </span>
              {header}
            </th>
          );
        case "Flakes":
          return (
            <OverlayTrigger
              placement={"top"}
              overlay={
                <Tooltip
                  style={{
                    maxWidth: "auto",
                    textAlign: "left",
                  }}
                >
                  A Flake is a specific fact at a specific point in time about a
                  specific subject. No two flakes are the same.
                </Tooltip>
              }
            >
              <th style={{ textAlign: "center" }} key={index}>
                <span>
                  <i
                    className="fas fa-snowflake hidden-xs"
                    aria-hidden="true"
                    style={{ paddingRight: "5px" }}
                  ></i>
                </span>
                {header}
              </th>
            </OverlayTrigger>
          );
        case "Instant":
          return (
            <OverlayTrigger
              placement={"top"}
              overlay={
                <Tooltip
                  style={{
                    maxWidth: "auto",
                    textAlign: "left",
                  }}
                >
                  Instant in time block was created.
                </Tooltip>
              }
            >
              <th style={{ textAlign: "center" }} key={index}>
                <span>
                  <i
                    className="fas fa-clock hidden-xs"
                    aria-hidden="true"
                    style={{ paddingRight: "5px" }}
                  ></i>
                </span>
                {header}
              </th>
            </OverlayTrigger>
          );
      }
    });
  };
  copyHashValue = () => {
    let copyText = document.getElementById("hashValue");

    // Select the text field
    copyText.select();

    // Copy the text inside the text field
    document.execCommand("Copy");
  };
  copyToClipboard(e, hash) {
    //fn creates dummy input where text is added
    //and dummy element is removed after text is copied.

    let dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.setAttribute("value", hash);
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
  }

  renderTooltip(props) {
    return <Tooltip {...props}>Copied!</Tooltip>;
  }
  clickOnToolTip = (hash) => {
    const filteredArrayOfDbBlocksDataOnClick = this.state.arrayOfDbBlocksData.map(
      (arrayData) => {
        //set table td Tooltip status
        return arrayData.hash === hash
          ? { ...arrayData, showTooltip: true }
          : arrayData;
      }
    );
    this.setState({
      arrayOfDbBlocksData: filteredArrayOfDbBlocksDataOnClick,
    });

    setTimeout(() => {
      const filteredArrayOfDbBlocksDataOnSetTimeout = this.state.arrayOfDbBlocksData.map(
        (arrayData) => {
          return arrayData.hash === hash
            ? { ...arrayData, showTooltip: false }
            : arrayData;
        }
      );
      this.setState({
        arrayOfDbBlocksData: filteredArrayOfDbBlocksDataOnSetTimeout,
      });
    }, 1000);
  };

  renderNothing() {
    return <div />;
  }
  renderBlocksTableBody = (arrayOfBlockData) => {
    return arrayOfBlockData.map((rowData) => {
      return (
        <tr>
          <td
            id={rowData.block}
            title="Click to view block history"
            className="table-content-centered Block"
          >
            {rowData.block}
          </td>
          <td className="table-content-centered ">{rowData.instant}</td>
          <td className="table-content-centered">{rowData.t}</td>
          <td
            title="Click to copy Hash"
            variant="secondary"
            style={{ cursor: "pointer" }}
          >
            <OverlayTrigger
              placement={"right"}
              trigger="click"
              overlay={
                rowData.showTooltip
                  ? this.renderTooltip()
                  : this.renderNothing()
              }
            >
              <span onClick={() => this.clickOnToolTip(rowData.hash)}>
                {rowData.hash}
                <i
                  className="fas fa-copy hidden-xs"
                  aria-hidden="true"
                  style={{ paddingLeft: "10px" }}
                ></i>
              </span>
            </OverlayTrigger>{" "}
          </td>

          <td
            id={rowData.block}
            className="table-content-centered cursor-pointer Flakes add-underline"
            onClick={(e) => this.getSingleBlockData(e)}
          >
            {rowData.flakes}
          </td>
        </tr>
      );
    });
  };

  // takes the collections and predicates object from the current ledger
  //and creates a FlureeQL transaction to replicate the schema
  generateTransaction = (collections, predicates) => {
    let transactionArray = [];
    let functionMap = {};

    collections.map((collection) => {
      // Ignores the collection if it begins with a _
      if (!this.start_.test(get(collection, "_collection/name"))) {
        let collectionTx = {
          _id: "_collection",
          name: get(collection, "_collection/name"),
          doc: get(collection, "_collection/doc"),
          version: get(collection, "_collection/version"),
        };
        let specs = get(collection, "_collection/spec", null);
        let specTx = specs === null ? null : [];

        if (specTx !== null) {
          [functionMap, specTx] = this.checkSpec(functionMap, specs, specTx);
          collectionTx["spec"] = specTx;
        }

        collectionTx = pickBy(collectionTx, (n) => n !== null);
        transactionArray.push(collectionTx);
      }
      return null;
    });

    predicates.map((predicate) => {
      // ignores the predicate if it begins with a _
      if (!this.start_.test(get(predicate, "_predicate/name"))) {
        let predicateTx = {
          _id: "_predicate",
          name: get(predicate, "_predicate/name", null),
          doc: get(predicate, "_predicate/doc", null),
          type: get(predicate, "_predicate/type", null),
          unique: get(predicate, "_predicate/unique", null),
          multi: get(predicate, "_predicate/multi", undefined),
          index: get(predicate, "_predicate/index", null),
          upsert: get(predicate, "_predicate/upsert", null),
          noHistory: get(predicate, "_predicate/noHistory", null),
          component: get(predicate, "_predicate/component", null),
          specDoc: get(predicate, "_predicate/specDoc", null),
          txSpecDoc: get(predicate, "_predicate/txSpecDoc", null),
          restrictCollection: get(
            predicate,
            "_predicate/restrictCollection",
            null
          ),
          deprecated: get(predicate, "_predicate/deprecated", null),
          encrypted: get(predicate, "_predicate/encrypted", null),
        };

        let specs = get(predicate, "_predicate/spec", null);
        let specTx = specs === null ? null : [];

        if (specTx !== null) {
          [functionMap, specTx] = this.checkSpec(functionMap, specs, specTx);
          predicateTx["spec"] = specTx;
        }

        let txSpecs = get(predicate, "_predicate/txSpec", null);
        let txSpecTx = txSpecs === null ? null : [];
        if (txSpecTx !== null) {
          [functionMap, txSpecTx] = this.checkSpec(
            functionMap,
            txSpecs,
            txSpecTx
          );
          predicateTx["txSpec"] = txSpecTx;
        }

        predicateTx = pickBy(predicateTx, (n) => n !== null);
        transactionArray.push(predicateTx);
      }
      return null;
    });

    const transactionArrayString = JSON.stringify(transactionArray, null, 1);
    return transactionArrayString;
  };
  getDatabaseBlocks = () => {
    let currentBlock;
    let firstBlock;
    let diff = this.state.diff;
    currentBlock = this.state.block;

    if (currentBlock < 9 || currentBlock - diff <= 0) {
      firstBlock = 1;
    } else {
      firstBlock = currentBlock - diff;
    }
    if (currentBlock === 1 || currentBlock < 9) {
      this.setState({
        IsViewMore: false,
        IsViewLess: false,
      });
    } else {
      this.setState({
        IsViewMore: firstBlock === 1 ? false : true,
        IsViewLess: firstBlock === 1 ? true : false,
      });
    }

    let schemaQuery = {
      start: currentBlock,
      end: firstBlock,
    };
    const { ip, db, displayError, openApiServer, token } = this.props._db;
    const fullDb = db.split("/");

    const opts = {
      endpoint: "block-range-with-txn",
      ip: ip,
      network: fullDb[0],
      db: fullDb[1],
      body: schemaQuery,
      auth: token,
    };

    if (openApiServer) {
      flureeFetch(opts)
        .then((res) => {
          let arrayOfBlockHeaders = ["Block", "Instant", "t", "Hash", "Flakes"];
          let dbBlocksRawData = res.json.data || res;
          let arrayOfBlockNumbers = dbBlocksRawData.map((item) => item.block);
          let arrayOfDbBlocksData = dbBlocksRawData.map((item) => {
            let txn;
            if (item.txn[0]) {
              txn = item.txn[0].tx.length;
            } else {
              txn = 0;
            }
            return {
              block: item.block,
              flakes: item.flakes.length,
              hash: item.hash,
              instant: new Date(item.instant).toLocaleString(),
              t: item.t,
              showTooltip: false,
            };
          });

          let flakesHeader = [
            "Subject",
            "Predicate",
            "Object",
            "Time",
            "Boolean",
          ];

          this.setState({
            arrayOfDbBlocksData,
            arrayOfBlockNumbers,
            flakesHeader,
            arrayOfBlockHeaders,
          });
        })
        .catch((error) => {
          this.setState({ error: error });
          displayError(error);
        });
    }
  };

  getSingleBlockData = (e) => {
    let blockNum = parseInt(e.target.id);
    let heading;

    if (e.target.classList.contains("Transactions")) {
      heading = "Transactions";
    } else if (e.target.classList.contains("Block")) {
      heading = "Flakes";
    } else {
      heading = "Flakes";
    }

    let schemaQuery = {
      start: blockNum,
      end: blockNum,
    };
    const { ip, db, displayError, openApiServer, token } = this.props._db;
    const fullDb = db.split("/");

    const opts = {
      endpoint: "block-range-with-txn",
      ip: ip,
      network: fullDb[0],
      db: fullDb[1],
      body: schemaQuery,
      auth: token,
    };

    if (openApiServer) {
      flureeFetch(opts)
        .then((res) => {
          let arrayOfBlockHeaders = [
            "Block",
            "Instant",
            "t",
            "Hash",
            "Signature",
            "Flakes",
            "Transactions",
          ];
          let dbBlocksRawData = res.json.data || res;
          let arrayOfBlockNumbers = dbBlocksRawData.map((item) => item.block);
          let arrayOfDbBlocksData = dbBlocksRawData.map((item) => {
            let txn;
            if (item.txn[0]) {
              txn = item.txn[0].tx.length;
            } else {
              txn = 0;
            }
            return {
              block: item.block,
              flakes: item.flakes.length,
              txns: txn,
              hash: item.hash,
              sigs: item.sigs,
              instant: new Date(item.instant).toLocaleString(),
              t: item.t,
            };
          });

          //Use for single block data
          let arrayOfSingleBlockData = dbBlocksRawData.map((item) => {
            let txn;
            if (item.txn[0]) {
              txn = item.txn[0];
            } else {
              txn = "Nothing here";
            }
            return {
              block: item.block,
              flakes: item.flakes,
              txns: txn,
            };
          });
          let transactionHeader = ["Authority", "Nonce", "Tx", "Expire"];
          let transactionBody = [arrayOfSingleBlockData[0].txns];
          let flakesBody = arrayOfSingleBlockData[0].flakes;

          let flakesHeader = [
            "Subject",
            "Predicate",
            "Object",
            "t",
            "Retracted / Asserted",
          ];

          this.setState({
            arrayOfDbBlocksData,
            arrayOfBlockNumbers,
            flakesHeader,
            flakesBody,
            transactionHeader,
            transactionBody,
            arrayOfBlockHeaders,
            blockNum,
            heading,
          });

          this.toggleBlockInfoModal();
        })
        .catch((error) => {
          this.setState({ error: error });
          displayError(error);
        });
    }
  };

  viewMore = (e) => {
    e.preventDefault();
    this.setState(
      (prevState) => {
        return {
          diff: prevState.diff + 9,
        };
      },
      () => {
        this.getDatabaseBlocks();
      }
    );
  };

  viewLess = (e) => {
    e.preventDefault();
    this.setState({ diff: 9 }, () => {
      this.getDatabaseBlocks();
    });
  };
  copyHashValue = () => {
    let copyText = document.getElementById("hashValue");

    /* Select the text field */
    copyText.select();

    /* Copy the text inside the text field */
    document.execCommand("Copy");
  };
  render() {
    if (!this.props._db.openApiServer) {
      return (
        <div className="text-center mt20">
          <h3>
            The Explore Ledger page is not currently available with a closed
            API.
          </h3>
        </div>
      );
    }

    if (this.state.error) {
      return <div />;
    }

    if (!this.state.collections || !this.state.predicates) {
      return <div className="loading1"> Loading... </div>;
    }

    if (this.state.collections && this.state.predicates) {
      // Count of collections without the default collections
      let numCollections = this.state.collections.length - 10;
      numCollections = numCollections < 0 ? 0 : numCollections;

      //count of predicates with the default predicates;
      const predicates = this.state.predicates;
      const numOfBlocks = this.state.block;

      let numOfPredicatesToDisplay = predicates.length;
      numOfPredicatesToDisplay =
        numOfPredicatesToDisplay < 0 ? 0 : numOfPredicatesToDisplay;

      return (
        <div>
          <div
            className="row text-center mt20"
            style={{ marginBottom: "40px" }}
          >
            <h1>Explore Ledger: {this.props._db.db}</h1>
          </div>
          <div>
            <Tabs
              id="tab-header"
              style={{ textAlign: "center" }}
              defaultActiveKey="block"
            >
              <Tab
                id="collections-tab-content"
                eventKey="collections"
                title={`Collections (${numCollections})`}
              >
                {this.state.collectionsWithMoreInfo ? (
                  <div
                    id="scroll-div-container"
                    className="table-container network-page-table-container"
                  >
                    <table
                      className="block-table block-table-stripes"
                      ref="scrollContent"
                      striped
                      bordered
                      hover
                      size="sm"
                    >
                      <thead style={{ padding: "15px" }}>
                        {this.renderTableHeader(this.state.collectionsHeader)}
                      </thead>
                      <tbody>
                        {this.renderCollectionsTableBody(
                          this.state.collectionsWithMoreInfo
                        )}
                      </tbody>
                    </table>
                    <div ref="tableEndRef"></div>
                  </div>
                ) : null}
              </Tab>
              <Tab
                id="block-tab-content"
                eventKey="block"
                title={`Blocks (${numOfBlocks})`}
              >
                <div
                  className="row"
                  style={{
                    textAlign: "center",
                    margin: "auto",
                  }}
                >
                  <div
                    className="col-sm-9"
                    style={{
                      marginTop: "30px",
                      marginBottom: "30px",
                      width: "100%",
                    }}
                  >
                    {this.state.arrayOfDbBlocksData ? (
                      <div
                        id="scroll-div-container"
                        className="table-container network-page-table-container"
                      >
                        <table
                          className="block-table block-table-stripes"
                          ref="tableEndRef"
                          striped
                          bordered
                          hover
                          size="sm"
                        >
                          <thead style={{ padding: "15px" }}>
                            {this.renderBlocksTableHeader(
                              this.state.arrayOfBlockHeaders
                            )}
                          </thead>
                          <tbody>
                            {this.renderBlocksTableBody(
                              this.state.arrayOfDbBlocksData
                            )}
                          </tbody>
                        </table>
                        <div ref="tableEndRef"></div>
                      </div>
                    ) : null}
                    {this.state.IsViewMore ? (
                      <div
                        style={{
                          textAlign: "left",
                          marginTop: "10px",
                        }}
                      >
                        <button
                          className="buttonPurple"
                          onClick={(e) => this.viewMore(e)}
                        >
                          Load More +
                        </button>
                      </div>
                    ) : (
                      ""
                    )}
                    {this.state.IsViewLess ? (
                      <div
                        style={{
                          textAlign: "left",
                          marginTop: "20px",
                        }}
                      >
                        <button
                          className="buttonPurple"
                          onClick={(e) => this.viewLess(e)}
                        >
                          View Less -
                        </button>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </Tab>
              <Tab
                eventKey="predicates"
                title={`Predicates (${numOfPredicatesToDisplay})`}
              >
                {this.state.predicates ? (
                  <div
                    id="scroll-div-container"
                    className="table-container network-page-table-container"
                  >
                    <table
                      className="block-table block-table-stripes"
                      ref="scrollContent"
                      striped
                      bordered
                      hover
                      size="sm"
                    >
                      <thead style={{ padding: "15px" }}>
                        {this.renderTableHeader(this.state.predicatesHeader)}
                      </thead>
                      <tbody>
                        {this.renderPredicatesTableBody(this.state.predicates)}
                      </tbody>
                    </table>
                    <div ref="tableEndRef"></div>
                  </div>
                ) : null}
              </Tab>
            </Tabs>
          </div>

          {this.state.blockInfoModal && (
            <BlockInfoModal
              flakesHeader={this.state.flakesHeader}
              flakesBody={this.state.flakesBody}
              transactionHeader={this.state.transactionHeader}
              transactionBody={this.state.transactionBody}
              block={this.state.blockNum}
              heading={this.state.heading}
              toggleBlockInfoModal={this.toggleBlockInfoModal}
            />
          )}
        </div>
      );
    }
  }
}
