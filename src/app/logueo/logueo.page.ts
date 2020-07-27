import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { AlertController, NavController } from '@ionic/angular';

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
    private angularFireAuth: AngularFireAuth,
    private formBuilder: FormBuilder,
    private navController: NavController
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
    this.login = this.todo.value;
    let result = this.angularFireAuth.signInWithEmailAndPassword(this.login.username, this.login.password);
    result.then(() => {
      this.navController.navigateRoot('tabs');
    }).catch((e: any) => {
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
      mensajeError ? this.presentAlertError(mensajeError) : this.presentAlertError(e);
    });
  }

  async presentAlertError(err: any) {
    const alert = await this.alertController.create({
      header: 'Ha ocurrido un error',
      message: `${err}`,
      buttons: ['OK']
    });

    alert.present();
  }

}
