
import * as React from 'react'
import { QuerySettings, CellFormatter, EntityFormatter, EntityFormatRules, FormatRules, defaultPagination } from 'Framework/Signum.React/Scripts/QuerySettings'
import * as Finder from 'Framework/Signum.React/Scripts/Finder'
import { ResultTable, Pagination, PaginationMode, PaginateMath} from 'Framework/Signum.React/Scripts/FindOptions'
import { SearchMessage, JavascriptMessage, Lite, IEntity, liteKey, DynamicQuery } from 'Framework/Signum.React/Scripts/Signum.Entities'
import {getEnumInfo} from 'Framework/Signum.React/Scripts/Reflection'
import * as Navigator from 'Framework/Signum.React/Scripts/Navigator'
import { Input, Pagination as BPagination } from 'react-bootstrap'


interface PaginationSelectorProps {
    resultTable?: ResultTable;
    pagination: Pagination;
    onPagination: (pag: Pagination) => void;
}


interface PaginationSelectorState {
}


export default class PaginationSelector extends React.Component<PaginationSelectorProps, PaginationSelectorState> {

    constructor(props) {
        super(props);

        this.state = {};
    }


    render() {

        if (!this.props.pagination)
            return null;

        return (<div className="sf-search-footer" >
            <div className="sf-pagination-left">{this.renderLeft() }</div>
            {this.renderCenter() }
            <div className="sf-pagination-right">{this.renderRight() }</div>
            </div>);
    }

    renderLeft() {

        var resultTable = this.props.resultTable;
        if (!resultTable)
            return null;

        var pagination = this.props.pagination;

        switch (pagination.mode) {

            case PaginationMode.All:
                return <span>{SearchMessage._0Results_N.niceToString().forGenderAndNumber(resultTable.totalElements).formatHtml(
                    <span className="sf-pagination-strong">{resultTable.totalElements}</span>)
                }</span>;

            case PaginationMode.Firsts:
                return <span>{SearchMessage.First0Results_N.niceToString().forGenderAndNumber(resultTable.rows.length).formatHtml(
                    <span className={"sf-pagination-strong" + (resultTable.rows.length == resultTable.pagination.elementsPerPage ? " sf-pagination-overflow" : "") }>{resultTable.rows.length}</span>)
                }</span>;

            case PaginationMode.Paginate:
                return <span>{SearchMessage._01of2Results_N.niceToString().forGenderAndNumber(resultTable.totalElements).formatHtml(
                    <span className={"sf-pagination-strong"}>{PaginateMath.startElementIndex(pagination) }</span>,
                    <span className={"sf-pagination-strong"}>{PaginateMath.endElementIndex(pagination, resultTable.rows.length) }</span>,
                    <span className={"sf-pagination-strong"}>{resultTable.totalElements}</span>)
                }</span>;
        }

    }

    handleMode = (e: React.SyntheticEvent) => {

        var mode = (e.currentTarget as HTMLInputElement).value as any as PaginationMode

        var p: Pagination = {
            mode: mode,
            elementsPerPage: mode != PaginationMode.All ? defaultPagination.elementsPerPage : null,
            currentPage: mode == PaginationMode.Paginate ? 1 : null
        };

        this.props.onPagination(p);
    }

    handleElementsPerPage = (e: React.SyntheticEvent) => {
        var p = extend({}, this.props.pagination, { elementsPerPage: parseInt((e.currentTarget as HTMLInputElement).value) });
        this.props.onPagination(p);
    }

    handlePageClick = (e: React.SyntheticEvent, page: { eventKey: number }) => {
        var p = extend({}, this.props.pagination, { currentPage: page.eventKey });
        this.props.onPagination(p);
    }

    renderCenter() {
        return <div className="sf-pagination-center form-inline form-xs">
               <Input type="select" value={this.props.pagination.mode} onChange={this.handleMode} ref="mode" standalone={true}>
                {[PaginationMode.Paginate, PaginationMode.Firsts, PaginationMode.All].map(mode=>
                    <option key={mode} value={mode.toString() }>{DynamicQuery.PaginationMode_Type.niceName(mode) }</option>) }
                   </Input>
              <Input type="select" value={this.props.pagination.elementsPerPage} onChange={this.handleElementsPerPage} ref="elementsPerPage" standalone={true}>
              {[5, 10, 20, 50, 100, 200].map(elem=>
                  <option key={elem} value={elem.toString() }>{elem}</option>) }
                  </Input>
            </div>;
    }





    renderRight() {
        var resultTable = this.props.resultTable;
        if (!resultTable || resultTable.pagination.mode != PaginationMode.Paginate)
            return null;
        
        var totalPages = PaginateMath.totalPages(resultTable.pagination, resultTable.totalElements);


        return <BPagination activePage={resultTable.pagination.currentPage} items={totalPages} ellipsis={true} maxButtons={8} first={true} last={true} onSelect={this.handlePageClick}/>;
    }
}