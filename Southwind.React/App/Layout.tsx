import * as React from 'react'
import { Link } from 'react-router-dom'
import LoginDropdown from '@extensions/Authorization/Login/LoginDropdown'
import * as AuthClient from '@extensions/Authorization/AuthClient'
import OmniboxAutocomplete from '@extensions/Omnibox/OmniboxAutocomplete'
import * as AppContext from "@framework/AppContext"
import { GlobalModalContainer } from "@framework/Modals"
import Notify from "@framework/Frames/Notify"
import CultureDropdown from "@extensions/Translation/CultureDropdown"
import SidebarContainer from "@extensions/Toolbar/SidebarContainer"
import { VersionChangedAlert, VersionInfo } from '@framework/Frames/VersionChangedAlert';
import { LinkContainer, ErrorBoundary } from '@framework/Components';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { OmniboxPermission } from '@extensions/Omnibox/Signum.Entities.Omnibox'
import * as WebAuthnClient from '@extensions/Authorization/WebAuthn/WebAuthnClient'
import { JavascriptMessage } from '@framework/Signum.Entities'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const WorkflowDropdown = React.lazy(() => import("@extensions/Workflow/Workflow/WorkflowDropdown"));
const ToolbarRenderer = React.lazy(() => import("@extensions/Toolbar/Templates/ToolbarRenderer"));

export default function Layout() {
  const [refreshId, setRefreshId] = React.useState(0);
  const [sideMenuVisible] = React.useState(true);

  function resetUI() {
    setRefreshId(rID => rID + 1);
  };

  React.useEffect(() => {
    AppContext.setResetUI(resetUI);
    return () => AppContext.setResetUI(() => { });
  }, []);

  function handleSwaggerClick(e: React.MouseEvent<any>) {
    e.preventDefault();
    import("@extensions/Rest/RestClient")
      .then(RestClient => RestClient.API.getCurrentRestApiKey())
      .then(key => { window.location.assign(AppContext.toAbsoluteUrl("~/swagger/index.html?apiKey=" + (key || ""))); })
      .done();
  } //Swagger

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
                      {AuthClient.isPermissionAuthorized(OmniboxPermission.ViewOmnibox) && <OmniboxAutocomplete inputAttrs={{ className: "form-control" }} />}
                    </div>
                  </li>
                  <NavDropdown title="Menu" id="layoutMenu">
                    <LinkContainer to="~/" exact={true}><NavDropdown.Item>Home</NavDropdown.Item></LinkContainer>
                    <LinkContainer to="~/publicCatalog"><NavDropdown.Item>Catalog</NavDropdown.Item></LinkContainer>
                    <NavDropdown.Divider />
                    <LinkContainer to="~/find/order"><NavDropdown.Item>Orders</NavDropdown.Item></LinkContainer>
                    <LinkContainer to="~/find/exception"><NavDropdown.Item>Exceptions</NavDropdown.Item></LinkContainer>
                </NavDropdown>
                {AuthClient.currentUser() && <React.Suspense fallback={null}><WorkflowDropdown /></React.Suspense>}
                </Nav>}
              {AuthClient.currentUser() && <React.Suspense fallback={null}><ToolbarRenderer location="Top" /></React.Suspense>}
              <Nav className="ml-auto">
                <VersionInfo />
                <Nav.Item> {/*Swagger*/}
                  <a className="nav-link" href="#" onClick={handleSwaggerClick} title="Swagger API Documentation">&nbsp; API</a>
                </Nav.Item> {/*Swagger*/}
                <CultureDropdown />
                <LoginDropdown extraButons={user =>
                  <NavDropdown.Item onClick={() => WebAuthnClient.register()}><FontAwesomeIcon icon="fingerprint" fixedWidth className="mr-2" /> Register Webauthn / FIDO2</NavDropdown.Item>
                } />
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </div>
        <Notify />
        <div id="main-container">
          <SidebarContainer
            sidebarVisible={AuthClient.currentUser() && sideMenuVisible}
            sidebarContent={<React.Suspense fallback={null}><ToolbarRenderer location="Side" /></React.Suspense>}>
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

Layout.switch = undefined as React.ReactElement<any> | undefined;

