
import * as React from 'react'
import { Modal, ModalProps, ModalClass, ButtonToolbar } from 'react-bootstrap'
import { DropdownList } from 'react-widgets'
import * as Finder from 'Framework/Signum.React/Scripts/Finder'
import { openModal, IModalProps } from 'Framework/Signum.React/Scripts/Modals';
import { FilterOperation, FilterOption, QueryDescription, QueryToken, SubTokensOptions } from 'Framework/Signum.React/Scripts/FindOptions'
import { SearchMessage, JavascriptMessage } from 'Framework/Signum.React/Scripts/Signum.Entities'
import * as Reflection from 'Framework/Signum.React/Scripts/Reflection'
import { default as SearchControl, SearchControlProps} from 'Templates/SearchControl/SearchControl'



interface QueryTokenBuilderProps extends React.Props<QueryTokenBuilder> {
    queryToken: QueryToken;
    onTokenChange: (newToken: QueryToken) => void;
    queryKey: string;
    subTokenOptions: SubTokensOptions;
    readOnly: boolean;
}

export default class QueryTokenBuilder extends React.Component<QueryTokenBuilderProps, {}>  {
    render() {

        var tokenList = getTokenList(this.props.queryToken);
        tokenList.push(null);
        
        return (<div>
            {tokenList.map((a, i) => <QueryTokenPart key={i}
                queryKey={this.props.queryKey}
                readOnly={this.props.readOnly}
                onTokenSelected={this.props.onTokenChange}
                subTokenOptions={this.props.subTokenOptions}
                parentToken={i == 0 ? null : tokenList[i - 1]}
                selectedToken={a} />) }
            </div>);
    }
}

function getTokenList(token: QueryToken): QueryToken[] {
    var result = [];
    while (token != null) {
        result.insertAt(0, token);
        token = token.parent;
    }
    return result;
}

interface QueryTokenPartProps extends React.Props<QueryTokenPart> {
    parentToken: QueryToken;
    selectedToken: QueryToken;
    onTokenSelected: (newToken: QueryToken) => void;
    queryKey: string;
    subTokenOptions: SubTokensOptions;
    readOnly: boolean;
}

export class QueryTokenPart extends React.Component<QueryTokenPartProps, { data?: QueryToken[] }>
{
    constructor(props: QueryTokenPartProps) {
        super(props);

        this.state = { data: null };

        if (!props.readOnly)
            this.requestSubTokens(props);
    }

    componentWillReceiveProps(newProps: QueryTokenPartProps) {
        if (!newProps.readOnly && !areEqual(this.props.parentToken, newProps.parentToken, a=> a.fullKey)) {
            this.setState({ data: null });
            this.requestSubTokens(newProps);
        }
    }


    requestSubTokens(props: QueryTokenPartProps) {
        Finder.API.subTokens(props.queryKey, props.parentToken, props.subTokenOptions).then(tokens=>
            this.setState({ data: tokens.length == 0 ? tokens: [null].concat(tokens) })
        );
    }




    handleOnChange = (value: any) => {
        this.props.onTokenSelected(value || this.props.parentToken);
    }

    render() {

        if (this.state.data != null && this.state.data.length == 0)
            return null;

        return <div className="sf-query-token-part">
            <DropdownList
                disabled={this.props.readOnly}
                filter="contains"
                data={this.state.data || []}
                value={this.props.selectedToken}
                onChange={this.handleOnChange}
                valueField="fullKey"
                textField="toString"
                valueComponent={QueryTokenItem}
                itemComponent={QueryTokenOptionalItem}
                busy={!this.props.readOnly && this.state.data == null}
                />
            </div>;
    }
}

export class QueryTokenItem extends React.Component<{ item: QueryToken }, {}> {
    render() {

        if (this.props.item == null)
            return null;

        return <span
            style= {{ color: this.props.item.typeColor }}
            title={this.props.item.niceTypeName}>
            { this.props.item.toString }
            </span>;
    }
}
  

export class QueryTokenOptionalItem extends React.Component<{ item: QueryToken }, {}> {
    render() {

        if (this.props.item == null)
            return <span> - </span>

        return <QueryTokenItem {...this.props}/>;
    }
}