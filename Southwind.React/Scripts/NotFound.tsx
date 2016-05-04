/// <reference path="../../framework/signum.react/typings/react/react.d.ts" />

import * as React from 'react'

export default class NotFound extends React.Component<{}, {}> {
    render() {
        return (
            <div>
                <h3>404 <small>Not Found</small></h3>
            </div>
        );
    }
}
