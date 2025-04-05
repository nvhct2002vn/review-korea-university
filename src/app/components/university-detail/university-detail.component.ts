import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { University, Review } from '../../models/university.model';
import { UniversityService } from '../../services/university.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

/**
 * Component hiển thị thông tin chi tiết của một trường đại học
 * Bao gồm thông tin cơ bản, đánh giá, yêu cầu tuyển sinh và cơ sở vật chất
 */
@Component({
  selector: 'app-university-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule], // Import ReactiveFormsModule để sử dụng form
  templateUrl: './university-detail.component.html',
  styleUrls: ['./university-detail.component.css']
})
export class UniversityDetailComponent implements OnInit {
  // Thông tin chi tiết của trường đại học
  university: University | undefined;
  
  // Danh sách các đánh giá của trường đại học
  reviews: Review[] = [];
  
  // Form để người dùng nhập đánh giá mới
  reviewForm: FormGroup;
  
  // Tab đang được hiển thị (mặc định là overview)
  activeTab: 'overview' | 'reviews' | 'admissions' | 'facilities' = 'overview';
  
  // Chỉ số của hình ảnh đang hiển thị trong gallery
  currentImageIndex = 0;
  
  // Trạng thái hiển thị/ẩn form đánh giá
  showReviewForm = false;
  
  /**
   * Constructor - Tiêm các service cần thiết
   * @param route Service để truy cập thông tin route hiện tại
   * @param universityService Service cung cấp dữ liệu về trường đại học
   * @param fb FormBuilder để tạo và quản lý form đánh giá
   */
  constructor(
    private route: ActivatedRoute,
    private universityService: UniversityService,
    private fb: FormBuilder
  ) {
    // Khởi tạo form đánh giá với các trường và validator
    this.reviewForm = this.fb.group({
      author: ['', Validators.required],                              // Tên người đánh giá (bắt buộc)
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]], // Điểm đánh giá 1-5 (mặc định: 5)
      content: ['', [Validators.required, Validators.minLength(50)]], // Nội dung đánh giá (bắt buộc, ít nhất 50 ký tự)
      programStudied: [''],                                           // Chương trình học (tùy chọn)
      yearOfStudy: [''],                                              // Năm học (tùy chọn)
      isInternational: [false],                                       // Là sinh viên quốc tế? (mặc định: không)
      pros: [''],                                                     // Điểm mạnh (tùy chọn)
      cons: ['']                                                      // Điểm yếu (tùy chọn)
    });
  }
  
  /**
   * Lifecycle hook chạy khi component được khởi tạo
   * Lấy ID trường đại học từ URL và tải dữ liệu
   */
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id')); // Chuyển đổi id từ string sang number
      if (id) {
        this.loadUniversity(id);
        this.loadReviews(id);
      }
    });
  }
  
  /**
   * Tải thông tin chi tiết của trường đại học theo ID
   * @param id ID của trường đại học cần xem chi tiết
   */
  loadUniversity(id: number): void {
    this.universityService.getUniversityById(id).subscribe(
      university => this.university = university
    );
  }
  
  /**
   * Tải danh sách đánh giá của trường đại học
   * @param universityId ID của trường đại học cần lấy đánh giá
   */
  loadReviews(universityId: number): void {
    this.universityService.getReviewsByUniversityId(universityId).subscribe(
      reviews => this.reviews = reviews
    );
  }
  
  /**
   * Chuyển đổi tab đang hiển thị
   * @param tab Tab cần chuyển đến (overview, reviews, admissions, facilities)
   */
  setActiveTab(tab: 'overview' | 'reviews' | 'admissions' | 'facilities'): void {
    this.activeTab = tab;
  }
  
  /**
   * Chuyển đến hình ảnh tiếp theo trong gallery
   * Sử dụng toán tử % để quay lại hình đầu tiên khi đến hình cuối cùng
   */
  nextImage(): void {
    if (this.university && this.university.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.university.images.length;
    }
  }
  
  /**
   * Chuyển đến hình ảnh trước đó trong gallery
   * Sử dụng logic phức tạp hơn để quay lại hình cuối cùng khi đang ở hình đầu tiên
   */
  prevImage(): void {
    if (this.university && this.university.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.university.images.length) % this.university.images.length;
    }
  }
  
  /**
   * Hiển thị/ẩn form đánh giá
   */
  toggleReviewForm(): void {
    this.showReviewForm = !this.showReviewForm;
  }
  
  /**
   * Xử lý khi người dùng gửi đánh giá mới
   * Kiểm tra form hợp lệ và trường đại học đã được tải
   */
  submitReview(): void {
    if (this.reviewForm.valid && this.university) {
      const formValue = this.reviewForm.value;
      
      // Chuyển đổi chuỗi pros và cons phân cách bằng dấu phẩy thành mảng
      const pros = formValue.pros ? formValue.pros.split(',').map((item: string) => item.trim()) : [];
      const cons = formValue.cons ? formValue.cons.split(',').map((item: string) => item.trim()) : [];
      
      // Tạo đối tượng đánh giá mới từ giá trị form
      const review = {
        universityId: this.university.id,
        author: formValue.author,
        rating: formValue.rating,
        content: formValue.content,
        programStudied: formValue.programStudied,
        yearOfStudy: formValue.yearOfStudy,
        isInternational: formValue.isInternational,
        pros: pros,
        cons: cons,
        date: new Date() // Ngày hiện tại
      };
      
      // Gửi đánh giá mới đến service
      this.universityService.addReview(review).subscribe(
        newReview => {
          // Thêm đánh giá mới vào danh sách hiện tại
          this.reviews.push(newReview);
          
          // Đặt lại form về giá trị mặc định
          this.reviewForm.reset({
            rating: 5,
            isInternational: false
          });
          
          // Ẩn form sau khi gửi thành công
          this.showReviewForm = false;
        }
      );
    }
  }
  
  /**
   * Tạo mảng để hiển thị số sao đã được đánh giá
   * @param rating Điểm đánh giá (1-5)
   * @returns Mảng số với độ dài tương ứng số sao đã được đánh giá
   */
  getStarsArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }
  
  /**
   * Tạo mảng để hiển thị số sao trống
   * @param rating Điểm đánh giá (1-5)
   * @returns Mảng số với độ dài tương ứng số sao trống
   */
  getEmptyStarsArray(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }
  
  /**
   * Định dạng số tiền thành chuỗi hiển thị với đơn vị tiền tệ
   * @param amount Số tiền cần định dạng
   * @param currency Đơn vị tiền tệ (VD: "KRW", "USD")
   * @returns Chuỗi đã được định dạng (VD: "₩5,000,000")
   */
  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currency,
      maximumFractionDigits: 0 // Không hiển thị phần thập phân
    }).format(amount);
  }
} 