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
    // TODO: hard-coded, figure out how to handle map selection, etc.
    gameMapId: string = localStorage.getItem("map"); 
    instanceId: string = localStorage.getItem("instance");
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

    ngOnInit(): void {
        this.mapService.joinGame(this.gameMapId, this.instanceId).subscribe(
            (result) => this.joinGameComplete(<string>result.map, <string>result.instance),
            (error) => this.handerError(error));
    }

    /** Callback from joining a game instance (either existing instance, or new) */
    joinGameComplete(gameMapId: string, instanceId: string) {
        this.gameMapId = gameMapId;
        localStorage.setItem("map", gameMapId); 
        this.instanceId = instanceId;
        localStorage.setItem("instance", instanceId);

        // TODO: algorithm to decide what to load for game assets...
        // For now this is getting map metadata every time the game loads.
        // Would be cool to download whatever isn't cached. If that's too much data,
        // maybe download partial assets depending on player location to preload closest items
        this.mapService.getMap(this.gameMapId).subscribe(
            (value) => this.gameMap = value,
            (error) => this.handerError(error));

        this.handleMessages();
        this.handlePlayerUpdates();
        this.turnOnAutoScroll();
    }

    /** Subscribes to and handles general messages (such as chats, alerts, notifications) from the server */
    handleMessages() {
        this.messageSubscription = this.mapService.getMessages().subscribe(message => {
            this.messages.push(message);
        });
    }

    /** Subscribes to and handles player status changes from the server */
    handlePlayerUpdates() {
        this.playerUpdateSubscription = this.mapService.getPlayerUpdates().subscribe(message => {
            //this.toastController.create({ message: JSON.stringify(message), duration: 3000 }).present();
            console.log(message);
        });
    }

    /** Setup to enable the user to type a message */
    setChatMode() {
        this.chatting = true;
        setTimeout(() => {
            this.chatInput.setFocus();
        }, 150);
    }

    /** The user entered a message. Process the message. */
    processChatText() {
        this.chatting = false;

        // TODO: check for commands if we're going to allow /commands 

        this.mapService.sendMessage({ type: 'chat', time: new Date(), text: this.chatText });
        this.chatText = "";
    }

    /** LAME: auto scroll the messages every 1/2 second */
    turnOnAutoScroll() {
        setInterval(() => {
            this.messageReceiverControl.nativeElement.scrollTop = this.messageReceiverControl.nativeElement.scrollHeight;
        }, 500);
    }

    /** Determines font color for a message based on the message type */
    getColorForMessageType(type: string) {
        if (type == "alert") {
            return "red";
        }
        else if (type == "notification") {
            return "#551A8B";
        }
        return "black";
    }

    /** Process errors in a standard way (console, toast, etc.) */
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
        this.playerUpdateSubscription.unsubscribe();
    }
}
