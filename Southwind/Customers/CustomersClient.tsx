import * as React from 'react'
import { RouteObject } from 'react-router'
import { CompanyEntity, CustomerQuery, PersonEntity } from './Southwind.Customer';
import * as Navigator from '@framework/Navigator'
import * as Finder from '@framework/Finder'
import { EntitySettings } from '@framework/Navigator';
import { FilterGroupOption } from '@framework/FindOptions';



export function start(options: { routes: RouteObject[] }) {

  Navigator.addSettings(new EntitySettings(CompanyEntity, c => import('./Company')));
  Navigator.addSettings(new EntitySettings(PersonEntity, p => import('./Person')));

  Finder.addSettings({
    queryName: CustomerQuery.Customer,
    defaultFilters: [{
      groupOperation: "Or",
      filters: [
        { token: CompanyEntity.token(a => a.entity).cast(CompanyEntity).getToString(), operation: "Contains" },
        { token: PersonEntity.token(a => a.entity).cast(PersonEntity).getToString(), operation: "Contains" },
      ],
      pinned: { splitText: true, disableOnNull: true },
    } as FilterGroupOption]
  });
}
