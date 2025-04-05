import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

/**
 * Component hiển thị nút cuộn lên đầu trang
 * Nút chỉ hiển thị khi người dùng đã cuộn xuống một khoảng nhất định
 */
@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      *ngIf="showButton" 
      class="scroll-to-top-btn" 
      (click)="scrollToTop()"
      aria-label="Scroll to top"
    >
      <!-- Icon mũi tên lên -->
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  `,
  styles: [`
    .scroll-to-top-btn {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: #3f51b5;
      color: white;
      border: none;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0.8;
      transition: all 0.3s ease;
    }
    
    .scroll-to-top-btn:hover {
      opacity: 1;
      transform: translateY(-5px);
    }
    
    /* Animation for appearing and disappearing */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 0.8; transform: translateY(0); }
    }
    
    .scroll-to-top-btn {
      animation: fadeIn 0.3s ease;
    }
  `]
})
export class ScrollToTopComponent {
  // Biến theo dõi trạng thái hiển thị nút
  showButton = false;
  
  // Khoảng cách cuộn tối thiểu để hiển thị nút (pixel)
  private scrollThreshold = 300;

  /**
   * Constructor - Tiêm PLATFORM_ID để kiểm tra môi trường
   * @param platformId ID của nền tảng (browser hoặc server)
   */
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Lắng nghe sự kiện cuộn của window để quyết định hiển thị nút hay không
   */
  @HostListener('window:scroll')
  onWindowScroll(): void {
    // Chỉ thực hiện trong môi trường trình duyệt
    if (isPlatformBrowser(this.platformId)) {
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      
      // Hiển thị nút khi cuộn quá ngưỡng đã định
      this.showButton = scrollPosition > this.scrollThreshold;
    }
  }

  /**
   * Cuộn lên đầu trang với hiệu ứng mượt mà
   */
  scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Sử dụng scrollTo với hiệu ứng smooth
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }
} 