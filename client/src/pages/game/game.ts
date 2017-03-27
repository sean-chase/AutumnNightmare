import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

@Component({
    selector: 'page-game',
    templateUrl: 'game.html'
})
export class GamePage {

    constructor(public navCtrl: NavController, private platform: Platform) {
        this.platform.ready().then(() => {
            window.screen["orientation"].lock('landscape');
        });
    }

    ionViewDidLeave() {
        this.platform.ready().then(() => {
            window.screen["orientation"].lock('portrait');
            window.screen["orientation"].unlock();
        });
    }
}
