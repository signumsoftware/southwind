
import * as React from 'react'
import { Modal, ModalProps, ModalClass, ButtonToolbar } from 'react-bootstrap'
import { Combobox } from 'react-widgets'
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

export class QueryTokenPart extends React.Component<QueryTokenPartProps, { data?: QueryToken[]; value?: string }>
{
    constructor(props: QueryTokenPartProps) {
        super(props);

        this.state = { data: null, value: null };

        if (!props.readOnly)
            this.requestSubTokens();
    }

    componentWillReceiveProps(newProps: QueryTokenPartProps) {
        this.setState({ data: null, value: null });

        if (!newProps.readOnly)
            this.requestSubTokens();
    }


    requestSubTokens() {
        Finder.API.subTokens(this.props.queryKey, this.props.parentToken, this.props.subTokenOptions).then(tokens=>
            this.setState({ data: tokens })
        );
    }

  


    handleOnChange = (value: any) => {
        if (typeof value == "string")
            this.setState({ value });
        else
            this.props.onTokenSelected(value || this.props.parentToken);
    }

    render() {

        if (this.state.data == null || this.state.data.length == 0)
            return null;

        return <Combobox 
            className="juas"
            disabled={this.props.readOnly}
            filter="contains"
            data={this.state.data}
            value={this.state.value || this.props.selectedToken}
            onChange={this.handleOnChange}
            valueField="fullKey"
            textField="toString"
            />;
    }
}





