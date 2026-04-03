import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../models/authService';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private toastrService: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  sendCode(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }


    const emailValue = this.forgotPasswordForm.value.email;

    this.authService.forgotPassword(emailValue).subscribe({
      next: (response) => {
        this.toastrService.success("Onay kodu e-posta adresinize gönderildi.");
        this.router.navigate(['/reset-password']);
      },
      error: (err) => {
        const errorMessage = err.error?.message || "E-posta gönderilirken bir hata oluştu.";
        this.toastrService.error(errorMessage);
        console.error("Şifre sıfırlama hatası:", err);
      }
    });
  }
}