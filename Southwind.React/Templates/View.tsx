/// <reference path="../../framework/signum.react/typings/react-router/react-router.d.ts" />
/// <reference path="../../framework/signum.react/typings/react/react.d.ts" />

import * as React from 'react'
import { RouteHandler } from 'react-router'

export default class View extends React.Component<{ children: any }, {}> {
    render() {
        return (<div>Viewing: <RouteHandler/></div>);
    }
}
