import { Injectable } from '@angular/core';
import { userProfile } from '../Models/user';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private storageKey: string = 'users'
  private userProfiles: userProfile[] = []

  constructor() {
    const storage = localStorage.getItem(this.storageKey)
    if (storage) {
      this.userProfiles = JSON.parse(storage)
    }
  }

  fetchUserProfiles(): Observable<userProfile[]> {
    return of(this.userProfiles)
  }

  addOrEditUserProfile(user: userProfile){
    if (!user.id) { // add
      this.userProfiles.push({...user, id: this.userProfiles.length + 1})
    } else { // edit
      const index = this.userProfiles.findIndex(userProfile => userProfile.id === user.id)

      if (index != -1) {
        this.userProfiles.splice(index, 1, user)
      }
    }
    localStorage.setItem(this.storageKey, JSON.stringify(this.userProfiles))
  }

  deleteUserProfile(id: number){
    this.userProfiles = this.userProfiles.filter(user => user.id != id)
    localStorage.setItem(this.storageKey, JSON.stringify(this.userProfiles))
  }
}
