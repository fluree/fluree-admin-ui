import React from "react";
import { LinkContainer } from "react-router-bootstrap";
import {
  Navbar,
  Nav,
  NavItem,
  NavDropdown,
  MenuItem,
  DropdownButton,
} from "react-bootstrap";
import { Switch } from "react-router-dom";

class Sidebar extends React.Component {
  state = {
    error: null,
    toggleOpen: false,
  };

  handleSelect(selected) {
    selected = selected || {};
    if (selected.db) {
      this.props._db.changeDatabase(selected.db);
    }
    if (selected.language) {
      this.props._db.changeQueryLanguage(selected.language);
    }
  }

  toggleSideBar = () => {
    this.setState({ toggleOpen: !this.state.toggleOpen });
  };

  toggleOpen = () => {
    this.setState({ toggleOpen: true });
  };

  toggleClose = () => {
    this.setState({ toggleOpen: false });
  };

  render() {
    let { dbs, db, queryLanguage } = this.props._db;
    let openApiServer = this.props.openApiServer;

    const noDbs = dbs.length === 0 ? true : false;

    if (!noDbs) {
      dbs = dbs.sort();
    }

    return (
    
        <Navbar
          id="navbar-side"
          fluid
          className={
            this.state.toggleOpen
              ? "navbar-side toggled-open-sidebar"
              : "navbar-side untoggled-closed-sidebar"
          }
        >
          <Navbar.Brand className="nav-hide-md">
            <LinkContainer to="/">
              <img
                id="img-brand"
                alt="FlureeDB"
                src="/white_horizontal.svg"
              />
            </LinkContainer>
          </Navbar.Brand>

          <i
            className="fas fa-bars menu-symbol nav-show-md toggle-button"
            onClick={this.toggleSideBar}
          />
          {noDbs ? (
            <Nav onSelect={this.handleSelect.bind(this)}>
              <LinkContainer to="/account" id="account-nav">
                <NavItem eventKey={1}>
                  <i
                    className="fas fa-info-circle hidden-sm-down menu-symbol"
                    aria-hidden="true"
                  ></i>
                  <span
                    className={
                      !this.state.toggleOpen
                        ? "nav-hide-md menu-item account-link"
                        : "menu-item account-link"
                    }
                  >
                    Account Info
                  </span>
                </NavItem>
              </LinkContainer>
              <li>
                <hr className="border-top-solid-gray" />
              </li>
              <NavItem
                eventKey="docs"
                href="https://docs.flur.ee"
                target="_blank"
                className="docs"
                id="docs-nav"
              >
                <i className="fas fa-book menu-symbol" />
                <span
                  className={
                    !this.state.toggleOpen
                      ? "nav-hide-md menu-item"
                      : "menu-item"
                  }
                >
                  Docs
                </span>
              </NavItem>
            </Nav>
          ) : (
            <Nav onSelect={this.handleSelect.bind(this)}>
              <LinkContainer to="/account" id="account-nav">
                <NavItem eventKey={2}>
                  <i
                    className="fas fa-info-circle hidden-sm-down menu-symbol"
                    aria-hidden="true"
                  ></i>
                  <span
                    className={
                      !this.state.toggleOpen
                        ? "nav-hide-md menu-item account-link"
                        : "menu-item account-link"
                    }
                  >
                    Dashboard
                  </span>
                </NavItem>
              </LinkContainer>
              <NavDropdown
                onClick={this.toggleOpen}
                title={
                  <span>
                    <span>
                      <i
                        className="fas fa-cube menu-symbol"
                        aria-hidden="true"
                      ></i>
                      <span
                        className={
                          !this.state.toggleOpen
                            ? "nav-hide-md menu-item"
                            : "menu-item"
                        }
                      >
                        {db}
                      </span>
                    </span>
                  </span>
                }
                id="database-dropdown"
              >
                <MenuItem header>Select Ledger:</MenuItem>
                {dbs.map((db) => (
                  <MenuItem
                    onClick={this.toggleClose}
                    eventKey={{ db: db }}
                    key={db}
                    value={db}
                  >
                    {db}
                  </MenuItem>
                ))}
              </NavDropdown>

              <li>
                <hr className="border-top-solid-gray" />
              </li>

              <DropdownButton
                id="queryButton"
                title={
                  <span>
                    <span>
                      <i
                        className="fas fa-search menu-symbol"
                        aria-hidden="true"
                      ></i>
                      <span
                        className={
                          !this.state.toggleOpen
                            ? "nav-hide-md menu-item"
                            : "menu-item"
                        }
                      >
                        Query
                      </span>
                    </span>
                    {/* <span
                            className={!this.state.toggleOpen ? "nav-hide-md" : null}
                    >
                            <i className="fas fa-caret-down dropdown" />
                    </span> */}
                  </span>
                }
              >
                {["FlureeQL", "SPARQL", "GraphQL", "SQL"].map((language) => (
                  <LinkContainer
                    to={`/${language.toLowerCase()}`}
                    className="text-center"
                    key={language}
                  >
                    <MenuItem key={language}>{language}</MenuItem>
                  </LinkContainer>
                ))}
              </DropdownButton>

              <LinkContainer to="/transact">
                <NavItem eventKey={4} href="#">
                  <i
                    className="fas fa-handshake menu-symbol"
                    aria-hidden="true"
                  ></i>
                  <span
                    className={
                      !this.state.toggleOpen
                        ? "nav-hide-md menu-item"
                        : "menu-item"
                    }
                  >
                    Transact
                  </span>
                </NavItem>
              </LinkContainer>
              <LinkContainer to="/schema">
                <NavItem eventKey={5} href="#">
                  <i
                    className="fas fa-database menu-symbol"
                    aria-hidden="true"
                  ></i>
                  <span
                    className={
                      !this.state.toggleOpen
                        ? "nav-hide-md menu-item"
                        : "menu-item"
                    }
                  >
                    Schema
                  </span>
                </NavItem>
              </LinkContainer>
              {openApiServer && (
                <LinkContainer to="/networkdashboard">
                  <NavItem eventKey={6} href="#">
                    <i
                      className="fas fa-network-wired menu-symbol"
                      aria-hidden="true"
                    ></i>
                    <span
                      className={
                        !this.state.toggleOpen
                          ? "nav-hide-md menu-item"
                          : "menu-item"
                      }
                    >
                      Network
                    </span>
                  </NavItem>
                </LinkContainer>
              )}
              {openApiServer && (
                <LinkContainer to="/exploredb">
                  <NavItem eventKey={7} href="#">
                    <i
                      className="fas fa-search  menu-symbol"
                      aria-hidden="true"
                    ></i>
                    <span
                      className={
                        !this.state.toggleOpen
                          ? "nav-hide-md menu-item"
                          : "menu-item"
                      }
                    >
                      Explore Ledger
                    </span>
                  </NavItem>
                </LinkContainer>
              )}

              <LinkContainer to="/import">
                <NavItem eventKey={8} href="#">
                  <i
                    className="far fa-chart-bar menu-symbol"
                    aria-hidden="true"
                  ></i>
                  <span
                    className={
                      !this.state.toggleOpen
                        ? "nav-hide-md menu-item"
                        : "menu-item"
                    }
                  >
                    Import
                  </span>
                </NavItem>
              </LinkContainer>
              <LinkContainer to="/permissions">
                <NavItem eventKey={9} href="#">
                  <i
                    className="fas fa-file-import menu-symbol"
                    aria-hidden="true"
                  ></i>
                  <span
                    className={
                      !this.state.toggleOpen
                        ? "nav-hide-md menu-item"
                        : "menu-item"
                    }
                  >
                    Permissions
                  </span>
                </NavItem>
              </LinkContainer>
              <li>
                <hr className="border-top-solid-gray" />
              </li>
              <NavItem
                eventKey="docs"
                href="https://docs.flur.ee"
                target="_blank"
                className="docs"
                id="docs-nav"
              >
                <i className="fas fa-book menu-symbol" />
                <span
                  className={
                    !this.state.toggleOpen
                      ? "nav-hide-md menu-item"
                      : "menu-item"
                  }
                >
                  Docs
                </span>
              </NavItem>
            </Nav>
          )}
        </Navbar>
     
    );
  }
}

export default Sidebar;
