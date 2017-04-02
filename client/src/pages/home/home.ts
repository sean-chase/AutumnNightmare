import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { GamePage } from '../game/game';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  username: string = localStorage.getItem("username");
  password: string;

  constructor(public navCtrl: NavController) {

  }

  login() {
    // TODO: Login isn't really going to be the home page
    localStorage.setItem("username", this.username);
    this.navCtrl.push(GamePage);
  }

}
