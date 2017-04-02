import { Component, OnInit, ElementRef, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { MapService } from '../../services/map.service'
import { ToastController } from 'ionic-angular';
import { Subscription } from 'rxjs/Rx';

@Component({
    selector: 'page-game',
    templateUrl: 'game.html'
})
export class GamePage implements OnInit, OnDestroy {
    @ViewChild('messageReceiver') private messageReceiverControl: ElementRef;
    @ViewChild('chatInput') chatInput;
    @HostListener('document:keypress', ['$event']) 
    handleKeyboardEvent(event: KeyboardEvent) {  
        // Enter chat mode if they have a keyboard so they don't have
        // to click the button every time they want to type
        if(!this.chatting && event.key == "Enter") {
            this.setChatMode();
        }
    }

    chatting: boolean = false;
    gameMapId: string = "testmap"; // TODO
    gameMap: any;
    messageSubscription: Subscription;
    playerUpdateSubscription: Subscription;
    messages: any = [];
    chatText: string;

    constructor(public navCtrl: NavController,
        private platform: Platform,
        private mapService: MapService,
        public toastController: ToastController) {

        this.platform.ready().then(() => {
            if (platform.is('cordova')) {
                window.screen["orientation"].lock('landscape');
            }
        });
    }

    setChatMode() {
        this.chatting = true;
        setTimeout(() => {
            this.chatInput.setFocus();
        }, 150);
    }

    processChatText() {
        this.chatting = false;

        // TODO: check for commands if we're going to allow /commands 

        this.mapService.sendMessage({ type: 'chat', time: new Date(), text: this.chatText });
        this.chatText = "";
    }

    ngOnInit(): void {
        this.mapService.getMap(this.gameMapId).subscribe(
            (value) => this.gameMap = value,
            (error) => this.handerError(error));

        this.handleMessages();
        this.handlePlayerUpdates();

        setInterval(() => {
            this.messageReceiverControl.nativeElement.scrollTop = this.messageReceiverControl.nativeElement.scrollHeight;
        }, 500);
    }

    handleMessages() {
        this.messageSubscription = this.mapService.getMessages().subscribe(message => {
            this.messages.push(message);
        });
    }

    handlePlayerUpdates() {
        this.playerUpdateSubscription = this.mapService.getPlayerLocations().subscribe(message => {
            //this.toastController.create({ message: JSON.stringify(message), duration: 3000 }).present();
            console.log(message);
        });
    }

    getColorForMessageType(type: string) {
        if (type == "alert") {
            return "red";
        }
        else if (type == "notification") {
            return "#551A8B";
        }
        return "black";
    }

    handerError(error: any) {
        console.error(error);
        let message = error instanceof Error ? error.message : error;
        this.toastController.create({ message: message, duration: 3000 }).present();
    }

    ionViewDidLeave() {
        this.platform.ready().then(() => {
            if (this.platform.is('cordova')) {
                window.screen["orientation"].lock('portrait');
                window.screen["orientation"].unlock();
            }
        });
    }

    ngOnDestroy() {
        this.messageSubscription.unsubscribe();
    }
}
