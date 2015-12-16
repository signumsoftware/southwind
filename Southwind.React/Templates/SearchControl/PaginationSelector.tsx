
import * as React from 'react'
import { QuerySettings, CellFormatter, EntityFormatter, EntityFormatRules, FormatRules, defaultPagination } from 'Framework/Signum.React/Scripts/QuerySettings'
import * as Finder from 'Framework/Signum.React/Scripts/Finder'
import { ResultTable, Pagination, PaginationMode, PaginateMath} from 'Framework/Signum.React/Scripts/FindOptions'
import { SearchMessage, JavascriptMessage, Lite, IEntity, liteKey, DynamicQuery } from 'Framework/Signum.React/Scripts/Signum.Entities'
import {getEnumInfo} from 'Framework/Signum.React/Scripts/Reflection'
import * as Navigator from 'Framework/Signum.React/Scripts/Navigator'
import { Input } from 'react-bootstrap'


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

        this.state = { };
    }


    render() {

        if (!this.props.pagination)
            return null;

        return (<div className="sf-search-footer" >
            <div className="sf-pagination-left">{this.renderLeft() }</div>
            {this.renderCenter() }
            <div className="sf-pagination-right"></div>
            </div>);
    }

    renderLeft() {
        
        var resultTable = this.props.resultTable;
        if (!resultTable)
            return null;

        var pagination = this.props.pagination;

        if (pagination.mode == PaginationMode.All)
            return <span>{SearchMessage._0Results_N.niceToString().forGengerAndNumber(resultTable.totalElements).formatHtml(
                <span className="sf-pagination-strong">{resultTable.totalElements}</span>)
            }</span>


        if (pagination.mode == PaginationMode.Firsts)
            return <span>{SearchMessage.First0Results_N.niceToString().forGengerAndNumber(resultTable.totalElements).formatHtml(
                <span className={"sf-pagination-strong" + (resultTable.rows.length == resultTable.pagination.elementsPerPage ? " sf-pagination-overflow" : "") }>{resultTable.rows.length}</span>)
            }</span>

        if (pagination.mode == PaginationMode.Firsts)
            return <span>{SearchMessage._01of2Results_N.niceToString().forGengerAndNumber(resultTable.totalElements).formatHtml(
                <span className={"sf-pagination-strong"}>{PaginateMath.startElementIndex(pagination) }</span>,
                <span className={"sf-pagination-strong"}>{PaginateMath.endElementIndex(pagination, resultTable.rows.length) }</span>,
                <span className={"sf-pagination-strong"}>{resultTable.totalElements}</span>)
            }</span>
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

    handlePageClick = (e: React.MouseEvent) => {
        var p = extend({}, this.props.pagination, { currentPage: parseInt((e.currentTarget as HTMLElement).getAttribute("data-page")) });
        this.props.onPagination(p); 
    }

    renderCenter() {
        return <div className="sf-pagination-center form-inline form-xs">
               <Input type="select" value={this.props.pagination.mode} onChange={this.handleMode} ref="mode" standalone={true}>
                {[PaginationMode.Paginate, PaginationMode.Firsts, PaginationMode.All].map(mode=>
                    <option key={mode} value={mode.toString()}>{DynamicQuery.PaginationMode_Type.niceName(mode) }</option>) }
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

        var paginate = resultTable.pagination;

        var totalPages = PaginateMath.totalPages(paginate, resultTable.totalElements);

        var pageMin = Math.min(1, resultTable.pagination.currentPage - 2);
        var pageMax = Math.min(paginate.currentPage + 2, totalPages);

        var link = (num: number) => <li key={num}><a data-page={num} href="#" onClick={this.handlePageClick}>{num}</a></li>;


        return <ul className="pagination">
               <li className={paginate.currentPage <= 1 ? "disabled" : null }><a data-page={paginate.currentPage - 1} href="#" onClick={this.handlePageClick}>&laquo; </a></li>
               {pageMin != 1 && link(1) }
               {pageMin > 2 && (<li className="disabled"><span>...</span></li>) }
               {Array.range(pageMin, paginate.currentPage).map(link) }
               <li className="active"><span>{paginate.currentPage}</span></li>
               {Array.range(paginate.currentPage + 1, pageMax + 1).map(link) }
               {pageMax < totalPages - 1 && (<li className="disabled"><span>...</span></li>) }
               {pageMax < totalPages && link(totalPages) }
               <li className={totalPages <= paginate.currentPage ? "disabled" : null }><a data-page={paginate.currentPage + 1} href="#" onClick={this.handlePageClick}>&laquo; </a></li>
            </ul>;
    }
}