import { Routes } from '@angular/router';
import { NewSkuComponent } from './new-sku.component';
import { SearchSkuComponent } from './search-sku.component';
import { DeleteSkuComponent } from './delete-sku.component';
import { SkuManagerComponent } from './sku-manager.component';
import { EditSkuComponent } from './edit-sku.component';
import { TestSkuCreateComponent } from './test-sku-create.component';

export const routes: Routes = [
  { path: 'new', component: NewSkuComponent },
  { path: 'search', component: SearchSkuComponent },
  { path: 'edit', component: EditSkuComponent },
  { path: 'delete', component: DeleteSkuComponent },
  { path: 'manager', component: SkuManagerComponent },
  { path: 'test-create', component: TestSkuCreateComponent },
  { path: '', redirectTo: '/manager', pathMatch: 'full' },
];
