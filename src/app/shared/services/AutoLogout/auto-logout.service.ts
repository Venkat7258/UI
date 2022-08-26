import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import * as store from 'store';
import { EnvService } from '../env.service';
import { RMMApiService } from '../rmmapi.service';
const CHECK_INTERVALL = 5000 //in ms
const STORE_KEY = 'lastAction';
@Injectable({
  providedIn: 'root'
})
export class AutoLogoutService {
  public MINUTES_UNITL_AUTO_LOGOUT: number; // in Minutes
  constructor(
    private auth: RMMApiService,
    private router: Router,
    private ngZone: NgZone,
    private env: EnvService,
  ) {
    this.MINUTES_UNITL_AUTO_LOGOUT = this.env.AutoLogOutTime;
    this.check();
    this.initListener();
    this.initInterval();
  }
  get lastAction() {
    return parseInt(store.get(STORE_KEY));
  }
  set lastAction(value) {
    store.set(STORE_KEY, value);
  }
  initListener() {
    this.ngZone.runOutsideAngular(() => {
      document.body.addEventListener('click', () => this.reset());
      document.body.addEventListener('mouseover', () => this.reset());
      document.body.addEventListener('mouseout', () => this.reset());
      document.body.addEventListener('keydown', () => this.reset());
      document.body.addEventListener('keyup', () => this.reset());
      document.body.addEventListener('keypress', () => this.reset());
      //window.addEventListener("storage",() => this.storageEvt());
    });
  }
  initInterval() {
    this.ngZone.runOutsideAngular(() => {
      setInterval(() => {
        this.check();
      }, CHECK_INTERVALL);
    })
  }
  reset() {
    //console.log('date got by using events', Date.now());
    this.lastAction = Date.now();
    //console.log('store keyL', localStorage.getItem(STORE_KEY));
    //console.log('store keyS', store.get(STORE_KEY));
  }
  check() {
    const now = Date.now();
    const timeleft = this.lastAction + this.MINUTES_UNITL_AUTO_LOGOUT * 60 * 1000;
    const diff = timeleft - now;
    console.log('difference', diff)
    const isTimeout = diff < 0;
    this.ngZone.run(() => {
      if (isTimeout) {
        let token = this.auth.getToken();
        if (token != "NA") {
          // console.log(`Sie wurden automatisch nach ${this.MINUTES_UNITL_AUTO_LOGOUT} Minuten Inaktivität ausgeloggt.`);
          this.auth.postData("UserAccount/Logout", {}).toPromise().then((res: any) => {
            this.router.navigate(['/Login']);
          });
          store.remove(STORE_KEY)
          localStorage.clear();
        }
      }
    });
  }
  // storageEvt(){
  //   console.log("storage");
  //   this.val = localStorage.getItem(STORE_KEY);
  // }
}
