import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  IonContent, 
  IonButton,
  IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, 
  chevronForwardOutline, 
  locationSharp, 
  lockClosedOutline, 
  peopleOutline,
  personCircleOutline,
  cardSharp,
  cardOutline,
  listOutline,
  logOutOutline 
} from 'ionicons/icons';
import { Preferences } from '@capacitor/preferences';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink,
    IonContent, 
    IonButton, 
    IonIcon
  ]
})
export class PerfilPage {
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private router: Router = inject(Router);

  public userProfile: Partial<Usuario> = {};
  private readonly KEY_PERFIL: string = 'ddr_key_perfil';

  constructor() {
    addIcons({
      arrowBackOutline,
      chevronForwardOutline,
      locationSharp,
      lockClosedOutline,
      peopleOutline,
      personCircleOutline,
      cardSharp,
      cardOutline,
      listOutline,
      logOutOutline
    });
  }

  ionViewWillEnter() {
    Preferences.get({ key: this.KEY_PERFIL }).then((res) => {
      if (res.value) {
        this.userProfile = JSON.parse(res.value) as Partial<Usuario>;
      } else {
        this.userProfile = {
          username: 'Usuario'
        };
        this.saveUserProfile();
      }
      this.cdr.detectChanges();
    });
  }

  public goBackTienda() {
    this.router.navigateByUrl('/tabs/tienda');
  }

  private saveUserProfile() {
    Preferences.set({
      key: this.KEY_PERFIL,
      value: JSON.stringify(this.userProfile),
    });
  }
}