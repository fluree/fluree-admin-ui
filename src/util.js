export function convertArrayOfObjectsToCSV(args) {
  var result, ctr, keys, columnDelimiter, lineDelimiter, data;

  data = args.data || null;
  if (data == null || !data.length) {
    return null;
  }

  columnDelimiter = args.columnDelimiter || ",";
  lineDelimiter = args.lineDelimiter || "\n";

  keys = Object.keys(data[0]);

  result = "";
  result += keys.join(columnDelimiter);
  result += lineDelimiter;

  data.forEach(function (item) {
    ctr = 0;
    keys.forEach(function (key) {
      if (ctr > 0) result += columnDelimiter;

      result += item[key];
      ctr++;
    });
    result += lineDelimiter;
  });

  return result;
}

export function loadHistory(dbName, endpoint) {
  const key =
    endpoint === "flureeQL"
      ? dbName + "_history"
      : dbName + "_" + endpoint + "history";

  const history = localStorage.getItem(key);

  if (history) {
    return JSON.parse(history);
  } else if (endpoint === "flureeQL") {
    return [
      {
        action: "query",
        type: "query",
        param: JSON.stringify(
          {
            select: ["*"],
            from: "_collection",
          },
          null,
          2
        ),
      },
    ];
  } else if (endpoint === "sparQL") {
    return [
      {
        action: "query",
        type: "query",
        param:
          "SELECT ?collection \nWHERE { \n  ?collectionID fdb:_collection/name ?collection. \n  }",
      },
    ];
  } else if (endpoint === "sql") {
    return [
      {
        action: "query",
        type: "query",
        param: "SELECT * FROM _collection",
      },
    ];
  }
}

export function pushHistory(
  dbName,
  history,
  action,
  param,
  response,
  queryType,
  endpoint
) {
  const HISTORY_MAX = 50;

  const key =
    endpoint === "flureeQL"
      ? dbName + "_history"
      : dbName + "_" + endpoint + "history";

  const resKey =
    endpoint === "flureeQL"
      ? dbName + "_result"
      : dbName + "_" + endpoint + "result";

  if (!history[0] || param !== history[0].param) {
    // only add to history if the params are different
    let paramStore =
      JSON.stringify(param).length > 5000
        ? "Values greater than 5k are not saved in the admin UI."
        : param;
    let historyObj = { action: action, param: paramStore };

    if (action === "query") {
      historyObj["type"] = queryType;
    }

    history.unshift(historyObj);
  }
 
  if (history.length > HISTORY_MAX) {
    history.splice(-1, 1);
  }

  let responseStore =
    JSON.stringify(response).length > 5000
      ? "Values greater than 5k are not saved in the admin UI."
      : response;

  localStorage.setItem(key, JSON.stringify(history));
  localStorage.setItem(resKey, JSON.stringify(responseStore));
  return history;
}

export function getLastHistoryType(history, type) {
  for (var i = 0; i < history.length; i++) {
    if (history[i].type === type) {
      return history[i].param;
    }
  }
}

export function getLastHistoryAction(history, action) {
  for (var i = 0; i < history.length; i++) {
    if (history[i].action === action) {
      return history[i].param;
    }
  }
}

export function getLastHistory(history) {
  for (var i = 0; i < history.length; i++) {
    return history[i];
  }
}
