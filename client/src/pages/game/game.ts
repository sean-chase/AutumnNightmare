import { Component, OnInit, ElementRef, ViewChild, OnDestroy, HostListener, NgZone } from '@angular/core';
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
    gameMapId: string = localStorage.getItem("map"); 
    instanceId: string = localStorage.getItem("instance");
    username: string = localStorage.getItem("username");
    messageSubscription: Subscription;
    playerUpdateSubscription: Subscription;
    messages: any = [];
    chatText: string;
    tile: string;
    gameState: any;
    mobs: any = [];

    constructor(public navCtrl: NavController,
                private platform: Platform,
                private mapService: MapService,
                public toastController: ToastController,
                private zone: NgZone) {

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

        this.handleMessages();
        this.handleGameStateUpdates();
        this.turnOnAutoScroll();
    }

    /** Subscribes to and handles general messages (such as chats, alerts, notifications) from the server */
    handleMessages() {
        this.messageSubscription = this.mapService.getMessages().subscribe(message => {
            this.messages.push(message);
        });
    }

    getMobImagePath(fileName: string): string {
        return `${this.mapService.gameAssetLocation}/${this.gameMapId}/mobs/${fileName}`;
    }

    /** Subscribes to and handles player status changes from the server */
    handleGameStateUpdates() {
        this.playerUpdateSubscription = this.mapService.getGameStateChanges().subscribe(gameState => {
            //this.toastController.create({ message: JSON.stringify(gameState), duration: 3000 }).present();
            this.gameState = gameState;
            let location = gameState.players[this.username].location;
            this.tile = `${this.mapService.gameAssetLocation}/${this.gameMapId}/tiles/sq${location.x}x${location.y}y${location.z}z${location.direction}.png`;
            
            let tileState = gameState["map"][`${location.x},${location.y},${location.z},${location.direction}`];

            let directionState = tileState[location.direction];
            if(directionState) {
                let visibleMobs = directionState.visibleMobs;
                if(visibleMobs) {
                    visibleMobs.forEach((visibleMob, index, array) => {
                        let mob = this.gameState.mobs[visibleMob.id];
                        if(mob) {
                            let copy = { ...mob };
                            let distance = visibleMob.distance || 1;
                            this.setMobPosition(copy, distance, array.length, index);
                            copy.distance = distance;
                            this.mobs.push(copy);
                        }
                    });
                }
            }
            else {
                this.mobs = [];
            }

            console.log(gameState);
        });
    }

    /** Set the mob styles based on the distance number and position based on number of mobs */
    setMobPosition(mob: any, distance: number, numberOfMobs: number, index: number) {
        if(!mob.style) {
            mob.style = {};
        }

        let height = 50;
        let width = 30;
        if(distance == 2) {
            height = 40;
            width = 20;
        }
        else if(distance == 3) {
            height = 36;
            width = 26;
        }
        else if(distance == 4) {
            height = 30;
            width = 20;
        }
        else if(distance == 5) {
            height = 20;
            width = 10;
        }
        else if(distance >= 5) {
            height = 10;
            width = 6;
        }
        mob.style.height = `${height}%`;
        mob.style.width = `${width}%`;

        // Hack: if the number of mobs is too high, this will be untenable, but split into 3s, 
        // design for rows of 3 if that's the case
        let left = (50 - (.5 * (width * ((numberOfMobs % 4) + 1)))) + (width *  (index % 3));
        mob.style.left = `${left}%`;

        mob.style.top = "50%";
        mob.style["z-index"] = (10 * (6 - distance)) + numberOfMobs - index;
        mob.style["position"] = "absolute";
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
