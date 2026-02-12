import { Component, OnInit } from '@angular/core';
import { AuditLogService } from '../../services/audit-log.services';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-audit-log',
  standalone:true,
  imports:[CommonModule],
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.css']
})
export class AuditLogComponent implements OnInit {
  logs: any[] = [];
  isLoading = true;

  constructor(private auditLogService:AuditLogService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs() {
    this.auditLogService.getAllLogs().subscribe({
      next: (res) => {
        if (res.success) this.logs = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Loglar yüklenemedi", err);
        this.isLoading = false;
      }
    });
  }
}