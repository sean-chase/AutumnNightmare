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
    gameAssetLocation: string = `${this.url}/maps`;
    socket: any;

    constructor(private http: Http) {
        // Create a socket connection to the server and notify that the player has joined the game.
        // TODO: refactor this when the server supports multiple games, multiple instances
        this.socket = io(this.url);
    }

    /** Gets a list of available maps */
    getMapList(): Observable<any> {
        return this.http.get(`${this.url}/maplist`)
            .map((res: Response) => {
                console.log(res);
                return res.json();
            })
            .catch((error: any) => Observable.throw(error.json().error || 'Unexpected server error getting game map list.'));
    }

    getInstanceList(): Observable<any> {
        return this.http.get(`${this.url}/instancelist`)
            .map((res: Response) => {
                console.log(res);
                return res.json();
            })
            .catch((error: any) => Observable.throw(error.json().error || 'Unexpected server error getting game instance list.'));
    }

    /** Joins a game instance if specified, or creates a new game instance */
    joinGame(gameMapId: string, instanceId: string): Observable<any> {
        let observable = new Observable(observer => {
            this.socket.on('join-complete', (data) => {
                observer.next(data);
            });
            return () => {
                this.socket.disconnect();
            };
        });
        this.socket.emit("join", this.getUserName(), gameMapId, instanceId);
        return observable;
    }

    /** Gets the username provided at login */
    getUserName(): string{
        return localStorage.getItem("username");
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

    /** Subscribe to game state changes from the server */
    getGameStateChanges(): Observable<any> {
        let observable = new Observable(observer => {
            this.socket.on('update-game-state', (data) => {
                observer.next(data);
            });
            return () => {
                this.socket.disconnect();
            };
        });
        return observable;
    }

    
}