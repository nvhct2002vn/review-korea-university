import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { University } from '../../models/university.model';
import { UniversityService } from '../../services/university.service';

/**
 * Component hiển thị trang chủ của ứng dụng
 * Hiển thị giới thiệu về trang web và các trường đại học được đánh giá cao nhất
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container">
      <!-- Banner chính -->
      <section class="hero-section">
        <div class="hero-content">
          <h1>Korean Universities Review</h1>
          <p class="hero-description">
            Explore and compare top universities in South Korea through real student reviews. 
            Find the perfect university for your educational journey.
          </p>
          <div class="hero-actions">
            <a routerLink="/universities" class="btn primary">Browse Universities</a>
            <a routerLink="/request" class="btn">Request New University</a>
          </div>
        </div>
      </section>
      
      <!-- Phần các trường đại học được đánh giá cao nhất -->
      <section class="top-rated-section">
        <h2>Top Rated Universities</h2>
        <p>Based on student reviews and ratings</p>
        
        <!-- Hiển thị danh sách các trường đại học đánh giá cao nhất -->
        <div class="top-universities-grid">
          <!-- Loading indicator -->
          <div class="loading-indicator" *ngIf="loading">
            Loading top universities...
          </div>
          
          <!-- Hiển thị khi không có dữ liệu -->
          <div class="no-data" *ngIf="!loading && topUniversities.length === 0">
            No university ratings available yet. Be the first to rate a university!
          </div>
          
          <!-- Vòng lặp qua các trường đại học top -->
          <div class="university-card" *ngFor="let university of topUniversities">
            <div class="card-header">
              <img [src]="university.images[0]" [alt]="university.name" 
                class="university-image" onerror="this.src='https://placehold.co/600x400/3f51b5/ffffff?text=University'">
              <div class="rating-badge">
                <span>{{ university.averageRating }}</span>
                <div class="stars">
                  <span *ngFor="let star of [1, 2, 3, 4, 5]" 
                    [class.filled]="star <= university.averageRating!">★</span>
                </div>
              </div>
            </div>
            <div class="card-content">
              <h3>{{ university.name }}</h3>
              <p class="university-korean-name">{{ university.nameKorean }}</p>
              <div class="university-meta">
                <span class="location">{{ university.location }}</span>
                <span class="type">{{ university.type }}</span>
              </div>
              <p class="university-description">{{ university.description | slice:0:120 }}...</p>
              <a [routerLink]="['/universities', university.id]" class="btn view-btn">View Details</a>
            </div>
          </div>
        </div>
        
        <div class="section-footer">
          <a routerLink="/universities" class="btn-link">View All Universities</a>
        </div>
      </section>
      
      <!-- Phần giới thiệu tính năng -->
      <section class="features-section">
        <h2>Why Use Korean Universities Review?</h2>
        
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">🎓</div>
            <h3>Comprehensive Database</h3>
            <p>Detailed information about universities across South Korea, including admission requirements and tuition fees.</p>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">⭐</div>
            <h3>Real Student Reviews</h3>
            <p>Read authentic experiences and ratings from current and former students to help make informed decisions.</p>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">🔍</div>
            <h3>Easy Comparison</h3>
            <p>Compare different universities based on locations, programs, facilities, and student satisfaction.</p>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">✏️</div>
            <h3>Share Your Experience</h3>
            <p>Contribute to the community by sharing your own university experience through reviews and ratings.</p>
          </div>
        </div>
      </section>
      
      <!-- Phần call to action -->
      <section class="cta-section">
        <h2>Ready to Find Your Ideal University?</h2>
        <p>Start exploring South Korean universities and read reviews from real students.</p>
        <div class="cta-buttons">
          <a routerLink="/universities" class="btn primary">Browse Universities</a>
          <a routerLink="/request" class="btn">Request New University</a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      width: 100%;
    }
    
    /* Hero Section */
    .hero-section {
      padding: 4rem 2rem;
      background: linear-gradient(135deg, #3f51b5 0%, #7986cb 100%);
      color: white;
      text-align: center;
      border-radius: 0 0 10px 10px;
    }
    
    .hero-content {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .hero-content h1 {
      font-size: 3rem;
      margin-bottom: 1.5rem;
    }
    
    .hero-description {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    
    .hero-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }
    
    /* Top Rated Section */
    .top-rated-section {
      padding: 4rem 2rem;
      background-color: #f5f5f5;
      text-align: center;
    }
    
    .top-rated-section h2 {
      margin-bottom: 0.5rem;
      color: #333;
    }
    
    .top-rated-section > p {
      margin-bottom: 2.5rem;
      color: #666;
    }
    
    .top-universities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
      margin: 0 auto;
      max-width: 1200px;
    }
    
    .university-card {
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .university-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    }
    
    .card-header {
      position: relative;
    }
    
    .university-image {
      width: 100%;
      height: 180px;
      object-fit: cover;
    }
    
    .rating-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 0.5rem;
      border-radius: 4px;
      font-weight: bold;
      text-align: center;
    }
    
    .stars {
      font-size: 0.8rem;
      color: #ffd700;
    }
    
    .stars span:not(.filled) {
      color: #ccc;
    }
    
    .card-content {
      padding: 1.5rem;
    }
    
    .card-content h3 {
      margin-bottom: 0.25rem;
      font-size: 1.2rem;
    }
    
    .university-korean-name {
      color: #666;
      margin-bottom: 0.75rem;
      font-size: 0.9rem;
    }
    
    .university-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    
    .location, .type {
      color: #666;
    }
    
    .location::before {
      content: '📍 ';
    }
    
    .type::before {
      content: '🏢 ';
    }
    
    .university-description {
      color: #666;
      margin-bottom: 1.5rem;
      line-height: 1.5;
      font-size: 0.9rem;
    }
    
    .view-btn {
      display: inline-block;
      padding: 0.5rem 1rem;
      background-color: #f5f5f5;
      color: #333;
      text-decoration: none;
      border-radius: 4px;
      transition: background-color 0.3s;
    }
    
    .view-btn:hover {
      background-color: #e0e0e0;
    }
    
    .section-footer {
      margin-top: 2.5rem;
    }
    
    .btn-link {
      color: #3f51b5;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s;
    }
    
    .btn-link:hover {
      color: #303f9f;
      text-decoration: underline;
    }
    
    /* Features Section */
    .features-section {
      padding: 4rem 2rem;
      text-align: center;
    }
    
    .features-section h2 {
      margin-bottom: 3rem;
      color: #333;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .feature-item {
      padding: 1.5rem;
    }
    
    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    
    .feature-item h3 {
      margin-bottom: 1rem;
      color: #333;
    }
    
    .feature-item p {
      color: #666;
      line-height: 1.5;
    }
    
    /* CTA Section */
    .cta-section {
      padding: 4rem 2rem;
      background-color: #f5f5f5;
      text-align: center;
      border-radius: 10px;
      margin: 0 2rem 4rem;
    }
    
    .cta-section h2 {
      margin-bottom: 1rem;
      color: #333;
    }
    
    .cta-section p {
      margin-bottom: 2rem;
      color: #666;
    }
    
    .cta-buttons {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }
    
    /* Button Styles */
    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background-color: #eee;
      color: #333;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 500;
      transition: background-color 0.3s;
    }
    
    .btn.primary {
      background-color: #3f51b5;
      color: white;
    }
    
    .btn:hover {
      background-color: #ddd;
    }
    
    .btn.primary:hover {
      background-color: #303f9f;
    }
    
    /* Loading and No Data */
    .loading-indicator, .no-data {
      grid-column: 1 / -1;
      padding: 2rem;
      text-align: center;
      color: #666;
    }
    
    /* Responsive Adjustments */
    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 2.25rem;
      }
      
      .hero-description {
        font-size: 1rem;
      }
      
      .hero-actions, .cta-buttons {
        flex-direction: column;
        align-items: center;
      }
      
      .features-grid {
        grid-template-columns: 1fr;
      }
      
      .cta-section {
        margin: 0 0 2rem;
        border-radius: 0;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  // Danh sách các trường đại học được đánh giá cao nhất
  topUniversities: University[] = [];
  
  // Biến theo dõi trạng thái đang tải dữ liệu
  loading = true;

  /**
   * Constructor - Tiêm UniversityService để lấy dữ liệu
   * @param universityService Service cung cấp dữ liệu về các trường đại học
   */
  constructor(private universityService: UniversityService) {}

  /**
   * Lifecycle hook, chạy khi component được khởi tạo
   * Tải danh sách các trường đại học được đánh giá cao nhất
   */
  ngOnInit(): void {
    this.loadTopRatedUniversities();
  }

  /**
   * Tải danh sách các trường đại học được đánh giá cao nhất
   */
  loadTopRatedUniversities(): void {
    this.loading = true; // Bắt đầu loading
    
    this.universityService.getTopRatedUniversities(3)
      .subscribe({
        next: (universities) => {
          this.topUniversities = universities;
          this.loading = false; // Kết thúc loading khi dữ liệu đã tải xong
        },
        error: (error) => {
          console.error('Error loading top universities:', error);
          this.loading = false; // Kết thúc loading nếu có lỗi
        }
      });
  }
} 