import * as React from 'react'
import { Link, Outlet } from 'react-router-dom'
import LoginDropdown from '@extensions/Signum.Authorization/Login/LoginDropdown'
import { AuthClient } from '@extensions/Signum.Authorization/AuthClient'
import * as AppContext from "@framework/AppContext"
import { GlobalModalContainer } from "@framework/Modals"
import Notify from "@framework/Frames/Notify"
import CultureDropdown, { CultureDropdownMenuItem } from "@framework/Basics/CultureDropdown"
import { SidebarContainer, SidebarMode, SidebarToggleItem } from "@extensions/Signum.Toolbar/SidebarContainer"
import { VersionChangedAlert, VersionInfo } from '@framework/Frames/VersionChangedAlert';
import { LinkContainer, ErrorBoundary } from '@framework/Components';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { OmniboxPermission } from '@extensions/Signum.Omnibox/Signum.Omnibox'
import { isModifiableEntity, JavascriptMessage } from '@framework/Signum.Entities'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Breakpoints, useBreakpoint, useUpdatedRef, useWindowEvent } from '@framework/Hooks'
import { ModelConverterSymbol } from '@extensions/Signum.Templating/Signum.Templating'
import { ThemeSelector } from './ThemeSelector'
import { ThemeModeSelector } from '@framework/Components/ThemeModeSelector'
import { LinkButton } from '@framework/Basics/LinkButton'
import MessageModal from '@framework/Modals/MessageModal'
import CopyButton from '@framework/Components/CopyButton'

const ToolbarRenderer = React.lazy(() => import("@extensions/Signum.Toolbar/Renderers/ToolbarRenderer"));
const OmniboxAutocomplete = React.lazy(() => import('@extensions/Signum.Omnibox/OmniboxAutocomplete'));
const ChangeLogViewer = React.lazy(() => import('@framework/Basics/ChangeLogViewer'));
const AlertDropdown = React.lazy(() => import("@extensions/Signum.Alerts/AlertDropdown"));
const ChatButton = React.lazy(() => import("@extensions/Signum.Agent/ChatbotButton"));

