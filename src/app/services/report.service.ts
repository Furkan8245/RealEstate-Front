import { Injectable } from "@angular/core";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';

@Injectable({ providedIn: 'root' })
export class ReportService {

  // ✅ EXCEL: Oldukça yalın ve sağlam
  exportToExcel(data: any, fileName: string): void {
    const rows = Array.isArray(data) ? data : [data];
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Analizler');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }

  // ✅ PDF: Font yüklemesi yok, tertemiz standart PDF
  exportToPdfWithImage(headers: string[], data: any[][], imageData: string, fileName: string): void {
    const doc = new jsPDF();

    // Standart fontu kullanıyoruz (helvetica)
    doc.setFontSize(18);
    doc.text('ALAN ANALIZI RAPORU', 14, 15);

    if (imageData) {
      try {
        // Resim koordinatlarını ve boyutunu optimize ettik
        doc.addImage(imageData, 'PNG', 15, 25, 180, 100);
      } catch (e) {
        console.warn("Harita görüntüsü eklenemedi, tablo yazdırılıyor.");
      }
    }

    // Tabloyu çiziyoruz
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: imageData ? 135 : 25,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] }, // Standart mavi başlık
      styles: { fontSize: 10 }
    });

    doc.save(`${fileName}.pdf`);
  }
}