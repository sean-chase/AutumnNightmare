import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { GamePage } from '../game/game';
import { MapService } from '../../services/map.service';
import { ToastController } from 'ionic-angular';

@Component({
    selector: 'page-lobby',
    templateUrl: 'lobby.html'
})
export class LobbyPage implements OnInit {
    @ViewChild('lobbyForm') form;
    maps: Array<{ value: string, text: string }> = [];
    instances: Array<{ value: string, text: string }> = [];
    map: any;

    constructor(public navCtrl: NavController,
                private mapService: MapService,
                public toastController: ToastController) {

    }

    ngOnInit(): void {
        this.mapService.getMapList().subscribe(
            (results) => {
                this.maps = results;
                // Select first by default
                this.map = results && results.length ? results[0].value : "";
            },
            (error) => this.handerError(error)
        );

        this.mapService.getInstanceList().subscribe(
            (results) => this.instances = results,
            (error) => this.handerError(error)
        );
    }

    go(lobbyForm: NgForm) {
        console.log(lobbyForm);
        if(lobbyForm.value.map || lobbyForm.value.instance) {
            localStorage.setItem("map", lobbyForm.value.map);
            localStorage.setItem("instance", lobbyForm.value.instance || '');
            this.navCtrl.push(GamePage);
        }
    }

    /** Process errors in a standard way (console, toast, etc.) */
    handerError(error: any) {
        console.error(error);
        let message = error instanceof Error ? error.message : error;
        this.toastController.create({ message: message, duration: 3000 }).present();
    }
}
