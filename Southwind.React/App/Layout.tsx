
import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import * as moment from 'moment'
import * as numbro from 'numbro'
import { Navbar, Nav, NavItem, NavDropdown, NavbarToggler, NavbarBrand, NavLink, Collapse, DropdownItem, DropdownToggle, UncontrolledNavDropdown, DropdownMenu } from 'reactstrap'
import { Link } from 'react-router-dom'
import LoginDropdown from '../../Extensions/Signum.React.Extensions/Authorization/Login/LoginDropdown'
import * as AuthClient from '../../Extensions/Signum.React.Extensions/Authorization/AuthClient'
import OmniboxAutocomplete from '../../Extensions/Signum.React.Extensions/Omnibox/OmniboxAutocomplete'
import * as Navigator from "../../Framework/Signum.React/Scripts/Navigator"
import { LinkContainer } from "../../Framework/Signum.React/Scripts/LinkContainer"
import { GlobalModalContainer } from "../../Framework/Signum.React/Scripts/Modals"
import Notify from "../../Framework/Signum.React/Scripts/Frames/Notify"
import ContainerToggle from "../../Framework/Signum.React/Scripts/Frames/ContainerToggle"
import CultureDropdown from "../../Extensions/Signum.React.Extensions/Translation/CultureDropdown"
import * as CultureClient from "../../Extensions/Signum.React.Extensions/Translation/CultureClient"
import WorkflowDropdown from "../../Extensions/Signum.React.Extensions/Workflow/Workflow/WorkflowDropdown"
import SidebarContainer from "../../Extensions/Signum.React.Extensions/Toolbar/SidebarContainer"
import ToolbarRenderer from "../../Extensions/Signum.React.Extensions/Toolbar/Templates/ToolbarRenderer"



export default class Layout extends React.Component<{}, { refreshId: number; sideMenuVisible: boolean, isOpen: boolean }> {

    constructor(props: {}) {
        super(props);

        this.state = { refreshId: 0, sideMenuVisible: true, isOpen: false };
    }

    static switch: React.ReactElement<any>;

    handleToggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    render() {
        return (
            <div id="main" key={this.state.refreshId}>
                <Navbar light toggleable>
                    <NavbarToggler onClick={this.handleToggle} />
                    <Link to="~/" className="navbar-brand">Southwind</Link>
                    <Collapse isOpen={this.state.isOpen} navbar>
                        {AuthClient.currentUser() && <Nav className="mr-auto" navbar>
                            <li>
                                <div style={{ width: "200px" }}>
                                    <OmniboxAutocomplete inputAttrs={{ className: "form-control" }} />
                                </div>
                            </li>
                            <UncontrolledNavDropdown>
                                <DropdownToggle nav caret>
                                    Menu
                                </DropdownToggle>
                                <DropdownMenu>
                                    <LinkContainer to="~/" exact={true}><DropdownItem>Home</DropdownItem></LinkContainer>
                                    <LinkContainer to="~/publicCatalog"><DropdownItem>Catalog</DropdownItem></LinkContainer>
                                    <DropdownItem divider />
                                    <LinkContainer to="~/find/order"><DropdownItem>Orders</DropdownItem></LinkContainer>
                                    <LinkContainer to="~/find/exception"><DropdownItem>Exceptions</DropdownItem></LinkContainer>
                                </DropdownMenu>
                            </UncontrolledNavDropdown>
                            <WorkflowDropdown />
                        </Nav>}
                        {AuthClient.currentUser() && <ToolbarRenderer location="Top" />}
                        <Nav className="ml-auto" navbar>
                            <CultureDropdown />
                            <LoginDropdown />
                        </Nav>
                    </Collapse>
                </Navbar>
                <Notify />
                <div id="main-container">
                    <SidebarContainer
                        sidebarVisible={AuthClient.currentUser() && this.state.sideMenuVisible}
                        sidebarContent={<ToolbarRenderer location="Side" />}>
                        {Layout.switch}
                    </SidebarContainer>
                    {/* Layout
                    <ContainerToggle>
                    {Layout.switch}
                    </ContainerToggle>
                    Layout */}
                </div>
                <GlobalModalContainer />
                <div id="footer">
                    <div className="container">
                        <p className="text-muted">Made by <a href="http://signumsoftware.com/">Signum Software</a>  using <a href="http://signumframework.com/">Signum Framework</a>.</p>
                    </div>
                </div>
            </div>
        );
    }

    componentWillMount() {
        AuthClient.onCurrentUserChanged.push(this.handleResetUI);
        CultureClient.onCultureLoaded.push(this.handleResetUI);
    }

    componentWillUnmount() {
        AuthClient.onCurrentUserChanged.remove(this.handleResetUI);
        CultureClient.onCultureLoaded.remove(this.handleResetUI);
    }

    handleResetUI = () => {
        this.setState({ refreshId: this.state.refreshId + 1 });
    };
}
