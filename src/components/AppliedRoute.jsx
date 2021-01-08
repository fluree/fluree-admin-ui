import React from "react";
import { Route } from "react-router-dom";

export default ({ component: C, props: cProps, _db, ...rest }) => (
  <Route {...rest} render={(props) => <C {...props} _db={_db} {...cProps} />} />
);
