
import * as React from 'react'
import * as Finder from 'Framework/Signum.React/Scripts/Finder'
import { ResultTable, ResultRow, FindOptions, FilterOption, QueryDescription, ColumnOption, ColumnOptionsMode, ColumnDescription, toQueryToken, Pagination, PaginationMode, OrderType, OrderOption } from 'Framework/Signum.React/Scripts/FindOptions'
import { SearchMessage, JavascriptMessage, Lite, IEntity, liteKey, is } from 'Framework/Signum.React/Scripts/Signum.Entities'
import { getTypeInfos, IsByAll, getQueryKey, TypeInfo, EntityData} from 'Framework/Signum.React/Scripts/Reflection'
import * as Navigator from 'Framework/Signum.React/Scripts/Navigator'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import PaginationSelector from 'Templates/SearchControl/PaginationSelector'


export interface SimpleFilterBuilderProps {
    findOptions: FindOptions;
}


export interface SearchControlProps extends React.Props<SearchControl> {
    allowSelection?: boolean
    findOptions: FindOptions;
    simpleFilterBuilder?: React.ComponentClass<SimpleFilterBuilderProps>;
    avoidFullScreenButton?: boolean;
    showContextMenu?: boolean;
}

export interface SearchControlState {
    resultTable?: ResultTable;
    findOptions?: FindOptions;
    querySettings?: Finder.QuerySettings;
    queryDescription?: QueryDescription;
    loading?: boolean;
    selectedRows?: ResultRow[];

    dragIndex?: number,
    dropIndex?: number,
}



export default class SearchControl extends React.Component<SearchControlProps, SearchControlState> {

    static defaultProps = {
        allowSelection: true,
        avoidFullScreenButton: false
    };

    constructor(props: SearchControlProps) {
        super(props);
        this.state = {
            querySettings: Finder.getQuerySettings(props.findOptions.queryName),
            loading: false,
            selectedRows: []
        };

        Finder.getQueryDescription(props.findOptions.queryName).then(qd=> {

            this.setState({
                queryDescription: qd,
            })

            var ti = getTypeInfos(qd.columns["Entity"].type)

            var findOptions = Dic.extend({
                searchOnLoad: true,
                showHeader: true,
                showFilters: false,
                showFilterButton: true,
                showFooter: true,
                create: ti.some(ti=> Navigator.isCreable(ti, true)),
                navigate: ti.some(ti=> Navigator.isNavigable(ti, null, true)),
                pagination: (this.state.querySettings && this.state.querySettings.pagination) || Finder.defaultPagination,
                columnOptionsMode: ColumnOptionsMode.Add,
                columnOptions: [],
                orderOptions: [],
                filterOptions: []
            }, props.findOptions);

            findOptions.columnOptions = SearchControl.mergeColumns(Dic.getValues(qd.columns), findOptions.columnOptionsMode, findOptions.columnOptions)
            if (!findOptions.orderOptions.length) {

                var defaultOrder = this.state.querySettings && this.state.querySettings.defaultOrderColumn || Finder.defaultOrderColumn;

                var info = this.entityColumnTypeInfos().firstOrNull()

                findOptions.orderOptions = [{
                    columnName: defaultOrder,
                    orderType: info.entityData == EntityData.Transactional ? OrderType.Descending : OrderType.Ascending
                }];
            }

            Finder.parseTokens(findOptions).then(fo=> {
                this.setState({
                    findOptions: fo,
                })

                if (this.state.findOptions.searchOnLoad)
                    this.handleSearch();

            });
        });
    }


    entityColumn(): ColumnDescription {
        return this.state.queryDescription.columns["Entity"];
    }

