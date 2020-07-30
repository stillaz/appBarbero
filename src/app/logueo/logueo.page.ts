import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-logueo',
  templateUrl: './logueo.page.html',
  styleUrls: ['./logueo.page.scss'],
})
export class LogueoPage implements OnInit {

  public login = {} as {
    username: string,
    password: string
  };

  public todo: FormGroup;

  constructor(
    private alertController: AlertController,
    private formBuilder: FormBuilder,
    private loginService: LoginService
  ) { }

  ngOnInit() {
    this.form();
  }

  private form() {
    this.todo = this.formBuilder.group({
      username: [this.login.username, Validators.compose([Validators.required, Validators.email])],
      password: [this.login.password, Validators.required]
    });
  }

  public async logueo() {
    this.loginService.login(this.todo.value.username, this.todo.value.password).then(res => {
      if (res.additionalUserInfo.isNewUser) {
        this.cambioClave();
      }
    }).catch((e: any) => {
      const titulo = 'Inicio sesión';
      let mensajeError: string;
      switch (e.code) {
        case 'auth/user-not-found':
          this.todo.patchValue({ username: '', password: '' });
          mensajeError = 'El usuario no ha sido registrado en el sistema';
          break;

        case 'auth/wrong-password':
          mensajeError = 'La contraseña no es válida';
          this.todo.patchValue({ password: '' });
          break;
      }
      mensajeError ? this.presentAlert(titulo, e, mensajeError) : this.presentAlert(titulo, e);
    });
  }

  async presentAlert(titulo: string, mensaje: string, subtitulo?: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      subHeader: subtitulo,
      buttons: ['OK']
    });

    alert.present();
  }

  private async cambioClave() {
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
          const titulo = 'Cambio de clave';
          if (!data || !data.clave1) {
            this.presentAlert(titulo, 'La clave no es válida');
          } else if (!data || !data.clave2) {
            this.presentAlert(titulo, 'La segunda clave no es válida');
          } else if (data.clave1 !== data.clave2) {
            this.presentAlert(titulo, 'Las claves no coinciden');
          } else {
            this.presentAlert(titulo, 'Debes iniciar nuevamente con la nueva contraseña', 'Al actualizar la contraseña se cerrará la sesión actual');
            const clave = data.clave1;
            this.loginService.saveClave(clave);
          }
        }
      }]
    });
    alert.present();
  }

}
