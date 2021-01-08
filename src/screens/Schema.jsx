import React, { Component, Fragment } from "react";
import Footer from "../components/Footer";

import {
  Button,
  Badge,
  ListGroup,
  ListGroupItem,
  Tooltip,
  OverlayTrigger,
  Table,
  Modal,
} from "react-bootstrap";
import { PanelStat } from "./Account";
import { flureeFetch } from "../flureeFetch";
import { pickBy, get, has, isObject, isArray } from "lodash";
import SchemaExplorer from "../components/ExploreSchema";
import pluralize from "pluralize";

class Schema extends Component {
  state = {
    collectionOpen: false,
    predicateOpen: false,
    openSmartFuncs: [],
    SchemaExplorer: false,
    launchExplorerButtonStatus: false,
    showMoreDetails: false,
    moreDetails: [],
    currentIDToDisplay: "",
    showExportSchemaModal: false,
  };

  exportSchemaModalToggle = () => {
    this.setState({ showExportSchemaModal: !this.state.showExportSchemaModal });
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

  handleLaunchExplorerButtonStatus = () => {
    this.setState({
      launchExplorerButtonStatus: !this.state.launchExplorerButtonStatus,
    });
  };

  componentDidMount() {
    // After the component mounts, get the collections and predicates in the Ledger using flureeFetch
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
          this.setState({ collections: collections, predicates: predicates });
        })
        .catch((error) => {
          //debugger;
          ((error) => console.log(error))();

          this.setState({ error: error });
          //displayError(error);
        });
    }
  }

  start_ = /^_/;

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
          // else push _fn tempid to functionMap and use a nested tx to create the function
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

  generateTransactionForMoreInfo = (collection, id) => {
    let schemaQuery = {
      predicateDetails: {
        select: ["*"],
        from: collection,
        // "limit": 2
      },
      predicates: {
        select: { "?collection-predicates": ["_predicate/name"] },
        where: [["?collection-predicates", "_predicate/name", "?field"]],
        filter: [`(re-find (re-pattern \"^${collection}\") ?field)`],
        // limit: 2
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
          //console.log(moreDetails)
          let predicatesFromResponse = JSON.parse(res).predicates.map(
            (item) => item["_predicate/name"]
          );
          let predicatesWithID = ["_id", ...predicatesFromResponse];
          //console.log(predicatesWithID)
          this.setState({
            showMoreDetails: !this.state.showMoreDetails,
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

  renderCollectionItemTableData() {
    let moreInfo = this.state.moreDetails;
    let header = this.state.predicatesWithID;

    let moreInfoFormatted = moreInfo.map((data1) => {
      let subData = header.map((data2) => {
        if (has(data1, data2)) {
          //check if key exist and return value of that key
          let value = data1[data2];

          if (isObject(value)) {
            return value._id;
          } else if (isArray(value)) {
            return "Array...";
          } else {
            return value;
          }
        } else {
          return "null";
        }
      });
      return subData;
    });

    return moreInfoFormatted.map((val1) => {
      return (
        <tr>
          {val1.map((val2) => {
            return <td style={{ textAlign: "left" }}>{val2}</td>;
          })}
        </tr>
      );
    });
  }

  // takes the collections and predicates object from the current ledger and creates a FlureeQL transaction to replicate the schema
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
          specDoc: get(collection, "_collection/specDoc"),
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

  copyTransaction = () => {
    var copyText = document.getElementById("transactionArea");

    /* Select the text field */
    //copyText.select();

    /* Copy the text inside the text field */
    document.execCommand("Copy");
    this.setState({
      showTooltip: true,
    });

    setTimeout(() => {
      this.setState({ showTooltip: false });
    }, 1000);
  };

  // Says, "copied" after copying the transaction
  // tooltip = (
  // 	<Tooltip id="copied">
  // 		<i className="fas fa-check" />
  // 		&nbsp;Copied!
  // 	</Tooltip>
  // );

  toggleCollection = () =>
    this.setState({ collectionOpen: !this.state.collectionOpen });
  togglePredicate = () =>
    this.setState({ predicateOpen: !this.state.predicateOpen });
  toggleSmartFunc = (e) => {
    const key = e.target.offsetParent.id;
    if (this.state.openSmartFuncs.includes(key)) {
      this.setState({
        openSmartFuncs: this.state.openSmartFuncs.filter((x) => x !== key),
      });
    } else {
      this.setState({ openSmartFuncs: this.state.openSmartFuncs.concat(key) });
    }
  };
  schemaExplorerHandleClose = () => this.setState({ schemaExplorer: false });

  openSchemaExplorer = () => this.setState({ schemaExplorer: true });

  renderTooltip() {
    return (
      <Tooltip>
        <i className="fas fa-check" />
        &nbsp; Copied!
      </Tooltip>
    );
  }
  clickOnToolTip = () => {
    this.setState({
      showTooltip: true,
    });

    setTimeout(() => {
      this.setState({ showTooltip: false });
    }, 1500);
  };

  renderNothing() {
    return <div />;
  }
  render() {
    //this.getDataRecentBlockWithTransaction()
    if (!this.props._db.openApiServer) {
      return (
        <div className="text-center mt20">
          <h3>The Schema page is not currently available with a closed API.</h3>
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
      // Count of predicates without the default predicates
      let numPredicates = this.state.predicates.length - 79;
      numPredicates = numPredicates < 0 ? 0 : numPredicates;

      const collections = this.state.collections;
      const predicates = this.state.predicates;
      const arrayOfPredicatesToDisplay = predicates.filter(
        (predicate) => !this.start_.test(get(predicate, "_predicate/name"))
      );
      let numOfPredicatesToDisplay = arrayOfPredicatesToDisplay.length;
      numOfPredicatesToDisplay =
        numOfPredicatesToDisplay < 0 ? 0 : numOfPredicatesToDisplay;

      return (
        <div style={{ paddingLeft: "40px", marginTop: "40px" }}>
          <SchemaExplorer
            {...this.props}
            handleLaunchExplorerButton={this.handleLaunchExplorerButtonStatus}
            show={this.state.schemaExplorer}
            handleClose={this.schemaExplorerHandleClose}
          />
          <div className="row p20">
            <div className="col-sm-6">
              <h2 className="mb10 text-uppercase" style={{ color: "#091133" }}>
                <span className="account-header">
                  &nbsp;&nbsp;Export Schema: {this.props._db.db}
                </span>
              </h2>
            </div>
            <div className="col-sm-6">
              <Button
                disabled={this.state.launchExplorerButtonStatus}
                onClick={this.openSchemaExplorer}
              >
                Launch Schema Explorer
              </Button>
            </div>
            {/* <div className="col-sm-3">
							<Button
								disabled={this.state.launchExplorerButtonStatus}
								onClick={this.exportSchemaModalToggle}
							>
								Export Schema
							</Button>
						</div> */}
            {/* {this.state.showExportSchemaModal ? (
							<Modal show onHide={() => this.exportSchemaModalToggle()}>
								<Modal.Header closeButton>
									<Modal.Title
										style={{ fontSize: "20px", fontWeight: "lighter" }}
									>
										<h2>Export Schema</h2>
									</Modal.Title>
								</Modal.Header>
								<Modal.Body>
									<p style={{ padding: "10px 0" }}>
										Populate another ledger with the same collections and
										predicates as {this.props._db.db}.
									</p>
									<div className="text-center pb10">
										<OverlayTrigger
											placement="right"
											overlay={this.tooltip}
											trigger="click"
										>
											<Button onClick={this.copyTransaction}>
												<i className="fas fa-clipboard" /> &nbsp; &nbsp;Copy
												Transaction
											</Button>
										</OverlayTrigger>
									</div>
									<textarea
										style={{ width: "80%", minHeight: "300px" }}
										id="transactionArea"
										readOnly
										value={this.generateTransaction(collections, predicates)}
									/>
								</Modal.Body>
							</Modal>
						) : null} */}
          </div>
          <div className="row panel-stats">
            <div className="col-sm-3 col-md-4">
              <PanelStat
                iconClass="far fa-object-group bg-info"
                stat={numCollections}
                statText={
                  numCollections === 1
                    ? "Ledger Collection"
                    : "Collections in Ledger"
                }
              />
            </div>
            <div className="col-sm-3 col-md-4">
              <PanelStat
                iconClass="fas fa-tag bg-success"
                stat={numOfPredicatesToDisplay}
                statText={
                  numOfPredicatesToDisplay === 1
                    ? "Predicate in Ledger"
                    : "Predicates in Ledger"
                }
              />
            </div>
          </div>
          <div
            className="row"
            style={{
              textAlign: "center",
              margin: "auto",
              marginTop: "30px",
            }}
          >
            <div
              style={{
                textAlign: "left",
                marginTop: "30px",
                marginRight: "10px",
              }}
              className="col-sm-9 col-md-5"
            >
              <h2>Export Schema</h2>
              <p
                style={{
                  padding: "4px",
                }}
              >
                Populate another ledger with the same collections and
                predicates as {this.props._db.db}.
              </p>
              <div className="text-left pb10">
                <OverlayTrigger
                  placement="right"
                  overlay={
                    this.state.showTooltip
                      ? this.renderTooltip()
                      : this.renderNothing()
                  }
                  trigger="click"
                >
                  <Button onClick={this.copyTransaction}>
                    <i className="fas fa-clipboard" /> &nbsp; &nbsp;Copy
                    Transaction
                  </Button>
                </OverlayTrigger>
              </div>
              <textarea
                style={{ width: "80%", minHeight: "300px" }}
                id="transactionArea"
                readOnly
                value={this.generateTransaction(collections, predicates)}
              />
            </div>
            <div
              className="col-sm-9 col-md-6"
              style={{
                background: "white",
                marginTop: "40px",
                marginBottom: "30px",
                // width: "100%"
              }}
            >
              <h2
                onClick={this.toggleCollection}
                className="pb10 row"
                style={{ cursor: "pointer" }}
              >
                <span className="col-xs-3 text-center">
                  <Badge>
                    <i
                      className={
                        this.state.collectionOpen ? "fa fa-minus" : "fa fa-plus"
                      }
                    />
                  </Badge>
                </span>
                <span className="col-xs-6 text-center">
                  &nbsp;Collections&nbsp;
                </span>
                <span className="col-xs-3 text-center">
                  <Badge>{numCollections}</Badge>
                </span>
              </h2>
              {this.state.collectionOpen ? (
                <ListGroup>
                  {collections.map((collection) => {
                    if (
                      false
                      // !this.start_.test(get(collection, "_collection/name")) &&
                      // get(collection, "_collection/spec")
                    ) {
                      return (
                        <ListGroupItem
                          key={get(collection, "_id")}
                          id={get(collection, "_id")}
                          onClick={this.toggleSmartFunc}
                          style={{ cursor: "pointer" }}
                        >
                          <span>{get(collection, "_collection/name")} </span>
                          <span>
                            <Badge>
                              {collection["_collection/spec"].length} Smart{" "}
                              {pluralize(
                                "Function",
                                collection["_collection/spec"].length
                              )}
                            </Badge>
                          </span>
                          {this.state.openSmartFuncs.includes(
                            get(collection, "_id").toString()
                          ) ? (
                            <ListGroup style={{ marginTop: "5px" }}>
                              {get(collection, "_collection/spec").map(
                                (spec) => {
                                  return (
                                    <ListGroupItem>
                                      {get(spec, "_fn/name")}:{" "}
                                      {get(spec, "_fn/doc")}
                                    </ListGroupItem>
                                  );
                                }
                              )}
                            </ListGroup>
                          ) : null}
                        </ListGroupItem>
                      );
                    } else if (
                      !this.start_.test(get(collection, "_collection/name"))
                    ) {
                      return (
                        <Fragment>
                          <ListGroupItem
                            id={get(collection, "_id")}
                            key={get(collection, "_id")}
                          >
                            <div>
                              <span>{get(collection, "_collection/name")}</span>
                            </div>
                          </ListGroupItem>
                        </Fragment>
                      );
                    }
                    return null;
                  })}
                </ListGroup>
              ) : null}
              <hr />
              {
                //TODO: add onClick to collections/predicates with spec fns
              }
              <h2
                onClick={this.togglePredicate}
                className="pb10 row"
                style={{ cursor: "pointer" }}
              >
                <span className="col-xs-3 text-center">
                  <Badge>
                    <i
                      className={
                        this.state.predicateOpen ? "fa fa-minus" : "fa fa-plus"
                      }
                    />
                  </Badge>
                </span>
                <span className="col-xs-6 text-center">
                  &nbsp;Predicates&nbsp;
                </span>
                <span className="col-xs-3 text-center">
                  <Badge>{numOfPredicatesToDisplay}</Badge>
                </span>
              </h2>
              {this.state.predicateOpen ? (
                <ListGroup>
                  {predicates.map((predicate) => {
                    if (
                      false
                      // !this.start_.test(get(predicate, "_predicate/name")) &&
                      // get(predicate, "_predicate/spec")
                    ) {
                      return (
                        <ListGroupItem
                          key={get(predicate, "_id")}
                          id={get(predicate, "_id")}
                          onClick={this.toggleSmartFunc}
                          style={{ cursor: "pointer" }}
                        >
                          <span>{get(predicate, "_predicate/name")} </span>
                          <span>
                            <Badge>
                              {predicate["_predicate/spec"].length} Smart{" "}
                              {pluralize(
                                "Function",
                                predicate["_predicate/spec"].length
                              )}
                            </Badge>
                          </span>
                          {this.state.openSmartFuncs.includes(
                            get(predicate, "_id").toString()
                          ) ? (
                            <ListGroup style={{ marginTop: "5px" }}>
                              {get(predicate, "_predicate/spec").map((spec) => {
                                return (
                                  <ListGroupItem>
                                    {get(spec, "_fn/name")}:{" "}
                                    {get(spec, "_fn/doc")}
                                  </ListGroupItem>
                                );
                              })}
                            </ListGroup>
                          ) : null}
                        </ListGroupItem>
                      );
                    } else if (
                      !this.start_.test(get(predicate, "_predicate/name"))
                    ) {
                      return (
                        <ListGroupItem key={get(predicate, "_id")}>
                          <span>{get(predicate, "_predicate/name")}</span>
                        </ListGroupItem>
                      );
                    }
                    return null;
                  })}
                </ListGroup>
              ) : null}
            </div>
          </div>

        
        </div>
      );
    }
  }
}

export default Schema;
