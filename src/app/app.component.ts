import { Component, Signal, signal, WritableSignal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { UserService } from './services/user.service';
import { userProfile } from './Models/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  userData: FormGroup = this.formBuilder.group({
    id: [''],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    address: this.formBuilder.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required]
    }),
    skills: this.formBuilder.array([])
  })
  userProfiles: WritableSignal<userProfile[]> = signal([])
  totalNumberOfUsers: Signal<number> = signal(0)

  get skills(): FormArray {
    return this.userData.get('skills') as FormArray
  }

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserProfiles()
  }

  loadUserProfiles(): void {
    this.userProfiles = this.userService.getUserProfiles()
    this.totalNumberOfUsers = this.userService.getTotalNumberOfUsers()
  }

  submitForm(): void {
    this.userService.addOrEditUserProfile({
      id: this.userData.value.id,
      firstName: this.userData.value.firstName,
      lastName: this.userData.value.lastName,
      street: this.userData.value.address.street,
      city: this.userData.value.address.city,
      state: this.userData.value.address.state,
      zipCode: this.userData.value.address.zipCode,
      skills: this.userData.value?.skills?.length ? this.userData.value.skills.filter((skill: string) => !!skill) : [] // guard to prevent empty skills being added to the user
    })

    this.resetForm()
    this.formScrollTo('top')
  }

  isInvalid(formControlName: string): boolean {
    return !!this.userData.get(formControlName)?.invalid &&
      !!(this.userData.get(formControlName)?.dirty ||
        this.userData.get(formControlName)?.touched)
  }

  addSkill(): void {
    this.skills.push(this.formBuilder.control(''))

    this.formScrollTo('bottom')
  }

  deleteSkill(i: number) {
    this.skills.removeAt(i)
  }

  onEdit(user: userProfile): void {
    this.formScrollTo('top')
    if(this?.skills?.length) this.resetSkills()

    this.userData.patchValue(
      {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        address: {
          street: user.street,
          city: user.city,
          state: user.state,
          zipCode: user.zipCode
        }
      }
    )

    if (user?.skills?.length) {
      user.skills.forEach((skill) => this.skills.push(this.formBuilder.control(skill)))
    }
  }

  deleteUserProfile(id: number): void {
    this.userService.deleteUserProfile(id)
    this.loadUserProfiles()

    if(id === this.userData.value.id) { // guard for prevent editing a record that no longer exists due to deletion
      this.resetForm()
    }
  }

  resetForm(): void {
    this.userData.reset()
    this.resetSkills()
  }

  resetSkills(): void {
    this.skills.clear()
  }

  formScrollTo(position: 'top' | 'bottom'): void {
    setTimeout(() => {
      document.querySelector('.sectionContainer')?.scrollTo({
        top: position === 'top' ? 0 : 99999,
        behavior: 'smooth'
      })
    }, 0)
  }
}
