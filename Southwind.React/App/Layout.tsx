
import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import * as moment from 'moment'
import * as numbro from 'numbro'
import { Navbar, Nav, NavItem, NavDropdown, NavbarToggler, NavbarBrand, NavLink, Collapse } from 'reactstrap'
import { Link } from 'react-router-dom'
import LoginUserControl from '../../Extensions/Signum.React.Extensions/Authorization/Login/LoginUserControl'
import * as AuthClient from '../../Extensions/Signum.React.Extensions/Authorization/AuthClient'
import OmniboxAutocomplete from '../../Extensions/Signum.React.Extensions/Omnibox/OmniboxAutocomplete'
import * as Navigator from "../../Framework/Signum.React/Scripts/Navigator"
import { GlobalModalContainer } from "../../Framework/Signum.React/Scripts/Modals"
import Notify from "../../Framework/Signum.React/Scripts/Frames/Notify"
import ContainerToggle from "../../Framework/Signum.React/Scripts/Frames/ContainerToggle"
import CultureDropdown from "../../Extensions/Signum.React.Extensions/Translation/CultureDropdown"
import * as CultureClient from "../../Extensions/Signum.React.Extensions/Translation/CultureClient"
import WorkflowDropdown from "../../Extensions/Signum.React.Extensions/Workflow/Workflow/WorkflowDropdown"
import SidebarContainer from "../../Extensions/Signum.React.Extensions/Toolbar/SidebarContainer"
import ToolbarRenderer from "../../Extensions/Signum.React.Extensions/Toolbar/Templates/ToolbarRenderer"



export default class Layout extends React.Component<{}, { refreshId: number; sideMenuVisible: boolean, isOpen: boolean}> {

    constructor(props: {}) {
        super(props);

        this.state = { refreshId: 0, sideMenuVisible: true, isOpen: false };
    }

    static switch: React.ReactElement<any>;

    handleToggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    render() {
        return (
            <div id="main" key={this.state.refreshId}>
                <Navbar color="faded" light toggleable>
                    <NavbarToggler onClick={this.handleToggle} />
                    <NavbarBrand href="/">reactstrap</NavbarBrand>
                    <Collapse isOpen={this.state.isOpen} navbar>
                        <Nav className="ml-auto" navbar>
                            <NavItem>
                                <NavLink href="/components/">Components</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink href="https://github.com/reactstrap/reactstrap">Github</NavLink>
                            </NavItem>
                        </Nav>
                    </Collapse>
                </Navbar>
                {/*<Navbar fluid
                    onToggle={(visible: boolean) => this.setState({ sideMenuVisible: visible })}
                    defaultExpanded={true}>
                    <Navbar.Header>
                        <Navbar.Brand>
                            <Link to="~/">Southwind</Link>
                        </Navbar.Brand>
                        <Navbar.Toggle />
                    </Navbar.Header>
                    <Navbar.Collapse>

                        {AuthClient.currentUser() && <ul className="nav navbar-nav">
                            <li>
                                <div style={{ width: "200px", marginTop: "8px" }}>
                                    <OmniboxAutocomplete inputAttrs={{ className: "form-control" }} />
                                </div>
                            </li>
                            <NavDropdown title="Menu" id="basic-nav-dropdown">
                                <LinkContainer to="~/" exact={true}><MenuItem>Home</MenuItem></LinkContainer>
                                <LinkContainer to="~/publicCatalog"><MenuItem>Catalog</MenuItem></LinkContainer>
                                <MenuItem divider />
                                <LinkContainer to="~/find/order"><MenuItem>Orders</MenuItem></LinkContainer>
                                <LinkContainer to="~/find/exception"><MenuItem>Exceptions</MenuItem></LinkContainer>
                            </NavDropdown>
                            <WorkflowDropdown />
                        </ul>}
                        {AuthClient.currentUser() && <ToolbarRenderer location="Top" />}
                        <ul className="nav navbar-nav navbar-right">
                            <CultureDropdown />
                            <LoginUserControl />
                        </ul>
                    </Navbar.Collapse>
                </Navbar>*/}
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
