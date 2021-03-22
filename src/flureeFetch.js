import fetch from "isomorphic-fetch";

function gateway() {
  let production = process.env.NODE_ENV === "production";
  // production build is same for prod, staging & test environments

  if (production) {
    return window.location.origin
      ? window.location.origin
      : window.location.port
      ? window.location.protocol +
        "//" +
        window.location.hostname +
        ":" +
        window.location.port
      : window.location.protocol + "//" + window.location.hostname;
  } else {
    return "http://localhost:8090";
  }
}

function parseJSON(response) {
  return response.json().then(function (json) {
    const newResponse = Object.assign(response, { json });

    if (response.status < 300) {
      return newResponse;
    } else {
      throw newResponse;
    }
  });
}

function fullEndpoint(endpoint, network, db, body, ip) {
  const endpointInfix = "fdb";

  const locatedEndpoint = [
    "query",
    "multi-query",
    "block",
    "history",
    "transact",
    "graphql",
    "sparql",
    "sql",
    "command",
    "ledger-stats",
    "block-range-with-txn",
    "nw-state",
    "version"
  ].includes(endpoint);

  const startURI = gateway();

  if (locatedEndpoint) {
    if (endpoint === "nw-state" || endpoint === "version") {
      return `${startURI}/${endpointInfix}/${endpoint}`;
    } else {
      return `${startURI}/${endpointInfix}/${network}/${db}/${endpoint}`;
    }
  }

  const prefixedEndpoints = [
    "dbs",
    "action",
    "new-db",
    "accounts",
    "signin",
    "health",
    "sub",
    "new-pw",
    "reset-pw",
    "activate-account",
    "delete-db",
  ].includes(endpoint);

  if (prefixedEndpoints) {
    return `${startURI}/${endpointInfix}/${endpoint}`;
  }

  if (endpoint === "logs") {
    return `${startURI}/${endpointInfix}/fdb/${endpoint}/${network}`;
  }

  throw {
    status: 400,
    message: "Invalid endpoint",
  };
}

const flureeFetch = (opts) => {
  
  const { ip, body, auth, network, db, endpoint, headers, noRedirect } = opts;
  const fullUri = fullEndpoint(endpoint, network, db, body, ip);

  const finalHeaders = headers
    ? headers
    : {
        "Content-Type": "application/json",
        "Request-Timeout": 20000,
        Authorization: `Bearer ${auth}`,
      };

  const fetchOpts = {
    method: "POST",
    headers: finalHeaders,
    body: JSON.stringify(body),
  };

  return fetch(fullUri, fetchOpts)
    .then(parseJSON)
    .catch((error) => {
      if (!noRedirect && (error.status === 401 || error.status === 403)) {
        localStorage.removeItem("token");
        if (this.props) {
          this.props.logout();
        } else {
          window.location = "/";
        }
      } else {
        if (error.json) {
          return error.json;
        }
        return error;
      }
    });
};

const flureeVersion = async () => {
  const fullUri = fullEndpoint("version")
  const response = await fetch(fullUri)
  return await response.text()
}

export { flureeFetch, gateway, flureeVersion };
