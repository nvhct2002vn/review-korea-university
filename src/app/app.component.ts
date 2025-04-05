import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ScrollToTopComponent } from './components/scroll-to-top/scroll-to-top.component';

/**
 * Component chính của ứng dụng - AppComponent
 * @Component là một decorator định nghĩa metadata cho component
 */
@Component({
  // CSS selector được sử dụng để chèn component này vào HTML (thường là trong index.html)
  selector: 'app-root',
  // Thuộc tính standalone: true cho phép component được sử dụng mà không cần module
  standalone: true,
  // Các module, directive cần thiết cho component này
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HttpClientModule,
    ScrollToTopComponent
  ],
  // Đường dẫn tới file HTML template của component
  templateUrl: './app.component.html',
  // Đường dẫn tới file CSS của component
  styleUrl: './app.component.css'
})
export class AppComponent {
  // Tiêu đề của ứng dụng
  title = 'review-korea-university';
  
  // Lấy năm hiện tại cho phần footer
  // Được sử dụng trong template HTML với cú pháp {{ currentYear }}
  currentYear = new Date().getFullYear();
}
