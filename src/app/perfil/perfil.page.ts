import { Component, OnInit } from '@angular/core';
import { UsuarioOptions } from 'src/app/interfaces/usuario-options';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NavController, AlertController, Platform, ModalController } from '@ionic/angular';
import { UsuarioService } from 'src/app/services/usuario.service';
import { LoginService } from 'src/app/services/login.service';
import { FotoPage } from '../foto/foto.page';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {

  actualizar_email: boolean = false;
  actualizar_clave: boolean = false;
  mobile: boolean;
  todo: FormGroup;
  usuario: UsuarioOptions;

  constructor(
    private alertController: AlertController,
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private modalController: ModalController,
    private navController: NavController,
    private platform: Platform,
    private usuarioServicio: UsuarioService
  ) { }

  ngOnInit() {
    this.mobile = this.platform.is('mobile');
    this.usuario = this.usuarioServicio.usuarioLogueado;
    this.form();
  }

  async actualizarClave() {
    const alert = await this.alertController.create({
      header: 'Cambio de clave',
      message: 'Ingresa aquí la clave actual',
      inputs: [{
        name: 'clave',
        type: 'password'
      }],
      buttons: [{
        text: 'Cancelar',
        role: 'cancel'
      }, {
        text: 'Continuar',
        handler: dataclave => {
          if (!dataclave || !dataclave.clave) {
            this.alertClaveInvalida();
          } else {
            this.loginService.login(this.usuario.email, dataclave.clave).then(() => {
              this.alertClaveNueva();
            }).catch(() => {
              this.alertClaveInvalida();
            });
          }
        }
      }]
    });

    alert.present();
  }

  async actualizarEmail() {
    const alert = await this.alertController.create({
      header: 'Actualizar correo',
      message: '¿Está seguro de cambiar el correo electrónico de inicio de sesión?',
      buttons: [{
        text: 'No',
        role: 'cancel'
      }, {
        text: 'Si',
        handler: () => {
          this.alertRegistroCorreo();
        }
      }]
    });

    alert.present();
  }

  private async alertCierreSesionClave() {
    const alert = await this.alertController.create({
      header: 'Actualizar clave',
      subHeader: 'Al actualizar la contraseña se cerrará la sesión actual',
      message: 'Debes iniciar nuevamente con la nueva contraseña',
      buttons: [{
        text: 'OK'
      }]
    });

    alert.present();
  }

  private async alertCierreSesionEmail() {
    const alert = await this.alertController.create({
      header: 'Actualizar correo',
      subHeader: 'Al actualizar el correo electrónico se cerrará la sesión actual',
      message: 'Debes iniciar nuevamente con el nuevo correo',
      buttons: [{
        text: 'OK'
      }]
    });

    alert.present();
  }

  private async alertClaveInvalida() {
    const alert = await this.alertController.create({
      header: 'Cambio de clave',
      message: 'La clave no es válida',
      buttons: [{
        text: 'OK',
        role: 'cancel'
      }]
    });

    alert.present();
  }

  private async alertClavesInvalidas() {
    const alert = await this.alertController.create({
      header: 'Cambio de clave',
      message: 'Las claves no coinciden',
      buttons: [{
        text: 'OK',
        role: 'cancel'
      }]
    });

    alert.present();
  }

  private async alertClaveNueva() {
    const alert = await this.alertController.create({
      header: 'Cambio de clave',
      message: "Ingrese aquí la clave nueva",
      inputs: [{
        placeholder: 'Clave nueva',
        name: 'clave1',
        type: 'password'
      }, {
        placeholder: 'Repite la clave',
        name: 'clave2',
        type: 'password'
      }],
      buttons: [{
        text: 'Cancelar',
        role: 'cancel'
      }, {
        text: 'Guardar',
        handler: (data: any) => {
          if (!data || !data.clave1) {
            this.alertClaveInvalida();
          } else if (!data || !data.clave2) {
            this.alertSegundaClaveInvalida();
          } else if (data.clave1 !== data.clave2) {
            this.alertClavesInvalidas();
          } else {
            this.alertCierreSesionClave();
            const clave = data.clave1;
            this.usuarioServicio.saveClave(clave);
          }
        }
      }]
    });
    alert.present();
  }

  private async alertSegundaClaveInvalida() {
    const alert = await this.alertController.create({
      header: 'Cambio de clave',
      message: 'La segunda clave no es válida',
      buttons: [{
        text: 'OK',
        role: 'cancel'
      }]
    });

    alert.present();
  }

  private async alertCorreoInvalido() {
    const alert = await this.alertController.create({
      header: 'Actualizar correo',
      message: 'Correo no es válido',
      buttons: [{
        text: 'OK',
        role: 'cancel'
      }]
    });

    alert.present();
  }

  private async alertRegistroCorreo() {
    const prompt = await this.alertController.create({
      header: 'Actualizar correo',
      message: "Ingrese aquí el nuevo correo electrónico",
      inputs: [{
        name: 'email',
        placeholder: this.usuario.email,
        type: 'email'
      }],
      buttons: [{
        text: 'Cancelar',
        role: 'cancel'
      }, {
        text: 'Guardar',
        handler: data => {
          this.alertCierreSesionEmail();
          if (data && data.email) {
            const email = data.email;
            this.usuarioServicio.saveCorreo(email, this.usuario.id);
          } else {
            this.alertCorreoInvalido();
          }
        }
      }]
    });
    prompt.present();
  }

  private async alertUsuarioActualizado() {
    const alert = await this.alertController.create({
      header: 'Usuario actualizado',
      message: 'El usuario ha sido actualizado exitosamente',
      buttons: ['OK']
    });

    alert.present();
  }

  form() {
    this.todo = this.formBuilder.group({
      id: [this.usuario.id],
      nombre: [this.usuario.nombre, Validators.required],
      telefono: [this.usuario.telefono, Validators.required],
      email: [this.usuario.email, Validators.required],
      clave: ['1234567890'],
      perfiles: [this.usuario.perfiles, Validators.required],
      imagen: [this.usuario.imagen],
      activo: [this.usuario.activo, Validators.required]
    });
  }

  async foto() {
    const modal = await this.modalController.create({
      component: FotoPage,
      componentProps: {
        path: `usuarios/${this.usuario.id}`
      }
    });

    modal.onDidDismiss().then(res => {
      if (res.data && res.data.path) {
        this.todo.patchValue({ imagen: res.data.path });
      }
    });

    modal.present();
  }

  guardar() {
    const usuarioData = this.todo.value;
    this.usuarioServicio
      .saveData(this.usuario.id, usuarioData.telefono, usuarioData.imagen, this.usuario.idempresa)
      .then(() => {
        this.alertUsuarioActualizado();
        this.navController.pop();
      });
  }

}
