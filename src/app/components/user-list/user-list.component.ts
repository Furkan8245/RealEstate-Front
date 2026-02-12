import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  users:any[]=[];
  loading=true;

constructor(private userService:UserService) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        if (res.success) this.users = res.data;
        this.loading = false;
      },
      error: (err) => {
        console.error("Kullanıcılar yüklenemedi", err);
        this.loading = false;
      }
    });
  }
}


  