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
        this.socket = io(this.url);
        this.socket.emit("join", this.getUserName());
    }

    getUserName(): string{
        return localStorage.getItem("username");
    }

    getMap(gameMapId: string): Observable<any> {
        return this.http.get(`${this.gameAssetLocation}/${gameMapId}/data.json`)
            .map((res: Response) => {
                console.log(res);
                res.json();
            })
            .catch((error: any) => Observable.throw(error.json().error || 'Unexpected server error getting game map.'));
    }

    sendMessage(message) {
        message.from = this.getUserName();
        this.socket.emit('add-message', message);
    }

    getMessages(): Observable<any> {
        let observable = new Observable(observer => {
            this.socket.on('message', (data) => {
                observer.next(data);
            });
            // this.socket.on('update-players', (data) => {
            //     observer.next(data);
            // });
            return () => {
                this.socket.disconnect();
            };
        });
        return observable;
    }

    getPlayerLocations(): Observable<any> {
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