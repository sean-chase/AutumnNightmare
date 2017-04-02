import { Injectable } from '@angular/core';
import { Http, Response/*, Headers, RequestOptions*/ } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as io from 'socket.io-client';

@Injectable()
export class MapService  {
    // TODO: hard-coded
    url: string = "http://localhost:3000";
    gameAssetLocation: string = `${this.url}/mock`;
    socket: any;

    constructor(private http: Http) {
        // Create a socket connection to the server and notify that the player has joined the game.
        // TODO: refactor this when the server supports multiple games, multiple instances
        this.socket = io(this.url);
        this.socket.emit("join", this.getUserName());
    }

    getUserName(): string{
        return localStorage.getItem("username");
    }

    /** Get data about the map to make subsequent requests for assets */
    // TODO: this is going to change in a big way
    getMap(gameMapId: string): Observable<any> {
        return this.http.get(`${this.gameAssetLocation}/${gameMapId}/data.json`)
            .map((res: Response) => {
                console.log(res);
                res.json();
            })
            .catch((error: any) => Observable.throw(error.json().error || 'Unexpected server error getting game map.'));
    }

    /** Broadcast a user message to the server */
    sendMessage(message) {
        message.from = this.getUserName();
        this.socket.emit('add-message', message);
    }

    /** Subscribe to messages from the server */
    getMessages(): Observable<any> {
        let observable = new Observable(observer => {
            this.socket.on('message', (data) => {
                observer.next(data);
            });
            return () => {
                this.socket.disconnect();
            };
        });
        return observable;
    }

    /** Subscribe to player updates from the server */
    getPlayerUpdates(): Observable<any> {
        let observable = new Observable(observer => {
            this.socket.on('update-players', (data) => {
                observer.next(data);
            });
            return () => {
                this.socket.disconnect();
            };
        });
        return observable;
    }
}