import * as React from 'react'
import { CategoryEntity } from '../Southwind.Entities'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext } from '../../../../Framework/Signum.React/Scripts/Lines'
import FileLine from '../../../../Extensions/Signum.React.Extensions/Files/FileLine'

export default class Category extends React.Component<{ ctx: TypeContext<CategoryEntity> }, void> {

    render() {
        const maxDimensions: React.CSSProperties = { maxWidth: "96px", maxHeight: "96px" };
        const ctx = this.props.ctx.subCtx({ labelColumns: { sm: 3} });
        return (
            <div className="row">
                <div className="col-sm-3">
                    {ctx.value.picture && <img style={maxDimensions} src={"data:image/jpeg;base64," + ctx.value.picture.binaryFile}/>}
                </div>
                <div className="col-sm-9">
                    <ValueLine ctx={ctx.subCtx(c => c.categoryName)} />
                    <ValueLine ctx={ctx.subCtx(c => c.description)} />
                    <FileLine ctx={ctx.subCtx(c => c.picture)} onChange={() => this.forceUpdate()} />
                </div>
            </div>
        );
    }
}
