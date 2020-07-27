import { NgModule } from '@angular/core';
import { DisponibilidadFilterPipe } from './disponibilidad-filter.pipe';
import { JoinsPipe } from './joins.pipe';
import { FechaPipe } from './fecha.pipe';

@NgModule({
    declarations: [DisponibilidadFilterPipe, JoinsPipe, FechaPipe],
    exports: [DisponibilidadFilterPipe, JoinsPipe, FechaPipe]
})
export class PipesModule { }
