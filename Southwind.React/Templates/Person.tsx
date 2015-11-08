/// <reference path="../../framework/signum.react/typings/react/react.d.ts" />

import * as React from 'react'

export default class Person extends React.Component<{ params: { id: string } }, {}> {
    render() {
        return (<div>Person {this.props.params.id} </div>);
    }
}
