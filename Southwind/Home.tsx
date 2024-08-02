import * as React from 'react'
import * as AppContext from '@framework/AppContext';
import { AuthClient } from '@extensions/Signum.Authorization/AuthClient'

export default function Home(): React.JSX.Element {

  var [loaded, setLoaded] = React.useState(false);
  React.useEffect(() => {

    if (!AuthClient.currentUser()) {
      AppContext.navigate("/publicCatalog");
    }//PublicCatalog

    if (AuthClient.currentUser()) {
      import("@extensions/Signum.Dashboard/DashboardClient")
        .then(file => file.DashboardClient.API.home())
        .then(h => {
          if (h)
            AppContext.navigate(`/dashboard/${h.id}`);
          else
            setLoaded(true);
        });
    }
    else //Dashboard
      setLoaded(true);

  }, []);

  if (!loaded)
    return null;

  return (
    <div id="hero" style={{ background: "url(" + AppContext.toAbsoluteUrl("/background_dark.jpg") + ")", backgroundSize: "cover" }}>
      <div className="hero-container">
        <div style={{ background: "white", padding: "10px", boxShadow: "0px 4px 8px 0px rgb(0 0 0 / 75%)" }}>
          <img src={AppContext.toAbsoluteUrl("/logo.png")} style={{ maxWidth: "90vw" }} />
        </div>
        <h1 className="white">Southwind</h1>
        <h2 className="white">Demo application from <a href="http://www.signumsoftware.com" style={{ color: "#cae4ff" }} title="Signum Software">Signum Software</a> based on Northwind database from Microsoft</h2>
        <div className="card shadow mt-3">
          <div className="card-body">
            <h5 className="card-title">New to Signum Framework?</h5>
            <p className="card-text">Visit <a href="https://github.com/signumsoftware/docs" className="card-link">Signum Framework Docs</a> to learn more about Signum Framework itselfs and all the underlying technologies</p>
            <div className="text-start">
              <p>And don't forget to:</p>
              <ul>
                <li>Choose a different theme in <a href="https://bootswatch.com">Bootwatch.com</a> and replace <code>_bootswatch.scss</code> and <code>_variables.scss</code></li>
                <li>Change favicon add it to <code>Index.cshtml</code> (consider <a href="https://www.favicon-generator.org/">favicon-generator</a>)</li>
                <li>Change <code>wwwroot/background.jpg</code> and <code>wwwroot/logo.png</code></li>
                <li>Remove/Change the footer in <code>Layout.tsx</code> and <code>site.css</code></li>
                <li>Change the secret in <code>Startup.cs</code> (search for <code>AuthServer.Start</code>)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
