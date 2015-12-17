
import * as React from 'react'
import { QuerySettings, defaultPagination } from 'Framework/Signum.React/Scripts/QuerySettings'
import * as Finder from 'Framework/Signum.React/Scripts/Finder'
import { ResultTable, FindOptions, FilterOption, QueryDescription, ColumnOption, ColumnOptionsMode, ColumnDescription, toQueryToken, Pagination, PaginationMode } from 'Framework/Signum.React/Scripts/FindOptions'
import { SearchMessage, JavascriptMessage, Lite, IEntity } from 'Framework/Signum.React/Scripts/Signum.Entities'
import { typeInfos, IsByAll, queryKey} from 'Framework/Signum.React/Scripts/Reflection'
import * as Navigator from 'Framework/Signum.React/Scripts/Navigator'
import { NavDropdown, MenuItem } from 'react-bootstrap'
import SearchResult from 'Templates/SearchControl/SearchResult'
import PaginationSelector from 'Templates/SearchControl/PaginationSelector'


export interface SimpleFilterBuilderProps {
    findOptions: FindOptions;
}


export interface SearchControlProps extends React.Props<SearchControl> {

    findOptions: FindOptions;
    simpleFilterBuilder?: React.ComponentClass<SimpleFilterBuilderProps>;
    avoidFullScreenButton?: boolean;
    showContextMenu?: boolean;
}

export interface SearchControlState {
    resultTable?: ResultTable;
    findOptions?: FindOptions;
    querySettings?: QuerySettings;
    queryDescription?: QueryDescription;
    loading?: boolean;
    selectedRows?: Lite<IEntity>[];

}


export default class SearchControl extends React.Component<SearchControlProps, SearchControlState> {

    constructor(props: SearchControlProps) {
        super(props);
        this.state = {
            querySettings: Finder.getQuerySettings(props.findOptions.queryName),
            loading: false,
            selectedRows: []
        };

        Finder.getQueryDescription(props.findOptions.queryName).then(qd=> {

            var ti = typeInfos(qd.columns["Entity"].type)

            var findOptions = extend({
                searchOnLoad: true,
                showHeader: true,
                showFilters: false,
                showFilterButton: true,
                showFooter: true,
                create: ti.some(ti=> Navigator.isCreable(ti, true)),
                navigate: ti.some(ti=> Navigator.isNavigable(ti, null, true)),
                pagination: (this.state.querySettings && this.state.querySettings.pagination) || defaultPagination,
                columnOptionsMode: ColumnOptionsMode.Add,
                columnOptions: [],
                orderOptions : [],
                filterOptions : []
            }, props.findOptions);

            findOptions.columnOptions = SearchControl.mergeColumns(Dic.getValues(qd.columns), findOptions.columnOptionsMode, findOptions.columnOptions)

            Finder.parseTokens(findOptions).then(fo=>
                this.setState({
                    findOptions: fo,
                    queryDescription: qd,
                }));
        });
    }

    static mergeColumns(columns: ColumnDescription[], mode: ColumnOptionsMode, columnOptions: ColumnOption[]): ColumnOption[] {


        switch (mode) {
            case ColumnOptionsMode.Add:
                return columns.filter(cd=> cd.name != "Entity").map(cd=> ({ columnName: cd.name, token: toQueryToken(cd), displayName: cd.displayName }) as ColumnOption)
                    .concat(columnOptions);

            case ColumnOptionsMode.Remove:
                return columns.filter(cd=> cd.name != "Entity" && !columnOptions.some(a=> a.token.fullKey == cd.name))
                    .map(cd=> ({ columnName: cd.name, token: toQueryToken(cd), displayName: cd.displayName }) as ColumnOption);

            case ColumnOptionsMode.Replace:
                return columnOptions;
        }
    }

    toggleFilters() {
        this.state.findOptions.showFilters = !this.state.findOptions.showFilters;
        this.forceUpdate();
    }