export default function Layout(): React.JSX.Element {


  const itemStorageKey = "SIDEBAR_MODE";
  const [refreshId, setRefreshId] = React.useState(0);

  const isMobile = useBreakpoint() <= Breakpoints.sm;

  React.useEffect(() => {
    if (isMobile)
      setSidebarMode("Hidden");
    else
      setSidebarMode(window.localStorage.getItem(itemStorageKey) as SidebarMode | null ?? "Wide");
  }, [isMobile])

  const [sidebarMode, setSidebarMode] = React.useState<SidebarMode>(isMobile ? "Hidden" : window.localStorage.getItem(itemStorageKey) as SidebarMode | null ?? "Wide");
  const sidebarModeRef = useUpdatedRef(sidebarMode);

  React.useEffect(() => {
    AppContext.Expander.onGetExpanded = () => sidebarModeRef.current != "Wide";
    AppContext.Expander.onSetExpanded = (isExpanded: boolean) => setSidebarMode(isExpanded ? (isMobile ? "Hidden" : "Narrow") : "Wide");
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
    import("@extensions/Signum.Rest/RestApiKeyClient")
      .then(file => file.RestApiKeyClient.API.getCurrentRestApiKey())
      .then(key => { window.location.assign(AppContext.toAbsoluteUrl("/swagger/index.html?apiKey=" + (key || ""))); });
  } //Swagger

  function handleMcpClick(e: React.MouseEvent<any>) {
    e.preventDefault();
    import("@extensions/Signum.Rest/RestApiKeyClient")
      .then(file => file.RestApiKeyClient.API.getCurrentRestApiKey())
      .then(key => {
        const mcpUrl = window.location.origin + AppContext.toAbsoluteUrl("/mcp-server?apiKey=" + (key || ""));
        return MessageModal.show({
          title: "MCP",
          buttons: "ok",
          message:
            <div className="d-flex align-items-start gap-2">
              <code className="mb-0 text-break">{mcpUrl}</code>
              <CopyButton getText={() => mcpUrl} title="Copy MCP URL">Copy</CopyButton>
            </div>
        });
      });
  } //MCP

  const hasUser = Boolean(AuthClient.currentUser());

  function renderTitle() {
    return (
      <div style={{
        transition: "all 200ms",
        padding: !hasUser ? "0 0 0 10px" : sidebarMode == "Wide" ? "10px 25px" : "10px 10px 10px 14px",
      }}>
        <Link to="/" className="navbar-brand m-0">
          {hasUser && sidebarMode == "Narrow" ? "SW" : "Southwind"}
        </Link>
      </div>
    );
  }

  return (
    <ErrorBoundary >
      <div id="site-content" key={refreshId}>
        <Notify />
        <div id="main-container">
          <SidebarContainer
            isMobile={isMobile}
            mode={sidebarMode}
            sidebarContent={
              hasUser ? <React.Suspense fallback={JavascriptMessage.loading.niceToString()}>
              {renderTitle()}
              <ToolbarRenderer
                onAutoClose={isMobile ? () => setSidebarMode("Hidden") : undefined}
                />
              </React.Suspense> :
                undefined}>

            <nav className={"main-toolbar navbar navbar-expand"}>
              
              {hasUser && <div className="navbar-nav"><SidebarToggleItem isMobile={isMobile} mode={sidebarMode} setMode={mode => {
                setSidebarMode(mode);
                if (!isMobile)
                  window.localStorage.setItem(itemStorageKey, mode);
              }} /></div>}

              {!hasUser && renderTitle()}

              <div style={{ flex: "1", marginRight: "15px" }}>
                {hasUser && AppContext.isPermissionAuthorized(OmniboxPermission.ViewOmnibox) && <OmniboxAutocomplete inputAttrs={{ className: "form-control omnibox" }} />}
              </div>

              <div className="navbar-nav ml-auto me-2">
                {hasUser && <React.Suspense fallback={null}><AlertDropdown /></React.Suspense>}
                <React.Suspense fallback={null}><ChangeLogViewer extraInformation={(window as any).__serverName} /></React.Suspense>
                {hasUser && /*Swagger*/<Nav.Item>
                  <LinkButton className="nav-link" onClick={handleSwaggerClick} title="Swagger API Documentation">&nbsp; API</LinkButton>
                </Nav.Item> /*Swagger*/}
                
                {hasUser && /*MCP*/<Nav.Item>
                  <LinkButton className="nav-link" onClick={handleMcpClick} title="MCP Server URL">&nbsp; MCP</LinkButton>
                </Nav.Item> /*MCP*/}

                {!hasUser && <CultureDropdown />}
                <ThemeSelector />
                <ThemeModeSelector
                  onSetMode={mode => {
                    var navbar = document.querySelector<HTMLElement>(".navbar")!;
                    navbar.classList.toggle("bg-dark", mode == "dark");
                    navbar.classList.toggle("bg-light", mode == "light");
                    navbar.dataset.bsTheme = mode;
                  }} /*onSetMode */
                />
                <LoginDropdown
                  changePasswordVisible={AuthClient.getAuthenticationType() != "azureAD"}
                  extraMenuItems={u => hasUser && <CultureDropdownMenuItem />}
                />{/*LoginDropdown*/}
              </div>
            </nav>

            <main tabIndex={-1} id="maincontent" className="container-fluid overflow-auto pt-2">
            <VersionChangedAlert />

            <Outlet context={{ sidebarMode }} />
            {hasUser && <React.Suspense fallback={null}><ChatButton /></React.Suspense>}
            </main>
          </SidebarContainer>
        </div>
        <GlobalModalContainer />
      </div>
    </ErrorBoundary>
  );
}

