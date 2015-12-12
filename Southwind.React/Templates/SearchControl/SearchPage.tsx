
import * as React from 'react'
import { QuerySettings } from 'Framework/Signum.React/Scripts/QuerySettings'
import * as Finder from 'Framework/Signum.React/Scripts/Finder'
import { ResultTable, FindOptions, FilterOptions, QueryDescription } from 'Framework/Signum.React/Scripts/FindOptions'
import { SearchMessage, JavascriptMessage } from 'Framework/Signum.React/Scripts/Signum.Entities'
import * as Reflection from 'Framework/Signum.React/Scripts/Reflection'
import SearchControl from 'Templates/SearchControl/SearchControl'



interface SearchPageProps extends ReactRouter.RouteComponentProps<{}, { queryName: string }> {

}

export default class SearchPage extends React.Component<SearchPageProps, { findOptions?: FindOptions }> {

    constructor(props) {
        super(props);
        this.state = {};
    }
    
    componentWillReceiveProps(nextProps: SearchPageProps, nextContext): void
    {
        Finder.parseFindOptionsPath(this.props.routeParams.queryName, this.props.location.query);
    }

    render() {

        var fo = this.state.findOptions;

        return (<div id="divSearchPage">
        <h2>
            <span className="sf-entity-title">{fo ? Reflection.queryNiceName(fo.queryName) : null}</span>
            <a className="sf-popup-fullscreen" href="#">
                <span className="glyphicon glyphicon-new-window"></span>
                </a>
            </h2>
            {fo && <SearchControl avoidFullScreenButton={true} findOptions={fo} />}
            </div>);
    }
}



