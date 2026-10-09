import { Component } from '@angular/core';
import { 
  IonTabs, 
  IonTabBar, 
  IonTabButton, 
  IonIcon, 
  IonLabel 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { storefrontOutline, bagHandleOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [
    IonTabs, 
    IonTabBar, 
    IonTabButton, 
    IonIcon, 
    IonLabel
  ]
})
export class TabsPage {

  constructor() {
    // Registrar los íconos del menú inferior
    addIcons({
      storefrontOutline,
      bagHandleOutline,
      personOutline
    });
  }

}