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
import { JavascriptMessage } from '@framework/Signum.Entities'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useUpdatedRef } from '../../Framework/Signum.React/Scripts/Hooks'

const WorkflowDropdown = React.lazy(() => import("@extensions/Workflow/Workflow/WorkflowDropdown"));
const ToolbarRenderer = React.lazy(() => import("@extensions/Toolbar/Templates/ToolbarRenderer"));
const AlertDropdown = React.lazy(() => import("@extensions/Alerts/AlertDropdown"));

export default function Layout() {
  const [refreshId, setRefreshId] = React.useState(0);
  const [sideMenuOpen, setSideMenuOpen] = React.useState(() => AuthClient.currentUser() != null && window.outerWidth > 768 /*iPad*/);
  const sideMenuOpenRef = useUpdatedRef(sideMenuOpen);

  function handleToggle(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    setSideMenuOpen(!sideMenuOpen);
  }

  React.useEffect(() => {
    AppContext.Expander.onGetExpanded = () => !sideMenuOpenRef.current;
    AppContext.Expander.onSetExpanded = (isExpanded: boolean) => setSideMenuOpen(!isExpanded);
  }, []); //Sidebar

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
        <Navbar bg="light" expand="lg">
            <Link to="~/" className="navbar-brand">
              {/*SidebarButton*/
                AuthClient.currentUser() != null &&
                <button className="btn btn-link" onClick={handleToggle} style={{ marginTop: "-6px", marginLeft: "-12px" }}>
                  <span className="navbar-toggler-icon" />
                </button>
              /*SidebarButton*/}
              Southwind</Link>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              {AuthClient.currentUser() &&
                <Nav className="me-auto">
                  {AuthClient.isPermissionAuthorized(OmniboxPermission.ViewOmnibox) && <div className="omnibox-container" style={{ width: "200px" }}>
                    <OmniboxAutocomplete inputAttrs={{ className: "form-control" }} />
                  </div>}
                {/*
                  <NavDropdown title="Menu" id="layoutMenu">
                    <LinkContainer to="~/" exact={true}><NavDropdown.Item>Home</NavDropdown.Item></LinkContainer>
                    <LinkContainer to="~/publicCatalog"><NavDropdown.Item>Catalog</NavDropdown.Item></LinkContainer>
                    <NavDropdown.Divider />
                    <LinkContainer to="~/find/order"><NavDropdown.Item>Orders</NavDropdown.Item></LinkContainer>
                    <LinkContainer to="~/find/exception"><NavDropdown.Item>Exceptions</NavDropdown.Item></LinkContainer>
                  </NavDropdown>
                */}
                  {AuthClient.currentUser() && <React.Suspense fallback={null}><WorkflowDropdown /></React.Suspense>}
                </Nav>}
              {AuthClient.currentUser() && <React.Suspense fallback={null}><ToolbarRenderer location="Top" /></React.Suspense>}
            <Nav className="ms-auto">
              {AuthClient.currentUser() && <React.Suspense fallback={null}><AlertDropdown /></React.Suspense>}
              <VersionInfo extraInformation={(window as any).__serverName} />
                <Nav.Item> {/*Swagger*/}
                  <a className="nav-link" href="#" onClick={handleSwaggerClick} title="Swagger API Documentation">&nbsp; API</a>
                </Nav.Item> {/*Swagger*/}
                <CultureDropdown />
                <LoginDropdown changePasswordVisible={AuthClient.getAuthenticationType() != "azureAD"}/>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        <Notify />
        <div id="main-container">
          <SidebarContainer
            sidebarVisible={AuthClient.currentUser() && sideMenuOpen}
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

