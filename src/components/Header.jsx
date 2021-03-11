import React from "react";
import { Navbar, Nav, NavDropdown, MenuItem } from "react-bootstrap";

const DownloadedNav = (props) => {
  return (
    <Nav id="config-container">
      <NavDropdown
        eventKey={4}
        title="Change Config"
        id="basic-nav-dropdown"
        className="account-icon"
      >
        <Navbar.Text
          style={{
            fontSize: "14px",
            fontVariant: "small-caps",
            color: "black",
            marginBottom: "5px",
            marginTop: "5px",
          }}
        >
          IP: <span style={{ color: "rgb(101, 99, 99)" }}>{props._db.ip}</span>
        </Navbar.Text>
        <MenuItem id="changeIPText" onClick={() => props._db.displayConfig()}>
          Change Config
        </MenuItem>
      </NavDropdown>
    </Nav>
  );
};

class Header extends React.Component {
  render() {
    return (
      <div style={{ width: "100%", display: "flex", direction: "row" }}>
        <div style={{ marginLeft: "80%" }}>{DownloadedNav(this.props)}</div>
      </div>
    );
  }
}

export default Header;
