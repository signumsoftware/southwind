
import * as React from 'react'
import { Modal, ModalProps, ModalClass, ButtonToolbar } from 'react-bootstrap'
import * as Finder from 'Framework/Signum.React/Scripts/Finder'
import { openModal, IModalProps } from 'Framework/Signum.React/Scripts/Modals';
import { ColumnOption, QueryDescription, QueryToken, SubTokensOptions, FilterType } from 'Framework/Signum.React/Scripts/FindOptions'
import { SearchMessage, JavascriptMessage, Lite, Entity, DynamicQuery } from 'Framework/Signum.React/Scripts/Signum.Entities'
import { ValueLine, EntityLine, EntityCombo } from 'Framework/Signum.React/Scripts/Lines'
import { Binding, IsByAll, getTypeInfos } from 'Framework/Signum.React/Scripts/Reflection'
import { TypeContext, FormGroupStyle } from 'Framework/Signum.React/Scripts/TypeContext'
import QueryTokenBuilder from 'Templates/SearchControl/QueryTokenBuilder'


interface ColumnEditorProps extends React.Props<ColumnEditor> {
    columnOption: ColumnOption
    subTokensOptions: SubTokensOptions;
    queryDescription: QueryDescription;
    onChange: () => void;
}

export default class ColumnEditor extends React.Component<ColumnEditorProps, {}>  {

    handleTokenChanged = (newToken: QueryToken) => {
        this.props.columnOption.token = newToken;
        this.props.onChange();

    }

    handleOnChange = (event: React.FormEvent) => {
        this.props.columnOption.displayName = (event.currentTarget as HTMLInputElement).value;
        this.props.onChange();
    }

    render() {
        return <div className="sf-column-editor">
            <QueryTokenBuilder
                queryToken={this.props.columnOption.token}
                onTokenChange={this.handleTokenChanged}
                queryKey={this.props.queryDescription.queryKey}
                subTokenOptions={this.props.subTokensOptions}
                readOnly={false}/>
            <input className="form-control"
                value={this.props.columnOption.displayName}
                placeholder={this.props.columnOption.token.niceName}
                onChange={this.handleOnChange} />
            </div>;
    }

}



