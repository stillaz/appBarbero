import { Component, OnInit } from '@angular/core';
import { Empresa } from '../interfaces/empresa';
import { EmpresaService } from '../services/empresa.service';

@Component({
  selector: 'app-empresa',
  templateUrl: './empresa.page.html',
  styleUrls: ['./empresa.page.scss'],
})
export class EmpresaPage implements OnInit {

  empresa: Empresa;

  constructor(private empresaService: EmpresaService) { }

  ngOnInit() {
    this.updateEmpresa();
  }

  private updateEmpresa(){
    this.empresaService.empresa().subscribe(empresa => {
      this.empresa = empresa;
    });
  }

}