    entityColumnTypeInfos(): TypeInfo[] {
        return getTypeInfos(this.entityColumn().type);
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

    ////
    // HANDLERs
    ////

    handleToggleFilters = () => {
        this.state.findOptions.showFilters = !this.state.findOptions.showFilters;
        this.forceUpdate();
    }

    handleSearch = () => {
        var fo = this.state.findOptions;
        this.setState({ loading: false });
        Finder.search({
            queryKey: getQueryKey(fo.queryName),
            filters: fo.filterOptions.map(fo=> ({ token: fo.token.fullKey, operation: fo.operation, value: fo.value })),
            columns: fo.columnOptions.map(co=> ({ token: co.token.fullKey, displayName: co.displayName })),
            orders: fo.orderOptions.map(oo=> ({ token: oo.token.fullKey, orderType: oo.orderType })),
            pagination: fo.pagination,
        }).then(rt=> {
            this.setState({ resultTable: rt, selectedRows: [], loading: false });
        });
    }

    handlePagination = (p: Pagination) => {
        this.state.findOptions.pagination = p;
        this.setState({ resultTable: null });

        if (this.state.findOptions.pagination.mode != PaginationMode.All)
            this.handleSearch();
    }

    handleTogleAll = () => {

        if (!this.state.resultTable)
            return;

        this.setState({ selectedRows: this.state.selectedRows.length ? this.state.resultTable.rows.slice(0) : [] });
    }

    handleHeaderClick = (e: React.MouseEvent) => {

        var token = (e.currentTarget as HTMLElement).getAttribute("data-column-name")

        var prev = this.state.findOptions.orderOptions.filter(a=> a.token.fullKey == token).firstOrNull();

        if (prev != null) {
            prev.orderType = prev.orderType == OrderType.Ascending ? OrderType.Descending : OrderType.Ascending;
            if (!e.shiftKey)
                this.state.findOptions.orderOptions = [prev];

        } else {

            var column = this.state.findOptions.columnOptions.filter(a=> a.token.fullKey == token).first("Column");

            var newOrder: OrderOption = { token: column.token, orderType: OrderType.Ascending, columnName: column.token.fullKey };

            if (e.shiftKey)
                this.state.findOptions.orderOptions.push(newOrder);
            else
                this.state.findOptions.orderOptions = [newOrder];

        }

        //this.setState({ resultTable: null });

        if (this.state.findOptions.pagination.mode != PaginationMode.All)
            this.handleSearch();
    }


    handleHeaderDragStart = (de: React.DragEvent) => {
        de.dataTransfer.effectAllowed = "move";
        var dragIndex = parseInt((de.currentTarget as HTMLElement).getAttribute("data-column-index"));
        this.setState({ dragIndex: dragIndex });    
    }

    handleHeaderDragEnd = (de: React.DragEvent) => {
        this.setState({ dragIndex: null, dropIndex: null });
    }


    getOffset(pageX: number, rect: ClientRect) {

        var width = rect.width;
        var offsetX = pageX - rect.left;

        if (width < 100 ? (offsetX < (width / 2)) : (offsetX < 50))
            return 0;

        if (width < 100 ? (offsetX > (width / 2)) : (offsetX > (width - 50)))
            return 1;

        return null;
    }

    handlerHeaderDragOver = (de: React.DragEvent) => {
        de.preventDefault();

        var th = de.currentTarget as HTMLElement;
        
        var size = th.scrollWidth;

        var columnIndex = parseInt(th.getAttribute("data-column-index"));

        var offset = this.getOffset((de.nativeEvent as DragEvent).pageX, th.getBoundingClientRect());

        var dropIndex = offset == null || columnIndex + offset == this.state.dragIndex ? null : columnIndex + offset;

        de.dataTransfer.dropEffect = dropIndex == null ? "none" : "move";

        if (this.state.dropIndex != dropIndex)
            this.setState({ dropIndex: dropIndex });
    }

    handleHeaderDrop = (de: React.DragEvent) => {
        
        var columns = this.state.findOptions.columnOptions;
        var temp = columns[this.state.dragIndex];
        columns.splice(this.state.dragIndex, 1);
        columns.splice(this.state.dropIndex, 0, temp);
        
        this.setState({
            dropIndex: null,
            dragIndex: null
        });
    }

    ////
    // RENDERs
    ////

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
            <div className="sf-search-results-container table-responsive" >
            <table className="sf-search-results table table-hover table-condensed" >
                <thead>
              {this.renderHeaders() }
                    </thead>
                <tbody>
                    {this.renderRows() }
                    </tbody>
                </table>
                </div>
            {fo.showFooter && <PaginationSelector pagination={fo.pagination} onPagination={this.handlePagination} resultTable={this.state.resultTable}/>}
                </div>);
    }

    renderToolBar() {

        var fo = this.state.findOptions;
        return <div className="sf-query-button-bar btn-toolbar">
                { fo.showFilterButton && <a
                    className={"sf-query-button sf-filters-header btn btn-default" + (fo.showFilters ? " active" : "") }
                    onClick={this.handleToggleFilters}
                    title={ fo.showFilters ? JavascriptMessage.hideFilters.niceToString() : JavascriptMessage.showFilters.niceToString() }><span className="glyphicon glyphicon glyphicon-filter"></span></a >}
                <button className={"sf-query-button sf-search btn btn-primary" + (this.state.loading ? " disabled" : "") } onClick={this.handleSearch}>{SearchMessage.Search.niceToString() } </button>
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

        var tis = this.entityColumnTypeInfos();

        var types = tis.map(ti => ti.niceName).join(", ");
        var gender = tis.first().gender;

        return SearchMessage.CreateNew0_G.niceToString().forGenderAndNumber(gender).formatWith(types);
    }


    getSelectedButton() {
        return <DropdownButton id="selectedButton" className="sf-query-button sf-tm-selected" title={JavascriptMessage.Selected.niceToString() }></DropdownButton>
    }


    renderHeaders(): React.ReactNode {
        return <tr>
        { this.props.allowSelection && <th className="sf-th-selection">
                <input type="checkbox" id="cbSelectAll" onClick={this.handleTogleAll}/>
            </th>
        }
        { this.state.findOptions.navigate && <th className="sf-th-entity"></th> }
        { this.state.findOptions.columnOptions.map((co, i) =>
                <th draggable={true}
                    style={i == this.state.dragIndex ? { opacity: 0.5 } : null }
                    className={(i == this.state.dropIndex ? "drag-left " : i == this.state.dropIndex - 1 ? "drag-right " : "") }
                data-column-name={co.token.fullKey}
                data-column-index={i}
                key={co.token.fullKey}
                onClick={this.handleHeaderClick}
                onDragStart={this.handleHeaderDragStart}
                onDragEnd={this.handleHeaderDragEnd}
                onDragOver={this.handlerHeaderDragOver}
                onDragEnter={this.handlerHeaderDragOver}
                onDrop={this.handleHeaderDrop}>
                    <span className={"sf-header-sort " + this.orderClassName(co) }/>
                    <span> { co.displayName }</span></th>) }
            </tr>;
    }

    orderClassName(column: ColumnOption) {
        var orders = this.state.findOptions.orderOptions;

        var o = orders.filter(a=> a.token.fullKey == column.token.fullKey).firstOrNull();
        if (o == null)
            return "";


        var asc = (o.orderType == OrderType.Ascending ? "asc" : "desc");

        if (orders.indexOf(o))
            asc += " l" + orders.indexOf(o);

        return asc;
    }



    renderRows(): React.ReactNode {

        var columnsCount = this.state.findOptions.columnOptions.length +
            (this.props.allowSelection ? 1 : 0) +
            (this.state.findOptions.navigate ? 1 : 0);

        if (!this.state.resultTable) {
            return <tr><td colSpan={columnsCount}>{JavascriptMessage.searchForResults.niceToString() }</td></tr>;
        }

        if (this.state.resultTable.rows.length == 0) {
            return <tr><td colSpan={columnsCount}>{ SearchMessage.NoResultsFound.niceToString() }</td></tr>;
        }

        var qs = this.state.querySettings;



        var columns = this.state.findOptions.columnOptions.map(co=> ({
            columnOption: co,
            cellFormatter: (qs && qs.formatters && qs.formatters[co.token.fullKey]) || Finder.formatRules.filter(a=> a.isApplicable(co)).last("FormatRules").formatter(co),
            resultIndex: this.state.resultTable.columns.indexOf(co.token.fullKey)
        }));

        
        var rowAttributes = qs && qs.rowAttributes;
        

        return this.state.resultTable.rows.map((row, i) =>
            <tr key={i} data-entity={liteKey(row.entity) } {...rowAttributes ? rowAttributes(row, this.state.resultTable.columns) : null} style={{ opacity: this.state.selectedRows.some(s=> row === s) ? 0.5 : 1 }}>
                 {this.props.allowSelection && <td style={{ textAlign: "center" }}><input type="checkbox" className="sf-td-selection"></input></td> }
                 {this.state.findOptions.navigate && <td>{((qs && qs.entityFormatter) || Finder.entityFormatRules.filter(a=> a.isApplicable(row)).last("EntityFormatRules").formatter)(row) }</td> }
                 {columns.map(c =>
                     <td key={c.resultIndex} style={{ textAlign: c.cellFormatter.textAllign }}>
                        {c.resultIndex == -1 ? null : c.cellFormatter.formatter(row.columns[c.resultIndex]) }
                        </td>) }
                </tr>);
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