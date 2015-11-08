/// <reference path="../../framework/signum.react/typings/react/react.d.ts" />

import * as React from 'react'

export default class Company extends React.Component<{ params: { id: string }}, {}> {
    render() {
        return (<div>Company {this.props.params.id}</div>);
    }
}