    search() {
        var fo = this.state.findOptions;
        this.setState({ loading: false });
        Finder.search({
            queryKey: queryKey(fo.queryName),
            filters: fo.filterOptions.map(fo=> ({ token: fo.token.fullKey, operation : fo.operation, value : fo.value })),
            columns: fo.columnOptions.map(co=> ({ token: co.token.fullKey, displayName : co.displayName })),
            orders: fo.orderOptions.map(oo=> ({ token: oo.token.fullKey, orderType : oo.orderType })),
            pagination: fo.pagination,
        }).then(rt=> {
            this.setState({ resultTable: rt, selectedRows: [], loading: false });
        });


    }

    handlePagination = (p: Pagination) => {
        this.state.findOptions.pagination = p;
        this.setState({ resultTable: null });

        if (this.state.findOptions.pagination.mode != PaginationMode.All)
            this.search();
    }

    render() {
        var SFB = this.props.simpleFilterBuilder;

        var fo = this.state.findOptions;
        if (!fo)
            return null;

        return (
            <div className="sf-search-control SF-control-container">
            {SFB && <div className="simple-filter-builder"><SFB  findOptions={fo}/></div> }
            {fo.showHeader && fo.showFilters && <FilterControl queryName={fo.queryName} filterOptions={fo.filterOptions}/> }
            {fo.showHeader && this.renderToolBar() }
            <SearchResult allowSelection={true}
                columnOptions={fo.columnOptions}
                orderOptions={fo.orderOptions}
                navigate = {fo.navigate}
                querySettings ={this.state.querySettings}
                results={this.state.resultTable}
                selectedRows={this.state.selectedRows}
                />
            {fo.showFooter && <PaginationSelector pagination={fo.pagination} onPagination={this.handlePagination} resultTable={this.state.resultTable}/>}
                </div>);
    }

    renderToolBar() {

        var fo = this.state.findOptions;
        return <div className="sf-query-button-bar">
                { fo.showFilterButton && <a
                    className={"sf-query-button sf-filters-header btn btn-default" + (fo.showFilters ? " active" : "") }
                    onClick={() => this.toggleFilters() }
                    title={ fo.showFilters ? JavascriptMessage.hideFilters.niceToString() : JavascriptMessage.showFilters.niceToString() }><span className="glyphicon glyphicon glyphicon-filter"></span></a >}
                <button className={"sf-query-button sf-search btn btn-primary" + (this.state.loading ? " disabled" : "") } onClick={() => this.search() }>{SearchMessage.Search.niceToString() } </button>
                {fo.create && <a className="sf-query-button btn btn-default sf-line-button sf-create" title={this.createTitle() }><span className="glyphicon glyphicon-plus"></span></a>}
                {this.props.showContextMenu != false && this.getSelectedButton() }
                {Finder.ButtonBarQuery.getButtonBarElements(fo.queryName) }
                {this.props.avoidFullScreenButton != true &&
                <a className="sf-query-button btn btn-default" href="#">
                <span className="glyphicon glyphicon-new-window"></span>
                    </a> }
            </div>;
    }

    createTitle() {

        var entityColType = this.state.queryDescription.columns["Entity"].type;

        if (entityColType.name == IsByAll)
            return SearchMessage.CreateNew0_G.niceToString().forGenderAndNumber("m", 1).formatWith("?");

        var types = typeInfos(entityColType).map(ti => ti.niceName).join(", ");
        var gender = typeInfos(entityColType).first().gender;

        return SearchMessage.CreateNew0_G.niceToString().forGenderAndNumber(gender).formatWith(types);
    }


    getSelectedButton() {
        return <NavDropdown id="selectedButton" className="sf-query-button sf-tm-selected" title={JavascriptMessage.Selected.niceToString() }></NavDropdown>
    }

}

export interface FilterControlProps {
    filterOptions?: FilterOption[];
    queryName: any;
}


export class FilterControl extends React.Component<FilterControlProps, {}>
{
    render() {
        return <div></div>
    }
}

