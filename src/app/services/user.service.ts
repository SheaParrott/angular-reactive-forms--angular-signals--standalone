import { computed, effect, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { userProfile } from '../Models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private storageKey: string = 'users'
  private userProfiles: WritableSignal<userProfile[]> = signal([])
  private totalNumberOfUsers: Signal<number> = computed(() => this.userProfiles().length)

  constructor() {
    const storage = localStorage.getItem(this.storageKey)
    if (storage && storage != 'undefined') {
      const parsed = JSON.parse(storage)
      if (parsed) {
        this.userProfiles.set(JSON.parse(storage))
      }
    }

    effect(() => {
      console.log('All user Profiles: ', this.userProfiles())
    })
  }

  getUserProfiles(): WritableSignal<userProfile[]> {
    return this.userProfiles
  }

  getTotalNumberOfUsers(): Signal<number> {
    return this.totalNumberOfUsers
  }

  addOrEditUserProfile(user: userProfile){
    if (!user.id) { // add
      this.userProfiles.set([...this.userProfiles(), {...user, id: this.userProfiles().length + 1}])
    } else { // edit
      const index = this.userProfiles().findIndex(userProfile => userProfile.id === user.id)

      if (index != -1) {
        this.userProfiles().splice(index, 1, user)
      }
    }

    localStorage.setItem(this.storageKey, JSON.stringify(this.userProfiles()))
  }

  deleteUserProfile(id: number){
    this.userProfiles.set(this.userProfiles().filter(user => user.id != id))
    localStorage.setItem(this.storageKey, JSON.stringify(this.userProfiles()))
  }
}
