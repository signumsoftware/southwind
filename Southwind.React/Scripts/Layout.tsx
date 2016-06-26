
import * as React from 'react'
import * as moment from 'moment'
import * as numbro from 'numbro'
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap'
import { LinkContainer, IndexLinkContainer } from 'react-router-bootstrap'
import { Link } from 'react-router'
import LoginUserControl from '../../Extensions/Signum.React.Extensions/Authorization/Login/LoginUserControl'
import * as AuthClient from '../../Extensions/Signum.React.Extensions/Authorization/AuthClient'
import OmniboxAutocomplete from '../../Extensions/Signum.React.Extensions/Omnibox/OmniboxAutocomplete'
import { GlobalModalContainer } from "../../Framework/Signum.React/Scripts/Modals"
import Notify from "../../Framework/Signum.React/Scripts/Frames/Notify"
import ContainerToggle from "../../Framework/Signum.React/Scripts/Frames/ContainerToggle"
import CultureDropdown from "../../Extensions/Signum.React.Extensions/Translation/CultureDropdown"
import * as CultureClient from "../../Extensions/Signum.React.Extensions/Translation/CultureClient"

export default class Layout extends React.Component<{ children: any }, { refreshId: number }> {

    state = { refreshId: 0 };

    render() {
        return (
            <div id="main" key={this.state.refreshId}>
                <Navbar inverse>
                    <Navbar.Header>
                        <Navbar.Brand>
                            <Link to="~/">Southwind</Link>
                        </Navbar.Brand>
                        <Navbar.Toggle />
                    </Navbar.Header>
                    <Navbar.Collapse>

                        { AuthClient.currentUser() && <Nav>
                            <li>
                                <div style={{ width: "200px", marginTop: "8px" }}>
                                    <OmniboxAutocomplete
                                        inputAttrs={{ className: "form-control" }}
                                        />
                                </div>
                            </li>
                            <NavDropdown eventKey={3} title="Menu" id="basic-nav-dropdown">
                                <IndexLinkContainer to="~/"><MenuItem>Home</MenuItem></IndexLinkContainer>
                                <LinkContainer to="~/find/order"><MenuItem>Orders</MenuItem></LinkContainer>
                                <MenuItem divider />
                                <LinkContainer to="~/find/exception"><MenuItem>Exceptions</MenuItem></LinkContainer>
                            </NavDropdown>
                        </Nav>}
                        <Nav pullRight>
                            <CultureDropdown />
                            <LoginUserControl />
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
                <Notify/>
                <ContainerToggle>
                    {this.props.children}
                </ContainerToggle>
                <GlobalModalContainer/>
                <div id="push"></div>
            </div>
        );
    }


    handleResetUI = () => {
        this.setState({ refreshId: this.state.refreshId + 1 });
    };

    componentWillMount() {
        AuthClient.onCurrentUserChanged.push(this.handleResetUI);
        CultureClient.onCultureLoaded.push(this.handleResetUI);
    }

    componentWillUnmount() {
        AuthClient.onCurrentUserChanged.remove(this.handleResetUI);
        CultureClient.onCultureLoaded.remove(this.handleResetUI);
    }

   
}
