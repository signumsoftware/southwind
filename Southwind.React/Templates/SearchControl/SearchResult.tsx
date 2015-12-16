
import * as React from 'react'
import { QuerySettings, CellFormatter, EntityFormatter, EntityFormatRules, FormatRules } from 'Framework/Signum.React/Scripts/QuerySettings'
import * as Finder from 'Framework/Signum.React/Scripts/Finder'
import { ResultTable, OrderOption, OrderType, QueryDescription, ColumnOption} from 'Framework/Signum.React/Scripts/FindOptions'
import { SearchMessage, JavascriptMessage, Lite, IEntity, liteKey, is } from 'Framework/Signum.React/Scripts/Signum.Entities'
import * as Reflection from 'Framework/Signum.React/Scripts/Reflection'
import * as Navigator from 'Framework/Signum.React/Scripts/Navigator'
import { NavDropdown, MenuItem } from 'react-bootstrap'


interface SearchResultProps {
    results?: ResultTable;
    columnOptions: ColumnOption[];
    orderOptions: OrderOption[];
    selectedRows: Lite<IEntity>[];
    allowSelection?: boolean;
    navigate?: boolean;
    querySettings?: QuerySettings,
}


interface SearchResultState {
    usedRows: Lite<IEntity>[]
}


export default class SearchResult extends React.Component<SearchResultProps, SearchResultState> {

    constructor(props) {
        super(props);

        this.state = { usedRows: [] };
    }

    handleTogleAll() {

    }

    render() {

        var orders = this.props.orderOptions.toObjectDistinct(a=> a.token.fullKey, a=> a.orderType);

        return (<div className="sf-search-results-container table-responsive" >
            <table className="sf-search-results table table-hover table-condensed" >
                <thead>
                <tr>
                    {this.props.allowSelection &&
                    <th className="sf-th-selection">
                            <input type="checkbox" id="cbSelectAll" onClick={() => this.handleTogleAll() }/>
                        </th>
                    }
                    { this.props.navigate && <th className="sf-th-entity"></th> }
                    { this.props.columnOptions.map(a=>
                        <th draggable={true}
                            data-column-name={a.token.fullKey}
                            data-column-nicename={a.token.niceName}
                            key={a.token.fullKey}>
                                <span className={"sf-header-sort " +
                                    (orders[a.token.fullKey] == OrderType.Ascending ? "asc" :
                                        orders[a.token.fullKey] == OrderType.Descending ? "desc" : "") }/>
                                    <span>{a.displayName}</span>
                            </th>) }
                    </tr>
                    </thead>
                <tbody>
                    {this.renderRows() }
                    </tbody>
                </table>
            </div>);
    }

    renderRows(): React.ReactNode {

        var columnsCount = this.props.columnOptions.length +
            (this.props.allowSelection ? 1 : 0) +
            (this.props.navigate ? 1 : 0);

        if (!this.props.results) {
            return <tr><td colSpan={columnsCount}>{JavascriptMessage.searchForResults.niceToString() }</td></tr>;
        }

        if (this.props.results.rows.length == 0) {
            return <tr><td colSpan={columnsCount}>{ SearchMessage.NoResultsFound.niceToString() }</td></tr>;
        }

        var qs = this.props.querySettings;


        var formatters = this.props.columnOptions.map(c =>
            (qs && qs.formatters && qs.formatters[c.token.fullKey]) ||
            FormatRules.filter(a=> a.isApplicable(c)).last("FormatRules").formatter(c));

        var rowAttributes = qs && qs.rowAttributes;


        return this.props.results.rows.map((row, i) =>
            <tr key={i} data-entity={liteKey(row) } {...rowAttributes ? rowAttributes(row, this.props.results.columns) : null} style={{ opacity: this.props.selectedRows.some(s=> is(row.entity, s)) ? 0.5 : 1 }}>
                 {this.props.allowSelection && <td style={{ textAlign: "center" }}><input type="checkbox" className="sf-td-selection"></input></td> }
                 {this.props.navigate && <td>{((qs && qs.entityFormatter) || EntityFormatRules.filter(a=> a.isApplicable(row)).last("EntityFormatRules").formatter)(row) }</td> }
                 {this.props.columnOptions.map((c, i) => <td key={i} style={{ textAlign: formatters[i].textAllign }}>{formatters[i].formatter(row.columns[i]) }</td>) }
                </tr>);
    }
}