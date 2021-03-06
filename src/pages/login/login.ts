import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, MenuController, ToastController, Platform } from 'ionic-angular';
import { LibreNMS } from '../../providers/libre-nms';
import { Storage } from '@ionic/storage';

@IonicPage({
    priority: 'high'
})
@Component({
    selector: 'page-login',
    templateUrl: 'login.html'
})

export class Login {
    public items: Array<{ token: string, url: string, name: any }> = [];
    modal: any;
    keys: any;
    temp_item: any;
    constructor(
        private platform: Platform,
        private toastCtrl: ToastController,
        private navCtrl: NavController,
        private modalCtrl: ModalController,
        private menu: MenuController,
        private storage: Storage,
        private api: LibreNMS) {
        // this.menu.swipeEnable(false);
        this.refresh();
        this.menu.enable(false);
    }

    refresh() {
        this.items = [];
        this.storage.ready().then(() => {
            this.storage.get('servers').then((servers) => {
                servers.forEach(server => {
                    this.items.push({
                        token: server.token,
                        url: server.url,
                        name: server.name
                    });
                })
            })
        });
    }

    openModal(modalTemplate, data = null) {
        console.log(data);
        if (modalTemplate == 0) {
            this.modal = this.modalCtrl.create('new-server');
        }
        else {
            this.modal = this.modalCtrl.create('Edit', data);
        }

        this.modal.onDidDismiss(data => {
            this.refresh();
        });
        this.modal.present();
    }

    login(item) {
        this.api.authenticate(item.url, item.token).subscribe((data) => {
            this.menu.enable(true);
            this.storage.set('_session', { 'url': item.url, 'token': item.token, 'version': '/api/v0' });
            this.navCtrl.setRoot('Dashboard');
        }, (error) => {
            console.log(error.json());
            if (error.status == 0) {
                this.presentToast('Unable to reach the server.');
            }
            else {
                this.presentToast((error.status ? error.status : '') + ':' + (error.statusText ? error.statusText : '') + "\n" + error.json().message);
            }
        });
    }

    presentToast(message) {
        let toast = this.toastCtrl.create({
            message: message,
            duration: 3000,
            position: 'top'
        });
        toast.present();
    }
}
