
import * as React from 'react'
import * as Finder from 'Framework/Signum.React/Scripts/Finder'
import { ResultTable, FindOptions, FilterOption, QueryDescription } from 'Framework/Signum.React/Scripts/FindOptions'
import { Entity, Lite } from 'Framework/Signum.React/Scripts/Signum.Entities'
import * as Reflection from 'Framework/Signum.React/Scripts/Reflection'
import NormalControl from 'Templates/NormalControl'



interface NormalPageProps extends ReactRouter.RouteComponentProps<{}, { type: string; id?: string }> {

}

export default class NormalPage extends React.Component<NormalPageProps, {}> {

    constructor(props) {
        super(props);
        this.state = {};
    }
    
    render() {

        var type = Reflection.getTypeInfo(this.props.routeParams.type);

        var id = type.members["Id"].type == "number" && this.props.routeParams.id != "" ? parseInt(this.props.routeParams.id) : this.props.routeParams.id;

        var lite: Lite<Entity> = {
            EntityType: type.name,
            id: id,
        }

        return (<div id="divMainPage" data-isnew={this.props.routeParams.id == null} className="form-horizontal">
            <NormalControl lite={lite}/>
            </div>);
    }
}



