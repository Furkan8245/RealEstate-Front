import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../models/authService";
import { control } from "leaflet";

@Component({
    selector:'app-register',
    standalone:true,
    imports:[ReactiveFormsModule,CommonModule,RouterModule],
    templateUrl:'./register.component.html'
})
export class RegisterComponent implements OnInit{
    registerForm!:FormGroup;
    constructor(private formBuilder:FormBuilder,private authService:AuthService,private router:Router){}
    ngOnInit(): void {
        this.createRegisterForm();
    }
    createRegisterForm() {
    this.registerForm = this.formBuilder.group({
        firstName: ["", Validators.required],
        lastName: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(8)]], // Dizi içine aldık
        confirmPassword: ["", Validators.required]
    }, {
        validators: this.passwordMatchControl 
    });
}
    passwordMatchControl:ValidatorFn=(control:AbstractControl):ValidationErrors|null=>{
        const password=control.get('password');
        const confirmPassword=control.get('confirmPassword');

        return password && confirmPassword && password.value === confirmPassword.value
        ? null:{passwordMismatch:true};
    };
    
    register(){
        if (this.registerForm.valid) {
            let registerModel=Object.assign({},this.registerForm.value);

            delete registerModel.confirmPassword;
            console.log("Backend verisi:",registerModel);
            
            this.authService.register(registerModel).subscribe({
                next:(response)=>{
                    alert("Kayıt başarıyla tamamlandı!Giriş yapabilirsiniz.");
                    this.router.navigate(["/login"]);
                },
                error:(err)=>{alert(err.error?.message||"Kayıt sırasında hata meydana geldi.");}
            });
        }
        else
        {
            alert("Lütfen formu eksiksiz ve şifreler uyuşacak şekilde doldurun!");
        }
    }
}