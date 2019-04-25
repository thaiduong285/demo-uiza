import React from "react";
import { Link } from "react-router-dom";
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem
} from 'reactstrap';

class NavBar extends React.Component {
    constructor(props) {
        super(props);
    
        this.toggle = this.toggle.bind(this);
        this.state = {
          isOpen: false
        };
      }
      toggle() {
        this.setState({
          isOpen: !this.state.isOpen
        });
      }
      render() {
        return (
          <div>
            <Navbar color="light" light expand="md">
              <NavbarBrand href="/">reactstrap</NavbarBrand>
              <NavbarToggler onClick={this.toggle} />
              <Collapse isOpen={this.state.isOpen} navbar>
                <Nav className="ml-auto" navbar>
                  <NavItem>
                    <Link to="/entity?limit=5&page=1" className="nav-link">Entities</Link>
                  </NavItem>
                  <NavItem>
                    <Link to="/live-streaming" className="nav-link">Live Stream</Link>
                  </NavItem>
                </Nav>
              </Collapse>
            </Navbar>
          </div>
        );
      }
}

export default NavBar