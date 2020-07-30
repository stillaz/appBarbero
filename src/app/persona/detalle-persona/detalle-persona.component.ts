import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { CalendarioPage } from 'src/app/calendario/calendario.page';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DocumentoService } from 'src/app/services/documento.service';
import { Documento } from 'src/app/interfaces/documento';
import { PersonaService } from 'src/app/services/persona.service';
import { Persona } from 'src/app/interfaces/persona';

@Component({
  selector: 'app-detalle-persona',
  templateUrl: './detalle-persona.component.html',
  styleUrls: ['./detalle-persona.component.scss'],
})
export class DetallePersonaComponent implements OnInit {

  formulario: FormGroup;

  constructor(
    private alertController: AlertController,
    private barcodeScanner: BarcodeScanner,
    private documentoService: DocumentoService,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private personaService: PersonaService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.formulario = this.formBuilder.group({
      tipo_documento: ['CC', Validators.required],
      documento: ['', Validators.required],
      nombre: ['', Validators.required],
      sexo: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
      rh: [''],
      telefono: ['', Validators.required],
      direccion: ['', Validators.required]
    });

    const controlNombre = this.formulario.controls.nombre;
    const controlDireccion = this.formulario.controls.direccion;

    controlNombre.valueChanges.subscribe((data: string) => {
      if (data) {
        controlNombre.patchValue(data.toLocaleUpperCase(), {
          emitEvent: false,
          emitModelToViewChange: true
        });
      }
    });

    controlDireccion.valueChanges.subscribe((data: string) => {
      if (data) {
        controlDireccion.setValue(data.toLocaleUpperCase(), {
          emitEvent: false,
          emitModelToViewChange: true
        });
      }
    });
  }

  codigoBarras() {
    this.barcodeScanner.scan({
      formats: 'PDF_417',
      orientation: 'landscape',
      resultDisplayDuration: 500
    }).then(barcodeData => {
      const documentoData = this.documentoService.mapDocumentoPDF417(barcodeData.text);
      this.updateFormulario(documentoData);
    }).catch(err => {
      this.presentAlert(`Se presentó un error en la lectura del código de barras. Error: ${err}`);
    });
  }

  async guardar() {
    const loading = await this.loadingController.create({
      duration: 20000,
      message: 'Registrando persona...'
    });

    loading.present();

    const personaData: Persona = this.formulario.value;
    this.personaService.save(personaData).then(() => {
      this.presentToast();
      this.formulario.reset();
      this.formulario.controls.tipo_documento.setValue('CC', { emitEvent: false });
    }).catch(err => {
      this.presentAlert(err);
    }).finally(() => {
      loading.dismiss();
    });
  }

  async persona(event: CustomEvent) {
    const data = event.detail.value;
    if (data) {
      const documento = `${this.formulario.value.tipo_documento}${data}`
      const personaDocument = await this.personaService.persona(documento);
      const persona = personaDocument.data() as Persona;
      if (persona) {
        this.formulario.patchValue(persona, {
          emitEvent: false
        });
      }
    }
  }

  private async presentToast() {
    const toast = await this.toastController.create({
      message: 'Se ha resgistrado la entrada de la persona',
      duration: 3000
    });

    toast.present();
  }

  private async presentAlert(error: string) {
    const alert = await this.alertController.create({
      header: 'Registro de entrada',
      subHeader: 'Se presentó un error al registrar la entrada',
      message: error,
      buttons: ['Aceptar']
    });

    alert.present();
  }

  async seleccionarFecha() {
    const modal = await this.modalController.create({
      component: CalendarioPage,
      componentProps: {
        antes: true
      }
    });

    modal.onDidDismiss().then(res => {
      const data = res.data;
      if (data) {
        const fecha: Date = data.fecha;
        this.formulario.controls.fecha_nacimiento.setValue(fecha.toISOString());
      }
    });

    modal.present();
  }

  updateFormulario(documento: Documento) {
    this.formulario.patchValue({
      documento: documento.documento,
      nombre: documento.nombre,
      sexo: documento.sexo,
      fecha_nacimiento: documento.fecha_nacimiento,
      rh: documento.rh
    });
  }

}
