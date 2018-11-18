
import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import * as moment from 'moment'
import * as numbro from 'numbro'
import { Link } from 'react-router-dom'
import LoginDropdown from '@extensions/Authorization/Login/LoginDropdown'
import * as AuthClient from '@extensions/Authorization/AuthClient'
import OmniboxAutocomplete from '@extensions/Omnibox/OmniboxAutocomplete'
import * as Navigator from "@framework/Navigator"
import { GlobalModalContainer } from "@framework/Modals"
import Notify from "@framework/Frames/Notify"
import ContainerToggle from "@framework/Frames/ContainerToggle"
import CultureDropdown from "@extensions/Translation/CultureDropdown"
import WorkflowDropdown from "@extensions/Workflow/Workflow/WorkflowDropdown"
import * as CultureClient from "@extensions/Translation/CultureClient"
import SidebarContainer from "@extensions/Toolbar/SidebarContainer"
import ToolbarRenderer from "@extensions/Toolbar/Templates/ToolbarRenderer"
import VersionChangedAlert from '@framework/Frames/VersionChangedAlert';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Collapse, LinkContainer, ErrorBoundary } from '@framework/Components';
import * as RestClient from "@extensions/Rest/RestClient"

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

    handleSwaggerClick = (e: React.MouseEvent<any>) => {
        e.preventDefault();
        RestClient.API.getCurrentRestApiKey().then(key => {
            window.location.assign(Navigator.toAbsoluteUrl("~/swagger/ui/index?apiKey=" + (key || "")));
        }).done();
    }

    render() {
        return (
            <ErrorBoundary >
                <div id="main" key={this.state.refreshId}>
                    <div>
                        <nav className="navbar navbar-light navbar-expand">
                            <button type="button" className="navbar-toggler" onClick={this.handleToggle}>
                                <span className="navbar-toggler-icon" />
                            </button>
                            <Link to="~/" className="navbar-brand">Southwind</Link>
                            <Collapse isOpen={this.state.isOpen} navbar>
                                {AuthClient.currentUser() && <div className="navbar-nav mr-auto">
                                    <li>
                                        <div className="omnibox-container" style={{ width: "200px" }}>
                                            <OmniboxAutocomplete inputAttrs={{ className: "form-control" }} />
                                        </div>
                                    </li>
                                    <UncontrolledDropdown>
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
                                    </UncontrolledDropdown>
                                    <WorkflowDropdown />
                                </div>}
                                {AuthClient.currentUser() && <ToolbarRenderer location="Top" />}
                                <div className="navbar-nav ml-auto">
                                    <li className="nav-item">
                                        <a className="nav-link" href="#" onClick={this.handleSwaggerClick} title="Swagger API Documentation">&nbsp; API</a>
                                    </li>
                                    <CultureDropdown />
                                    <LoginDropdown />
                                </div>
                            </Collapse>
                        </nav>
                    </div>
                    <Notify />
                    <div id="main-container">
                        <SidebarContainer
                            sidebarVisible={AuthClient.currentUser() && this.state.sideMenuVisible}
                            sidebarContent={<ToolbarRenderer location="Side" />}>
                            <VersionChangedAlert />
                            {Layout.switch}
                        </SidebarContainer>
                        {/* Layout
                    <ContainerToggle>
                        <VersionChangedAlert />
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
            </ErrorBoundary>
        );
    }

    componentWillMount() {
        Navigator.setResetUI(this.handleResetUI);
    }

    componentWillUnmount() {
        Navigator.setResetUI(() => { });
    }

    handleResetUI = () => {
        this.setState({ refreshId: this.state.refreshId + 1 });
    };
}
