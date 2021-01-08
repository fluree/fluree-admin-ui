import React from "react";
import {
  Button,
  Checkbox,
  Col,
  Form,
  FormGroup,
  FormControl,
  ToggleButton,
  ToggleButtonGroup,
  DropdownButton,
  Table,
  Modal,
  MenuItem,
} from "react-bootstrap";
import { flureeFetch } from "../flureeFetch";
import { get } from "lodash";
import Editor from "../components/PermissionsEditor";


function processData(csv) {
  var allTextLines = csv.split(/\r\n|\n/);
  var lines = [];
  for (var i = 0; i < allTextLines.length; i++) {
    var data = allTextLines[i].split(",");
    var tarr = [];
    for (var j = 0; j < data.length; j++) {
      tarr.push(data[j]);
    }
    lines.push(tarr);
  }
  return lines;
}

class NewCollectionModal extends React.Component {
  state = {
    fullTransaction: [],
    collectionName: null,
  };

  componentDidMount = () => {
    this.setState({ fullTransaction: [{ _id: "_collection" }] });
  };

  changeCollectionName = (e) => {
    const collectionName = e.target.value;
    const collectionTx = [
      {
        _id: "_collection",
        name: collectionName,
      },
    ];

    this.setState({
      collectionName: collectionName,
      fullTransaction: collectionTx,
    });
  };

