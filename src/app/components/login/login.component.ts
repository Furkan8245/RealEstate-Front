import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../models/authService";
import { Router, RouterLink } from "@angular/router";

@Component({
    selector:'app-login',
    standalone:true,
    imports: [ReactiveFormsModule, CommonModule, RouterLink],
    templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit{
    loginForm!:FormGroup;

    constructor(private formBuilder:FormBuilder,private authService:AuthService,private router:Router){}
    ngOnInit(): void {
        this.createLoginForm();
    }

    createLoginForm(){
        this.loginForm=this.formBuilder.group({
            email:["",[Validators.required,Validators.email]],
            password:["",Validators.required]
        });
    }

    login(){
        if (this.loginForm.valid) {
            let loginModel=Object.assign({},this.loginForm.value);

            this.authService.login(loginModel).subscribe({
                next:(response:any)=>{
                     console.log("Backend Response:", response);
                    if(response && response.token){
                    localStorage.setItem("token",response.token);
                    localStorage.setItem("expiration",response.expiration);
                    alert("Giriş Başarılı");
                    this.router.navigate(["/analysis"]);
                    }else{
                        console.error("Token bulunamadı! Backend'de hangi formaatın döndüğünü kontrol ediniz.")
                    }
                    
                },
                error:(err)=>{
                    console.error("Backend'den gelen hata:", err);
        
                    // Backend'den gelen spesifik hata mesajını gösterelim
                    const errorMessage = err.error?.ErrorMessage || "Sunucu hatası veya mükerrer kayıt!";
                    alert("Giriş Başarısız: " + errorMessage);
                }
            });
        }
    }
}