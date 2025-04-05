import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UniversityService } from '../../services/university.service';

/**
 * Component hiển thị form yêu cầu thêm trường đại học mới
 * Cho phép người dùng đề xuất trường đại học chưa có trong hệ thống
 */
@Component({
  selector: 'app-university-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="university-request-container">
      <h1>Request a New University</h1>
      <p class="description">
        Know a university in South Korea that's not in our database? 
        Help us expand our collection by requesting it to be added.
      </p>
      
      <!-- Thông báo thành công -->
      <div class="success-message" *ngIf="submitted">
        <h2>Thank you for your submission!</h2>
        <p>Your request has been received and will be reviewed by our team.</p>
        <button class="btn" routerLink="/universities">Return to Universities</button>
      </div>
      
      <!-- Form yêu cầu thêm trường đại học -->
      <form [formGroup]="requestForm" (ngSubmit)="onSubmit()" *ngIf="!submitted">
        <div class="form-section">
          <h3>University Information</h3>
          
          <!-- Tên trường bằng tiếng Anh -->
          <div class="form-group">
            <label for="name">Name (English) *</label>
            <input type="text" id="name" formControlName="name">
            <div class="error-message" *ngIf="requestForm.get('name')?.invalid && requestForm.get('name')?.touched">
              University name is required
            </div>
          </div>
          
          <!-- Tên trường bằng tiếng Hàn -->
          <div class="form-group">
            <label for="nameKorean">Name (Korean)</label>
            <input type="text" id="nameKorean" formControlName="nameKorean">
          </div>
          
          <!-- Địa điểm của trường -->
          <div class="form-group">
            <label for="location">Location *</label>
            <input type="text" id="location" formControlName="location">
            <div class="error-message" *ngIf="requestForm.get('location')?.invalid && requestForm.get('location')?.touched">
              Location is required
            </div>
          </div>
          
          <!-- Website của trường -->
          <div class="form-group">
            <label for="website">Website</label>
            <input type="url" id="website" formControlName="website">
            <div class="error-message" *ngIf="requestForm.get('website')?.invalid && requestForm.get('website')?.touched">
              Please enter a valid URL (include http:// or https://)
            </div>
          </div>
          
          <!-- Mô tả về trường -->
          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" formControlName="description" rows="4"></textarea>
          </div>
        </div>
        
        <div class="form-section">
          <h3>Your Information</h3>
          
          <!-- Tên người yêu cầu -->
          <div class="form-group">
            <label for="requesterName">Your Name *</label>
            <input type="text" id="requesterName" formControlName="requesterName">
            <div class="error-message" *ngIf="requestForm.get('requesterName')?.invalid && requestForm.get('requesterName')?.touched">
              Your name is required
            </div>
          </div>
          
          <!-- Email người yêu cầu -->
          <div class="form-group">
            <label for="requesterEmail">Your Email *</label>
            <input type="email" id="requesterEmail" formControlName="requesterEmail">
            <div class="error-message" *ngIf="requestForm.get('requesterEmail')?.invalid && requestForm.get('requesterEmail')?.touched">
              Please enter a valid email address
            </div>
          </div>
          
          <!-- Thông tin bổ sung -->
          <div class="form-group">
            <label for="additionalInfo">Additional Information</label>
            <textarea id="additionalInfo" formControlName="additionalInfo" rows="3" 
              placeholder="Any other details you'd like to share about this university?"></textarea>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn primary" [disabled]="requestForm.invalid">Submit Request</button>
          <button type="button" class="btn" routerLink="/universities">Cancel</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .university-request-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    h1 {
      margin-bottom: 1rem;
      color: #333;
    }
    
    .description {
      margin-bottom: 2rem;
      color: #666;
    }
    
    .form-section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background-color: #f8f8f8;
      border-radius: 8px;
    }
    
    .form-section h3 {
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #ddd;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    input, textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    
    textarea {
      resize: vertical;
    }
    
    .error-message {
      margin-top: 0.5rem;
      color: #d32f2f;
      font-size: 0.875rem;
    }
    
    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      background-color: #eee;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .btn.primary {
      background-color: #3f51b5;
      color: white;
    }
    
    .btn:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
    
    .btn:hover:not(:disabled) {
      background-color: #ddd;
    }
    
    .btn.primary:hover:not(:disabled) {
      background-color: #303f9f;
    }
    
    .success-message {
      padding: 2rem;
      background-color: #e8f5e9;
      border-radius: 8px;
      text-align: center;
      margin-top: 2rem;
    }
    
    .success-message h2 {
      color: #2e7d32;
      margin-bottom: 1rem;
    }
    
    .success-message button {
      margin-top: 1.5rem;
    }
  `]
})
export class UniversityRequestComponent {
  // Form chứa thông tin yêu cầu
  requestForm: FormGroup;
  
  // Biến theo dõi trạng thái đã gửi form hay chưa
  submitted = false;

  /**
   * Constructor - Tiêm các service cần thiết
   * @param fb FormBuilder để tạo và quản lý form đánh giá
   * @param universityService Service cung cấp dữ liệu và phương thức xử lý về đại học
   */
  constructor(
    private fb: FormBuilder,
    private universityService: UniversityService
  ) {
    // Khởi tạo form với các trường và validator
    this.requestForm = this.fb.group({
      name: ['', Validators.required],  // Tên trường (bắt buộc)
      nameKorean: [''],                 // Tên tiếng Hàn (tùy chọn)
      location: ['', Validators.required], // Địa điểm (bắt buộc)
      website: ['', Validators.pattern('https?://.*')], // Website, phải bắt đầu bằng http:// hoặc https://
      description: [''],                // Mô tả (tùy chọn)
      requesterName: ['', Validators.required], // Tên người yêu cầu (bắt buộc)
      requesterEmail: ['', [Validators.required, Validators.email]], // Email người yêu cầu (bắt buộc)
      additionalInfo: ['']              // Thông tin bổ sung (tùy chọn)
    });
  }

  /**
   * Xử lý sự kiện khi người dùng gửi form
   */
  onSubmit(): void {
    if (this.requestForm.valid) {
      // Gửi yêu cầu đến service
      this.universityService.submitUniversityRequest(this.requestForm.value)
        .subscribe({
          next: () => {
            this.submitted = true;  // Đánh dấu đã gửi thành công
            console.log('University request submitted successfully');
          },
          error: (error) => {
            console.error('Error submitting university request:', error);
            // Trong thực tế sẽ hiển thị thông báo lỗi cho người dùng
          }
        });
    } else {
      // Đánh dấu tất cả các trường là đã chạm vào để hiển thị lỗi
      Object.keys(this.requestForm.controls).forEach(key => {
        const control = this.requestForm.get(key);
        control?.markAsTouched();
      });
    }
  }
} 