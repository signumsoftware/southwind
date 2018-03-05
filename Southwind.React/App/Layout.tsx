
import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import * as moment from 'moment'
import * as numbro from 'numbro'
import { Link } from 'react-router-dom'
import LoginDropdown from '../../Extensions/Signum.React.Extensions/Authorization/Login/LoginDropdown'
import * as AuthClient from '../../Extensions/Signum.React.Extensions/Authorization/AuthClient'
import OmniboxAutocomplete from '../../Extensions/Signum.React.Extensions/Omnibox/OmniboxAutocomplete'
import * as Navigator from "../../Framework/Signum.React/Scripts/Navigator"
import { GlobalModalContainer } from "../../Framework/Signum.React/Scripts/Modals"
import Notify from "../../Framework/Signum.React/Scripts/Frames/Notify"
import ContainerToggle from "../../Framework/Signum.React/Scripts/Frames/ContainerToggle"
import CultureDropdown from "../../Extensions/Signum.React.Extensions/Translation/CultureDropdown"
import WorkflowDropdown from "../../Extensions/Signum.React.Extensions/Workflow/Workflow/WorkflowDropdown"
import * as CultureClient from "../../Extensions/Signum.React.Extensions/Translation/CultureClient"
import SidebarContainer from "../../Extensions/Signum.React.Extensions/Toolbar/SidebarContainer"
import ToolbarRenderer from "../../Extensions/Signum.React.Extensions/Toolbar/Templates/ToolbarRenderer"
import VersionChangedAlert from '../../Framework/Signum.React/Scripts/Frames/VersionChangedAlert';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Collapse, LinkContainer } from '../../Framework/Signum.React/Scripts/Components';

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
                <div>
                    <nav className="navbar navbar-light navbar-expand">
                        <button type="button" className="navbar-toggler" onClick={this.handleToggle}>
                            <span className="navbar-toggler-icon"/>
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
        );
    }

    componentDidCatch(error: any, info: any) {
        console.log(error);
        console.log(info);
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
