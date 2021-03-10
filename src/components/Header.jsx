import React from "react";
import {
  Navbar,
  Nav,
  NavDropdown,
  MenuItem,
  DropdownButton,
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

const DownloadedNav = (props) => {
  return (
    <Nav id="config-container" style={{display: "flex", direction: "row"}}>
      <NavDropdown
        eventKey={4}
        title="Change QL"
        id="basic-nav-dropdown"
        className="account-icon"
      >
        {["FlureeQL", "SPARQL", "GraphQL", "SQL"].map((language) => (
          <LinkContainer
            to={`/${language.toLowerCase()}`}
            className="text-center"
            onClick={() => props._db.changeQueryLanguage(language)}
          >
            <MenuItem
              // onClick={this.toggleClose}
              eventKey={{ language }}
              key={language}
              value={language}
            >
              {language}
            </MenuItem>
          </LinkContainer>
        ))}
      </NavDropdown>
      <NavDropdown
        eventKey={4}
        title="Change Config"
        id="basic-nav-dropdown"
        className="account-icon"
        style={{marginLeft: "auto"}}
        
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

const QueryLanguageSelector = (props) => {
  console.log(props);
  return <div></div>;
};
class Header extends React.Component {
  render() {
    return (
      <div
      >
        {/* <div
          style={{ border: "1px red solid", marginLeft: "auto", width: "100%" }}
        >
      
        </div> */}
        <div style={{width: "100%" }}>
          {DownloadedNav(this.props)}
        </div>
      </div>
    );
  }
}

export default Header;