  render() {
    const { _db, handleClose, collectionRefresh } = this.props;
    return (
      <Modal show onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 style={{ fontSize: "20px", fontWeight: "lighter" }}>
              <i className="far fa-object-group" /> &nbsp;Create New Collection
            </h4>
            <hr style={{ marginBottom: "0px" }} />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormGroup>
            <Col componentClass="div" className="text-left" sm={4}>
              <i className="far fa-object-group bg-success permission-icon-small mb10" />
              Collection Name:
            </Col>
            <Col sm={7}>
              <FormGroup controlId="collectionName">
                <FormControl
                  type="text"
                  placeholder="Collection Name"
                  value={this.state.collectionName}
                  onChange={this.changeCollectionName}
                />
              </FormGroup>
            </Col>
          </FormGroup>
          <div className="row mt20">
            <Editor
              value={this.state.fullTransaction}
              _db={_db}
              handleClose={handleClose}
              fullRefresh={collectionRefresh}
            />
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}

class NewPredicateModal extends React.Component {
  state = {
    fullTransaction: [],
    name: "",
    type: "",
    multi: false,
    unique: true,
    index: true,
  };

  componentDidMount = () => {
    this.refreshTx();
  };

  changeValue = (key, e) => {
    const newState = {};
    const value = e.target ? e.target.value : e;
    newState[key] = value;

    const fullTransaction = this.state.fullTransaction[0];
    fullTransaction[key] = value;

    if (key === "type" && e !== "ref") {
      delete fullTransaction.restrictCollection;
    }

    newState["fullTransaction"] = [fullTransaction];

    this.setState(newState);
  };

  refreshTx = () => {
    const fullTransction = {
      _id: "_predicate",
      name: this.state.name,
      type: this.state.type,
      multi: this.state.multi,
      unique: this.state.unique,
      index: this.state.index,
    };

    if (this.state.restrictCollection) {
      fullTransction["restrictCollection"] = this.state.restrictCollection;
    }

    this.setState({ fullTransaction: [fullTransction] });
  };

  typeList = [
    "string",
    "ref",
    "tag",
    "int",
    "long",
    "bigint",
    "float",
    "double",
    "bigdec",
    "instant",
    "boolean",
    "uri",
    "uuid",
    "bytes",
    "json",
  ];

  render() {
    const { _db, handleClose, predicateRefresh } = this.props;
    return (
      <Modal show onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 style={{ fontSize: "20px", fontWeight: "lighter" }}>
              <i className="fas fa-tag" /> &nbsp;Create New Predicate
            </h4>
            <hr style={{ marginBottom: "0px" }} />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-sm-12">
              <Form horizontal onSubmit={(e) => e.preventDefault()}>
                <FormGroup>
                  <Col componentClass="div" className="text-left" sm={4}>
                    <i className="fas fa-tag bg-success permission-icon-small mb10" />
                    Name:
                  </Col>
                  <Col sm={7}>
                    <FormGroup controlId="predicateName">
                      <FormControl
                        type="text"
                        placeholder="Predicate Name"
                        value={this.state.name}
                        onChange={(e) => this.changeValue("name", e)}
                      />
                    </FormGroup>
                  </Col>
                </FormGroup>
                <FormGroup>
                  <Col componentClass="div" className="text-left" sm={4}>
                    <i className="fas fa-tag bg-success permission-icon-small mb10" />
                    Type:
                  </Col>
                  <Col sm={7}>
                    <DropdownButton
                      title={this.state.type ? this.state.type : "Choose Type"}
                    >
                      {this.typeList.map((type) => (
                        <MenuItem
                          onClick={() => this.changeValue("type", type)}
                        >
                          {type}
                        </MenuItem>
                      ))}
                    </DropdownButton>
                  </Col>
                </FormGroup>
                {this.state.type === "ref" ? (
                  <FormGroup controlId="restrictCollection">
                    <FormControl
                      type="text"
                      placeholder="Restrict Collection"
                      value={this.state.restrictCollection}
                      onChange={(e) =>
                        this.changeValue("restrictCollection", e)
                      }
                    />
                  </FormGroup>
                ) : null}
                <FormGroup>
                  <Col componentClass="div" className="text-left" sm={4}>
                    <i className="fas fa-tag bg-success permission-icon-small mb10" />
                    Unique
                  </Col>
                  <Col sm={7}>
                    <ToggleButtonGroup
                      type="radio"
                      name="unique"
                      value={this.state.unique}
                      defaultValue="true"
                      onChange={(e) => this.changeValue("unique", e)}
                    >
                      <ToggleButton bsSize="small" value={true}>
                        True
                      </ToggleButton>
                      <ToggleButton bsSize="small" value={false}>
                        False
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Col>
                </FormGroup>
                <FormGroup>
                  <Col componentClass="div" className="text-left" sm={4}>
                    <i className="fas fa-tag bg-success permission-icon-small mb10" />
                    Multi:
                  </Col>
                  <Col sm={7}>
                    <ToggleButtonGroup
                      type="radio"
                      name="multi"
                      value={this.state.multi}
                      defaultValue="false"
                      onChange={(e) => this.changeValue("multi", e)}
                    >
                      <ToggleButton bsSize="small" value={true}>
                        True
                      </ToggleButton>
                      <ToggleButton bsSize="small" value={false}>
                        False
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Col>
                </FormGroup>
                <FormGroup>
                  <Col componentClass="div" className="text-left" sm={4}>
                    <i className="fas fa-tag bg-success permission-icon-small mb10" />
                    Index:
                  </Col>
                  <Col sm={7}>
                    <ToggleButtonGroup
                      type="radio"
                      name="index"
                      value={this.state.index}
                      defaultValue="true"
                      onChange={(e) => this.changeValue("index", e)}
                    >
                      <ToggleButton bsSize="small" value={true}>
                        True
                      </ToggleButton>
                      <ToggleButton bsSize="small" value={false}>
                        False
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Col>
                </FormGroup>
              </Form>
            </div>
          </div>
          <div className="row mt20">
            <Editor
              value={this.state.fullTransaction}
              _db={_db}
              handleClose={handleClose}
              fullRefresh={predicateRefresh}
            />
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}

class Import extends React.Component {
  state = {
    rawPredicates: [],
    data: [],
    dbCollections: [],
    dbPredicates: [],
    chosenCollection: null,
    containsHeader: true,
    tx: [],
    offset: 0,
    count: 100,
    newCollection: false,
    newPredicates: [],
    relevantPred: [],
    predicateMap: {},
    displayAddCollectionModal: false,
    displayAddPredicateModal: false,
  };

  schemaQuery = {
    collections: {
      select: ["_collection/name"],
      from: "_collection",
    },
    predicates: {
      select: ["_predicate/name"],
      from: "_predicate",
    },
  };

  componentDidMount = () => {
    const { openApiServer } = this.props._db;
    if (openApiServer) {
      this.fileAPISupported();
      this.refreshSchema();
    }
  };

  refreshSchema = () => {
    const { ip, db, displayError, token } = this.props._db;
    const fullDb = db.split("/");

    const opts = {
      ip: ip,
      endpoint: "multi-query",
      network: fullDb[0],
      db: fullDb[1],
      body: this.schemaQuery,
      auth: token,
    };

    flureeFetch(opts)
      .then((response) => {
        let res = response.json || res;
        res = res.result || res;
        const collections = res.collections;
        const dbCollections = collections.map((coll) =>
          get(coll, "_collection/name")
        );
        const predicates = res.predicates;
        let dbPredicates = predicates
          .map((pred) => get(pred, "_predicate/name"))
          .sort();
        this.setState({
          dbCollections: dbCollections,
          dbPredicates: dbPredicates,
        });
      })
      .catch((error) => {
        this.setState({ error: error });
       
      });
  };

  onChangeHeader = (e) => {
    const containsHeader = e.target.checked;
    let { data, rawPredicates } = this.state;
    if (containsHeader) {
      rawPredicates = data[0];
      data.shift();
    } else {
      data.unshift(rawPredicates);
      rawPredicates = [];
    }

    this.setState({
      containsHeader: containsHeader,
      data: data,
      rawPredicates: rawPredicates,
    });
  };

  fileAPISupported = () => {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      return true;
    } else {
      return this.props._db.displayError({
        message:
          "File API not supported in this browser. Cannot use import tool",
      });
    }
  };

  handleFileUpload = (e) => {
    const reader = new FileReader();
    const file = e.target.files[0];
    reader.readAsText(file);
    reader.onload = this.parseCSV;
    reader.onerror = this.props._db.displayError;
  };

  parseCSV = (e) => {
    let csv = e.target.result;
    csv = csv.replace(/\r/g, "\n");
    let processed = processData(csv);
    let predicates = processed[0];
    processed.shift();
    this.setState({ rawPredicates: predicates, data: processed });
  };

  selectRelevantDbPredicates = () => {
    const { chosenCollection, dbPredicates } = this.state;
    let relevantPred = [];
    if (chosenCollection) {
      dbPredicates.filter((pred) => {
        if (pred.startsWith(chosenCollection)) {
          relevantPred.push(pred);
        }
        return null;
      });
    }

    this.setState({ relevantPred: relevantPred });
  };

  onChangeCollection = (coll) => {
    this.setState({ chosenCollection: coll, newCollection: false }, () =>
      this.selectRelevantDbPredicates()
    );
  };

  onSelectOtherCollection = () => {
    this.setState({
      chosenCollection: null,
      newCollection: true,
      relevantPred: [],
    });
  };

  onSelectFlureePredName = (rawPredicateName, flureePredicateName) => {
    const predMap = this.state.predicateMap;
    predMap[rawPredicateName] = flureePredicateName;
    this.setState({ predicateMap: predMap });
  };

  getPredNameValidationState = (e) => {
    if (e !== undefined) {
      let collection = this.state.chosenCollection;
      if (e.target.value.startsWith(collection + "/")) return "success";
      else if (e.target.value.length > 0) return "error";
      else return null;
    }
    return null;
  };

  handleAddCollectionClose = () => {
    this.setState({ displayAddCollectionModal: false });
  };

  handleAddPredicateClose = () => {
    this.setState({ displayAddPredicateModal: false }, () =>
      this.selectRelevantDbPredicates()
    );
  };

  generateTx = () => {
  
    let {
      data,
      predicateMap,
      rawPredicates,
      chosenCollection,
      offset,
      count,
    } = this.state;
    let lookupObj = {};
    for (var i = 0; i < rawPredicates.length; i++) {
      if (predicateMap[rawPredicates[i]]) {
        lookupObj[i] = predicateMap[rawPredicates[i]];
      }
    }

    let indices = Object.keys(lookupObj);
    let txArray = [];

    data.map((row) => {
      let tx = { _id: chosenCollection };
      indices.forEach((idx) => {
        let key = lookupObj[idx];
        let value = get(row, idx);
        tx[key] = value;
      });
      txArray.push(tx);
      return null;
    });

    this.setState({ tx: txArray.splice(offset, offset + count) });
  };

  render() {
    let {
      rawPredicates,
      data,
      dbCollections,
      chosenCollection,
      containsHeader,
      newCollection,
      relevantPred,
    } = this.state;
    const { openApiServer } = this.props._db;
    return (
      <div>
        {openApiServer ? (
          <div style={{ paddingLeft: "40px", marginTop: "40px" }}>
            {this.state.displayAddCollectionModal ? (
              <NewCollectionModal
                _db={this.props._db}
                handleClose={this.handleAddCollectionClose}
                collectionRefresh={this.refreshSchema}
              ></NewCollectionModal>
            ) : null}
            {this.state.displayAddPredicateModal ? (
              <NewPredicateModal
                _db={this.props._db}
                handleClose={this.handleAddPredicateClose}
                predicateRefresh={this.refreshSchema}
              ></NewPredicateModal>
            ) : null}
            <div className="row">
              <div className="col-sm-8">
                <h2
                  className="mb10 text-uppercase"
                  style={{ color: "rgb(115, 113, 113" }}
                >
                  <span className="account-header">
                    Import Data{" "}
                    {chosenCollection ? (
                      <span>: {chosenCollection} </span>
                    ) : null}
                  </span>
                </h2>
              </div>
            </div>
            <p>Note: This import tool will only work for select datasets.</p>
            <p>
              It only works one collection at a time, and only works on
              one-to-one relationships.
            </p>
            <div className="row">
              <div
                className="col-sm-9 second-row-panel"
                style={{
                  background: "white",
                  marginLeft: "15px",
                  maxWidth: "95%",
                }}
              >
                <div className="mt10 text-center text-gray-light">
                  <h2 className="mb20">Import Data</h2>
                  <Form horizontal onSubmit={(e) => e.preventDefault()}>
                    <FormGroup>
                      <Col componentClass="div" className="text-left" sm={4}>
                        <i className="fas fa-file-import bg-success permission-icon-small mb10" />
                        Upload File:
                      </Col>
                      <Col sm={7}>
                        <FormGroup controlId="fileUpload">
                          <FormControl
                            type="file"
                            placeholder="Upload a File"
                            accept=".csv"
                            onChange={this.handleFileUpload}
                          />
                        </FormGroup>
                      </Col>
                    </FormGroup>
                    <FormGroup>
                      <Col componentClass="div" className="text-left" sm={4}>
                        <i className="fas fa-file-import bg-success permission-icon-small mb10" />
                        Headers:
                      </Col>
                      <Col componentClass="div" className="text-left" sm={7}>
                        <FormGroup>
                          <Checkbox
                            checked={containsHeader}
                            onChange={(e) => this.onChangeHeader(e)}
                            className="text-left"
                          >
                            <p>File Contains Headers</p>
                          </Checkbox>
                        </FormGroup>
                      </Col>
                      <Col sm={8} smOffset={2}>
                        <FormGroup>
                          {data.length > 0 ? (
                            <div>
                              <p>
                                Note: Only up to five columns displayed in
                                preview
                              </p>
                              <Table striped bordered condensed hover>
                                <thead>
                                  <tr>
                                    {rawPredicates.length > 0
                                      ? rawPredicates
                                          .slice(0, 5)
                                          .map((pred) => <th>{pred}</th>)
                                      : data[0]
                                          .slice(0, 5)
                                          .map((data) => <th>No Header</th>)}
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    {data[0].slice(0, 5).map((data) => (
                                      <td>{data}</td>
                                    ))}
                                  </tr>
                                </tbody>
                              </Table>
                            </div>
                          ) : (
                            <p
                              style={{
                                fontVariant: "small-caps",
                                color: "#ee5050",
                              }}
                            >
                              No File Uploaded or No Data
                            </p>
                          )}
                        </FormGroup>
                      </Col>
                    </FormGroup>
                    <FormGroup>
                      <Col componentClass="div" className="text-left" sm={4}>
                        <i className="fas fa-file-import bg-success permission-icon-small mb10" />
                        Collection:
                      </Col>
                      <Col sm={3}>
                        <FormGroup
                          controlId="chosenCollection"
                          className="text-left"
                        >
                          <DropdownButton
                            title={
                              chosenCollection ? (
                                chosenCollection
                              ) : (
                                <span>
                                  {newCollection
                                    ? "Other"
                                    : "Choose a Collection"}
                                </span>
                              )
                            }
                          >
                            {dbCollections.map((coll) => (
                              <MenuItem
                                onClick={() => this.onChangeCollection(coll)}
                              >
                                {coll}
                              </MenuItem>
                            ))}
                            <MenuItem
                              onClick={() =>
                                this.setState({
                                  displayAddCollectionModal: true,
                                })
                              }
                            >
                              <span style={{ color: "#d8418c" }}>
                                New Collection
                              </span>
                            </MenuItem>
                          </DropdownButton>
                        </FormGroup>
                      </Col>
                      <Col sm={4}>
                        <FormGroup controlId="otherCollection">
                          {newCollection ? (
                            <FormControl
                              type="text"
                              onChange={(e) =>
                                this.setState({
                                  chosenCollection: e.target.value,
                                })
                              }
                            ></FormControl>
                          ) : null}
                        </FormGroup>
                      </Col>
                    </FormGroup>
                    <FormGroup>
                      <Col componentClass="div" className="text-left" sm={4}>
                        <i className="fas fa-file-import bg-success permission-icon-small mb10" />
                        Predicates
                      </Col>
                      <Col sm={12}>
                        {rawPredicates.length > 0 ? (
                          <Table>
                            <thead>
                              <tr>
                                <th>Predicate from File</th>
                                <th>Predicate in FlureeDB</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rawPredicates.map((pred) => (
                                <tr>
                                  <td className="text-left">{pred}</td>
                                  <td className="text-left">
                                    <DropdownButton
                                      style={{ minWidth: "175px" }}
                                      title={
                                        this.state.predicateMap[pred]
                                          ? this.state.predicateMap[pred]
                                          : "Choose Predicate"
                                      }
                                    >
                                      {relevantPred.map((relPred) => (
                                        <MenuItem
                                          onClick={() =>
                                            this.onSelectFlureePredName(
                                              pred,
                                              relPred
                                            )
                                          }
                                          value={relPred}
                                        >
                                          {relPred}
                                        </MenuItem>
                                      ))}
                                      <MenuItem
                                        onClick={() =>
                                          this.setState({
                                            displayAddPredicateModal: true,
                                          })
                                        }
                                      >
                                        <span style={{ color: "#d8418c" }}>
                                          New Predicate
                                        </span>
                                      </MenuItem>
                                    </DropdownButton>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        ) : (
                          <p
                            style={{
                              fontVariant: "small-caps",
                              color: "#ee5050",
                            }}
                          >
                            No File Uploaded or No Data
                          </p>
                        )}
                      </Col>
                    </FormGroup>
                    <FormGroup>
                      <Col componentClass="div" className="text-left" sm={4}>
                        <i className="fas fa-file-import bg-success permission-icon-small mb10" />
                        Count:
                      </Col>
                      <Col sm={7}>
                        <FormGroup controlId="count">
                          <FormControl
                            type="number"
                            placeholder="Number of Entries to Upload"
                            value={this.state.count}
                            onChange={(e) =>
                              this.setState({ count: e.target.value })
                            }
                          />
                        </FormGroup>
                      </Col>
                    </FormGroup>
                    <FormGroup>
                      <Col componentClass="div" className="text-left" sm={4}>
                        <i className="fas fa-file-import bg-success permission-icon-small mb10" />
                        Offset:
                      </Col>
                      <Col sm={7}>
                        <FormGroup controlId="offset">
                          <FormControl
                            type="number"
                            placeholder="Number of Entries to Skip"
                            value={this.state.offset}
                            onChange={(e) =>
                              this.setState({ offset: e.target.value })
                            }
                          />
                        </FormGroup>
                      </Col>
                    </FormGroup>
                    <Button onClick={this.generateTx}>
                      Generate Import Transaction
                    </Button>
                  </Form>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-9 second-row-panel">
                <Editor value={this.state.tx} _db={this.props._db}></Editor>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center mt20">
            <h3>
              The Import page is not currently available with a closed API.
            </h3>
          </div>
        )}
      </div>
    );
  }
}

export default Import;
