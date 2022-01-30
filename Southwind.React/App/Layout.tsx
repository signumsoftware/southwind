import * as React from 'react'
import { Link } from 'react-router-dom'
import LoginDropdown from '@extensions/Authorization/Login/LoginDropdown'
import * as AuthClient from '@extensions/Authorization/AuthClient'
import OmniboxAutocomplete from '@extensions/Omnibox/OmniboxAutocomplete'
import * as AppContext from "@framework/AppContext"
import { GlobalModalContainer } from "@framework/Modals"
import Notify from "@framework/Frames/Notify"
import CultureDropdown, { CultureDropdownMenuItem } from "@extensions/Translation/CultureDropdown"
import { SidebarContainer, SidebarMode, SidebarToggleItem } from "@extensions/Toolbar/SidebarContainer"
import { VersionChangedAlert, VersionInfo } from '@framework/Frames/VersionChangedAlert';
import { LinkContainer, ErrorBoundary } from '@framework/Components';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { OmniboxPermission } from '@extensions/Omnibox/Signum.Entities.Omnibox'
import { isModifiableEntity, JavascriptMessage } from '@framework/Signum.Entities'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Breakpoints, useBreakpoint, useUpdatedRef, useWindowEvent } from '../../Framework/Signum.React/Scripts/Hooks'
import { ModelConverterSymbol } from '../../Framework/Signum.React.Extensions/Templating/Signum.Entities.Templating'

const WorkflowDropdown = React.lazy(() => import("@extensions/Workflow/Workflow/WorkflowDropdown"));
const ToolbarRenderer = React.lazy(() => import("@extensions/Toolbar/Templates/ToolbarRenderer"));
const AlertDropdown = React.lazy(() => import("@extensions/Alerts/AlertDropdown"));

export default function Layout() {


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

  const hasUser = Boolean(AuthClient.currentUser());

  function renderTitle() {
    return (
      <div className="navbar-light" style={{
        transition: "all 200ms",
        padding: !hasUser ? "0 0 0 10px" : sidebarMode == "Wide" ? "5px 25px 16px" : "0px 13px 10px"
      }}>
        <Link to="~/" className="navbar-brand">
          {hasUser && sidebarMode == "Narrow" ? "SW" : "Southwind"}
        </Link>
      </div>
    );
  }

  return (
    <ErrorBoundary >
      <div id="main" key={refreshId}>
        <Notify />
        <div id="main-container">
          <SidebarContainer
            isMobile={isMobile}
            mode={sidebarMode}
            sidebarContent={hasUser ? <React.Suspense fallback={JavascriptMessage.loading.niceToString()}>
              <ToolbarRenderer
                sidebarMode={sidebarMode}
                onAutoClose={isMobile ? () => setSidebarMode("Hidden") : undefined}
                appTitle={renderTitle()} />
            </React.Suspense> : undefined}>

            <VersionChangedAlert />

            <div className={"main-toopbar"} style={{ flexGrow: 0 }}>
              {hasUser && <SidebarToggleItem isMobile={isMobile} mode={sidebarMode} setMode={mode => {
                setSidebarMode(mode);
                if (!isMobile)
                  window.localStorage.setItem(itemStorageKey, mode);
              }} />}

              {hasUser && <div style={{ width: "100%", marginRight: "15px" }}>
                {AuthClient.isPermissionAuthorized(OmniboxPermission.ViewOmnibox) && <OmniboxAutocomplete inputAttrs={{ className: "form-control" }} />}
              </div>}

              {hasUser && <React.Suspense fallback={null}><AlertDropdown /></React.Suspense>}

              {!hasUser && <>
                {renderTitle()}
                <div style={{ flexGrow: 1 }}></div>
                <CultureDropdown />
              </>}

              <LoginDropdown changePasswordVisible={AuthClient.getAuthenticationType() != "azureAD"} extraMenuItems={u => hasUser && <CultureDropdownMenuItem />} />
            </div>

            <div id="page-inner-content" style={{ padding: 10, position: 'relative' }}>
              {Layout.switch}
            </div>
          </SidebarContainer>
        </div>
        <GlobalModalContainer />
      </div>
    </ErrorBoundary>
  );
}

Layout.switch = undefined as React.ReactElement<any> | undefined;

