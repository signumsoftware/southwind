import { RouteObject } from 'react-router'
import { Navigator, EntitySettings } from '@framework/Navigator'
import * as Finder from '@framework/Finder'
import { FilterGroupOption } from '@framework/FindOptions';
import { AddressEmbedded, CompanyEntity, CustomerQuery, PersonEntity } from './Southwind.Customers';


export function start(options: { routes: RouteObject[] }) {

  Navigator.addSettings(new EntitySettings(CompanyEntity, c => import('./Company')));
  Navigator.addSettings(new EntitySettings(PersonEntity, p => import('./Person')));
  Navigator.addSettings(new EntitySettings(AddressEmbedded, a => import('./Address')));

  Finder.addSettings({
    queryName: CustomerQuery.Customer,
    defaultFilters: [{
      groupOperation: "Or",
      filters: [
        { token: CompanyEntity.token(a => a.entity).cast(CompanyEntity).getToString(), operation: "Contains" },
        { token: PersonEntity.token(a => a.entity).cast(PersonEntity).getToString(), operation: "Contains" },
      ],
      pinned: { splitValue: true, disableOnNull: true },
    } as FilterGroupOption]
  });
}
