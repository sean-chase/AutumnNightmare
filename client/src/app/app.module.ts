import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AutumnNightmareApp } from './app.component';
import { MapService } from '../services/map.service'
import { HomePage } from '../pages/home/home';
import { GamePage } from '../pages/game/game';
import { FocusDirective } from '../directives/focus-directive';


@NgModule({
  declarations: [
    AutumnNightmareApp,
    FocusDirective,
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
    MapService,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
