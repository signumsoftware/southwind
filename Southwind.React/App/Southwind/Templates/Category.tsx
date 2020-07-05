import * as React from 'react'
import { CategoryEntity } from '../Southwind.Entities'
import { ValueLine, TypeContext } from '@framework/Lines'
import { FileLine } from '@extensions/Files/FileLine'
import { useForceUpdate } from '@framework/Hooks'

export default function Category(p : { ctx: TypeContext<CategoryEntity> }){
  const forceUpdate = useForceUpdate();
  const maxDimensions: React.CSSProperties = { maxWidth: "96px", maxHeight: "96px" };
  const ctx = p.ctx.subCtx({ labelColumns: { sm: 3 } });
  return (
    <div className="row">
      <div className="col-sm-3">{/*photo*/}
        {ctx.value.picture && <img style={maxDimensions} src={"data:image/jpeg;base64," + ctx.value.picture.binaryFile} />}
      </div>{/*photo*/}
      <div className="col-sm-9">
        <ValueLine ctx={ctx.subCtx(c => c.categoryName)} />
        <ValueLine ctx={ctx.subCtx(c => c.description)} />
        <FileLine ctx={ctx.subCtx(c => c.picture)} onChange={() => forceUpdate()} />
      </div>
    </div>
  );
}
