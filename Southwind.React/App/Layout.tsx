import * as React from 'react'
import { Link } from 'react-router-dom'
import LoginDropdown from '@extensions/Authorization/Login/LoginDropdown'
import * as AuthClient from '@extensions/Authorization/AuthClient'
import OmniboxAutocomplete from '@extensions/Omnibox/OmniboxAutocomplete'
import * as Navigator from "@framework/Navigator"
import { GlobalModalContainer } from "@framework/Modals"
import Notify from "@framework/Frames/Notify"
import CultureDropdown from "@extensions/Translation/CultureDropdown"
import WorkflowDropdown from "@extensions/Workflow/Workflow/WorkflowDropdown"
import SidebarContainer from "@extensions/Toolbar/SidebarContainer"
import ToolbarRenderer from "@extensions/Toolbar/Templates/ToolbarRenderer"
import VersionChangedAlert from '@framework/Frames/VersionChangedAlert';
import { LinkContainer, ErrorBoundary } from '@framework/Components';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import * as RestClient from "@extensions/Rest/RestClient";

export default function Layout() {
  const [refreshId, setRefreshId] = React.useState(0);
  const [sideMenuVisible] = React.useState(true);

  function resetUI() {
    setRefreshId(rID => rID + 1);
  };

  React.useEffect(() => {
    Navigator.setResetUI(resetUI);
    return () => Navigator.setResetUI(() => { });
  }, []);

  function handleSwaggerClick(e: React.MouseEvent<any>) {
    e.preventDefault();
    RestClient.API.getCurrentRestApiKey().then(key => {
      window.location.assign(Navigator.toAbsoluteUrl("~/swagger/index.html?apiKey=" + (key || "")));
    }).done();
  }

  return (
    <ErrorBoundary >
      <div id="main" key={refreshId}>
        <div>
          <Navbar bg="light" expand="lg">
            <Link to="~/" className="navbar-brand">Southwind</Link>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              {AuthClient.currentUser() &&
                <Nav className="mr-auto">
                  <li>
                    <div className="omnibox-container" style={{ width: "200px" }}>
                    <OmniboxAutocomplete inputAttrs={{ className: "form-control" }} />
                    </div>
                  </li>
                  <NavDropdown title="Menu" id="layoutMenu">
                    <LinkContainer to="~/" exact={true}><NavDropdown.Item>Home</NavDropdown.Item></LinkContainer>
                    <LinkContainer to="~/publicCatalog"><NavDropdown.Item>Catalog</NavDropdown.Item></LinkContainer>
                    <NavDropdown.Divider />
                    <LinkContainer to="~/find/order"><NavDropdown.Item>Orders</NavDropdown.Item></LinkContainer>
                    <LinkContainer to="~/find/exception"><NavDropdown.Item>Exceptions</NavDropdown.Item></LinkContainer>
                  </NavDropdown>
                  <WorkflowDropdown />
                </Nav>}
              {AuthClient.currentUser() && <ToolbarRenderer location="Top" />}
              <Nav className="ml-auto">
                <Nav.Item>
                  <a className="nav-link" href="#" onClick={handleSwaggerClick} title="Swagger API Documentation">&nbsp; API</a>
                </Nav.Item>
                <CultureDropdown />
                <LoginDropdown />
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </div>
        <Notify />
        <div id="main-container">
          <SidebarContainer
            sidebarVisible={AuthClient.currentUser() && sideMenuVisible}
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
        <GlobalModalContainer/>
        <div id="footer">
          <div className="container">
            <p className="text-muted">Made by <a href="http://signumsoftware.com/">Signum Software</a>  using <a href="http://signumframework.com/">Signum Framework</a>.</p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

Layout.switch = undefined as React.ReactElement<any> | undefined;

