import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../models/authService';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!:FormGroup
  email:string ="";

  constructor(
    private formBuilder:FormBuilder,
    private authService:AuthService,
    private toastrService:ToastrService,
    private activatedRoute: ActivatedRoute,
    private router:Router
  ) {}
  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params =>{
      this.email = params['email'] || "";
      this.createResetPasswordForm();
    });
  }
  createResetPasswordForm(){
    this.resetPasswordForm = this.formBuilder.group({
      email:[this.email,[Validators.required,Validators.email]],
      code:["",[Validators.required,Validators.minLength(6),Validators.maxLength(6)]],
      newPassword:["",[Validators.required,Validators.minLength(6)]]
    });
  }
  resetPassword(){
    if (this.resetPasswordForm.valid) {
      let resetModel = Object.assign({},this.resetPasswordForm.value);

      this.authService.resetPassword(resetModel).subscribe({
        next:(response) => {
          this.toastrService.success(response.message, "Başarılı");
          this.router.navigate(['/login']);
        },
        error:(errResponse) => {
          this.toastrService.error(
            errResponse.error.message || "Şifre Sıfırlanmadı",
            "Hata"
          );
        }
      });
    }else{
      this.toastrService.warning("Lütfen formdaki eksikleri tamamlayınız","Dikkat");  
    }
  }
}
