/// <reference path="../../framework/signum.react/typings/react/react.d.ts" />
/// <reference path="../../extensions/signum.react.extensions/dashboard/dashboardclient.tsx" />

import * as React from 'react'
import * as Navigator from "../../Framework/Signum.React/Scripts/Navigator"
import * as DashboardClient from "../../Extensions/Signum.React.Extensions/Dashboard/DashboardClient"

export default class Home extends React.Component<{}, { loaded: boolean }> {
    
    constructor(props: {}){
        super(props);
        this.state = { loaded: false };
    }

    componentWillMount() {
        if (Navigator.currentUser == null) {
            Navigator.currentHistory.push("~/publicCatalog");
            return;
        }//PublicCatalog

        if (true as any) {
            DashboardClient.API.home()
                .then(h => {
                    if (h)
                        Navigator.currentHistory.push(`~/dashboard/${h.id}`);
                    else
                        this.setState({ loaded: true });
                });
        }
        else //Dashboard
            this.setState({ loaded: true });
    }

    render() {
        if(!this.state.loaded)
            return null;

        return (
            <div>
                <br/>
                <div className="jumbotron">
                    <h1>Welcome to Signum React</h1>
                    <br />
                    <p>Southwind is a demo application from <a href="http://www.signumsoftware.com" title="Signum Framework">Signum Software</a> based on Northwind database from Microsoft:</p>
                    <p>
                        To learn more about Signum Framework visit <a href="http://www.signumframework.com" title="Signum Framework">http://www.signumframework.com</a>.
                    </p>
                    <p> To be effective in Signum React you will also need to know:</p> 
                    <ul>
                        <li><a href="http://www.typescriptlang.org/" title="Typescript">Typescript</a></li>
                        <li><a href="https://facebook.github.io/react">React</a></li>
                        <li><a href="http://getbootstrap.com/" title="Bootstrap">Bootstrap</a></li>
                        <li><a href="http://webpack.com/" title="Webpack">Webpack</a></li>
                    </ul>
                </div>
            </div>
        );
    }
}
