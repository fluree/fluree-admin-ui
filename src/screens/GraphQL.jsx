import React from "react";
import GraphiQL from "graphiql";
import { flureeFetch } from "../flureeFetch";
import "../components/graphiql.css";

export default class GraphQLQuery extends React.Component {
  state = {};

  handlePrettifyQuery = () => {
    this.graphiql && this.graphiql.handlePrettifyQuery();
  };

  handleToggleHistory = () => {
    this.graphiql && this.graphiql.handleToggleHistory();
  };

  graphQLFetcher = (graphQLParams) => {
    const fullDb = this.props._db.db.split("/");

    let opts = {
      ip: this.props._db.ip,
      body: graphQLParams,
      auth: this.props._db.token,
      network: fullDb[0],
      endpoint: "graphql",
      ledger: fullDb[1],
    };

    return flureeFetch(opts)
      .then((response) => {
        let res = response.json || response;
        res = res.result || res;
        if (res.status > 400) {
          this.props._db.displayError(res);
        } else {
          this.props._db.dismissError();
          return res;
        }
      })
      .catch((err) => {
        this.props._db.displayError(err);
      });
  };

  render() {
    const { openApiServer } = this.props._db;
    return (
      <div style={{ height: "100vh", width: "100%" }}>
        {openApiServer ? (
          <GraphiQL
            ref={(c) => {
              this.graphiql = c;
            }}
            fetcher={this.graphQLFetcher}
          >
            <GraphiQL.Logo>GraphQL</GraphiQL.Logo>
            <GraphiQL.Toolbar>
              <GraphiQL.Button
                onClick={this.handlePrettifyQuery}
                title="Prettify Query"
                label="Prettify"
              />
              <GraphiQL.Button
                onClick={this.handleToggleHistory}
                title="Show History"
                label="History"
              />
            </GraphiQL.Toolbar>
          </GraphiQL>
        ) : (
          <div className="text-center mt20">
            <h3>
              The GraphQL page is not currently available with a closed API.
            </h3>
          </div>
        )}
      </div>
    );
  }
}
