import React from "react";

class NotFound extends React.Component {
  state = {
    showHelp: false,
  };

  render() {
    return (
      <div className="container-xs-height full-height">
        <div className="row-xs-height">
          <div className="col-xs-height col-middle">
            <div className="error-container text-center">
              <h1 className="error-number">404</h1>
              <h2 className="semi-bold">
                {"Sorry, but we couldn't find this page"}
              </h2>
              <p>
                The page you are looking for does not exist.
                <br />
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={() => this.setState({ showHelp: true })}
                >
                  Report this?
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default NotFound;
