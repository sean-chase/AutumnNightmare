import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AutumnNightmareApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { GamePage } from '../pages/game/game';


@NgModule({
  declarations: [
    AutumnNightmareApp,
    HomePage,
    GamePage
  ],
  imports: [
    IonicModule.forRoot(AutumnNightmareApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    AutumnNightmareApp,
    HomePage,
    GamePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
