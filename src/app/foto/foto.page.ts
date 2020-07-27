import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { ModalController, Platform } from '@ionic/angular';
//import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import firebase from 'firebase';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-foto',
  templateUrl: './foto.page.html',
  styleUrls: ['./foto.page.scss'],
})
export class FotoPage implements OnInit {

  @ViewChild("video", { static: false })
  public video: any;

  @ViewChild("canvas", { static: false })
  public canvas: ElementRef;

  public captures: Array<any>;
  public imagen: any;
  public mobile: boolean;
  public path: string;
  private videotracks: any;
  public webcam = false;

  constructor(
    private angularFirestorage: AngularFireStorage,
    //private camera: Camera,
    private modalController: ModalController,
    private platform: Platform
  ) { }

  ngOnInit() {
    this.mobile = this.platform.is('cordova');
    if (!this.path) {
      this.cerrar();
    }
  }

  ngOnDestroy() {
    this.apagarCamara();
  }

  private almacenarImagen() {
    const fileRef = this.angularFirestorage.ref(this.path);
    fileRef.putString(this.imagen, firebase.storage.StringFormat.DATA_URL).then(() => {
      fileRef.getDownloadURL().subscribe(data => {
        this.imagen = data;
      });
    });
  }

  private apagarCamara() {
    return new Promise<any>(resolve => {
      if (this.webcam) {
        resolve(this.videotracks.forEach((track: any) => { track.stop(); }));
      } else {
        resolve();
      }
    });
  }

  public capture() {
    this.canvas.nativeElement.getContext("2d").drawImage(this.video.nativeElement, 0, 0, 1000, 1000);
    this.imagen = this.canvas.nativeElement.toDataURL("image/png");
    this.almacenarImagen();
    this.apagarCamara();
    this.webcam = false;
  }

  public cargarImagen() {
    /*const cameraOptions: CameraOptions = {
      quality: 50,
      encodingType: this.camera.EncodingType.JPEG,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true
    }

    this.camera.getPicture(cameraOptions).then((imageData) => {
      this.imagen = "data:image/jpeg;base64," + imageData;
      this.almacenarImagen();
    });*/
  }

  public cerrar() {
    this.modalController.dismiss();
  }

  public continuar() {
    this.modalController.dismiss({
      path: this.imagen
    });
  }

  public sacarFoto() {
    /*if (this.mobile) {
      const cameraOptions: CameraOptions = {
        quality: 50,
        encodingType: this.camera.EncodingType.JPEG,
        targetWidth: 1000,
        targetHeight: 1000,
        destinationType: this.camera.DestinationType.DATA_URL,
        sourceType: this.camera.PictureSourceType.CAMERA,
        correctOrientation: true
      }

      this.camera.getPicture(cameraOptions).then((imageData) => {
        this.imagen = "data:image/jpeg;base64," + imageData;
        this.almacenarImagen();
      });
    } else {
      this.webcam = true;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
          this.video.nativeElement.srcObject = stream;
          this.video.nativeElement.play();
          this.videotracks = stream.getVideoTracks();
        });
      }
    }*/
  }

  public seleccionarImagen(event: any) {
    this.apagarCamara();
    this.imagen = event.target.files[0];
    const fileRef = this.angularFirestorage.ref(this.path);
    const task = this.angularFirestorage.upload(this.path, this.imagen);
    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(data => {
          this.imagen = data;
        });
      })
    ).subscribe();
  }

}
