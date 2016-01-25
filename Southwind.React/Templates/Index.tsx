/// <reference path="../../framework/signum.react/scripts/globals.ts" />

import * as React from 'react'
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap'
import { LinkContainer, IndexLinkContainer } from 'react-router-bootstrap'
import { Link } from 'react-router'
import LoginUserControl from '../../Extensions/Signum.React.Extensions/Authorization/Login/LoginUserControl'
import { GlobalModalContainer } from "../../Framework/Signum.React/Scripts/Modals"


export default class Index extends React.Component<{ children: any }, {}> {
    render() {

        return (<div id="main">
            <Navbar inverse>
                <Navbar.Header>
                    <Navbar.Brand>
                        <Link to="/">Southwind</Link>
                        </Navbar.Brand>
                    <Navbar.Toggle />
                    </Navbar.Header>
    <Navbar.Collapse>
      <Nav>
        <NavDropdown eventKey={3} title="Dropdown" id="basic-nav-dropdown">
             <IndexLinkContainer to="/"><MenuItem>Home</MenuItem></IndexLinkContainer>
             <LinkContainer to="/find/order"><MenuItem>Orders</MenuItem></LinkContainer>
                              <MenuItem divider />
             <LinkContainer to="/find/exception"><MenuItem>Exceptions</MenuItem></LinkContainer>
            </NavDropdown>
          </Nav>
      <Nav pullRight>
       <LoginUserControl />
          </Nav>
        </Navbar.Collapse>
                </Navbar>


        <div className="container">{this.props.children}</div>
         <GlobalModalContainer/>
        <div id="push"></div>
            </div>);
    }
}
