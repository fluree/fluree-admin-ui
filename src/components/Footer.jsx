import React from "react";

class Footer extends React.Component {
  state = {};

  componentDidMount() {
    this.setState({ showSlackModal: false });
  }

  closeSlackModal = () => {
    this.setState({ showSlackModal: false });
  };

  render() {
    return (
      <div className="m40 text-center border-top-gray">
        <ul
          className="nav nav-pills mt10"
          style={{
            display: "flex",
            justifyContent: "center",
            color: "#091133",
          }}
        >
          <li role="presentation">
            <a
              style={{ color: "#091133" }}
              href="https://docs.flur.ee"
              rel="noopener noreferrer"
              target="_blank"
              className="small strong text-muted"
            >
              Documentation
            </a>
          </li>
          <li role="presentation">
            <a
              style={{ color: "#091133" }}
              href="mailto:support@flur.ee"
              className="small strong text-muted"
            >
              Contact
            </a>
          </li>
          <li>
            <a
              style={{ color: "#091133" }}
              className="small strong text-muted"
              href="https://launchpass.com/flureedb"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-slack" />
              &nbsp;Fluree Slack
            </a>{" "}
          </li>
        </ul>
        <div className="small" style={{ color: "#091133" }}>
          v1.0.0-beta1 &nbsp;
          <a
            style={{ color: "#091133" }}
            href="https://flur.ee/agreements/FlureeEnterpriseTermsofService.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms
          </a>
          &nbsp;+&nbsp;
          <a
            style={{ color: "#091133" }}
            href="https://flur.ee/wp-content/uploads/2020/07/Fluree-Privacy-Policy-6-20.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy
          </a>
          &nbsp;© Fluree, PBC
        </div>
      </div>
    );
  }
}

export default Footer;
