/// <reference path="../../framework/signum.react/typings/react-router/react-router.d.ts" />
/// <reference path="../../framework/signum.react/typings/react/react.d.ts" />

import * as React from 'react'
import { Link } from 'react-router'

export default class Index extends React.Component<{children: any}, {}> {
    render() {
        return (
    <div id="main">
        <header className="navbar navbar-default navbar-static">
            <div className="container">
                <div className="navbar-header">
                    <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                        <span className="sr-only">Toggle navigation</span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                    </button>
                </div>
            <div className="navbar-collapse collapse">
                <ul className="nav navbar-nav">
                     <li><Link to="/">Home</Link></li>
                     <li><Link to="/about">About</Link></li>
                     <li><Link to="/view/company" params={{ id: "123" }}>Company</Link></li>
                     <li><Link to="/view/person" params={{ id: "ABC" }}>Person</Link></li>
                </ul>
                <ul className="nav navbar-nav navbar-right">
                    </ul>
                </div>
            </div>
        </header>

        <div className="container">{this.props.children}</div>
        <div id="push"></div>
     </div>);
    }
}
