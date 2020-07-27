import { Component, OnInit } from '@angular/core';
import { UsuarioOptions } from 'src/app/interfaces/usuario-options';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { ClienteService } from 'src/app/services/cliente.service';

@Component({
  selector: 'app-detalle-cliente',
  templateUrl: './detalle-cliente.component.html',
  styleUrls: ['./detalle-cliente.component.scss'],
})
export class DetalleClienteComponent implements OnInit {

  public cliente = {} as UsuarioOptions;
  public nuevo = true;
  public todo: FormGroup;
  private usuario: string;

  constructor(
    private alertController: AlertController,
    private clienteService: ClienteService,
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.todo = this.formBuilder.group({
      nombre: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['']
    });

    this.todo.valueChanges.subscribe(data => {
      if (data && data.nombre) {
        const capitalizada = data.nombre.toLowerCase()
          .replace(/(?:^|\s)\S/g, (l: string) => l.toUpperCase());
        this.todo.get('nombre').setValue((capitalizada), {
          emitEvent: false,
          emitModelToViewChange: true
        });
      }
    });
  }

  private actualizarForm() {
    const nombreForm = this.todo.get('nombre');
    const emailForm = this.todo.get('email');
    const telefonoForm = this.todo.get('telefono');

    nombreForm.setValue(this.cliente.nombre);
    emailForm.setValue(this.cliente.correoelectronico);

    if (this.usuario === 'usuario') {
      nombreForm.disable();
      emailForm.disable();
    } else {
      nombreForm.enable();
      emailForm.enable();
      telefonoForm.setValue(this.todo.value.telefono);
    }
  }

  public async cerrar() {
    this.modalController.dismiss();
  }

  public guardar() {
    if (this.usuario === 'usuario' && this.todo.value.telefono !== this.cliente.telefono) {
      this.presentAlert('Actualizar información', `¿Está seguro acutalizar el número de teléfono de ${this.cliente.nombre}?`);
    } else if (this.usuario !== 'usuario') {
      this.registrar();
    }
  }

  private async presentAlert(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: [{
        text: 'Si',
        handler: () => {
          this.registrar();
        }
      }, {
        text: 'No',
        handler: () => {

        }
      }]
    });

    await alert.present();
  }

  private async presentToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      duration: 3000,
      message: mensaje,
      color: color
    });

    await toast.present();
  }

  private registrar() {
    const cliente = this.todo.value;
    this.clienteService.saveCliente(cliente).then(() => {
      this.presentToast('Se ha guardado la información del usuario', '');
    }).catch(err => {
      this.presentToast(`Error, no se pudo guardar la información del usuario. Error: ${err}`, 'danger');
    });

    this.modalController.dismiss({
      cliente: cliente
    });
  }

  public updateCliente() {
    const telefono = this.todo.value.telefono;
    this.clienteService.clientesTelefono(telefono).subscribe(clientes => {
      const cliente = clientes[0];
      if (!cliente) {
        this.cliente.telefono = this.nuevo && telefono;
      } else if (cliente && cliente.email === cliente.id) {
        this.cliente = cliente;
        this.usuario = 'usuario';
        this.nuevo = false;
      } else {
        this.cliente = cliente;
        this.usuario = 'cliente';
        this.nuevo = false;
      }

      this.actualizarForm();
    });
  }

}
