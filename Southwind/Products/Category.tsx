import * as React from 'react'
import { AutoLine, TypeContext } from '@framework/Lines'
import { FileLine } from '@extensions/Signum.Files/Files'
import { useForceUpdate } from '@framework/Hooks'
import { CategoryEntity } from './Southwind.Products';

export default function Category(p : { ctx: TypeContext<CategoryEntity> }): React.JSX.Element {
  const forceUpdate = useForceUpdate();
  const maxDimensions: React.CSSProperties = { maxWidth: "96px", maxHeight: "96px" };
  const ctx = p.ctx.subCtx({ labelColumns: { sm: 3 } });
  return (
    <div className="row">
      <div className="col-sm-3">{/*photo*/}
        {ctx.value.picture && <img style={maxDimensions} src={"data:image/jpeg;base64," + ctx.value.picture.binaryFile} />}
      </div>{/*photo*/}
      <div className="col-sm-9">
        <AutoLine ctx={ctx.subCtx(c => c.categoryName)} />
        <AutoLine ctx={ctx.subCtx(c => c.description)} />
        <FileLine ctx={ctx.subCtx(c => c.picture)} onChange={() => forceUpdate()} />
      </div>
    </div>
  );
}
