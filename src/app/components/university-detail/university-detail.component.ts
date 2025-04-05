import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { University, Review } from '../../models/university.model';
import { UniversityService } from '../../services/university.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap, catchError, finalize } from 'rxjs/operators';
import { EMPTY, Observable, of } from 'rxjs';

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
  university: University | null = null;
  
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

  // Trạng thái loading
  isLoading = true;
  isLoadingReviews = true;
  isSubmittingReview = false;
  
  // Trạng thái form
  submitted = false;
  submitSuccess = false;
  
  // Thông báo lỗi
  errorMessage: string | null = null;
  reviewsErrorMessage: string | null = null;
  submitErrorMessage: string | null = null;
  
  // Properties for image handling
  gallery: string[] = [];
  currentImage: string = '';
  
  // Xử lý hiển thị hình ảnh cho university
  private handleImageDisplay(): void {
    if (this.university) {
      // Log để debug
      console.log('Processing images for university:', this.university.name);
      console.log('Images data:', this.university.images);
      console.log('ImageUrl data:', this.university.imageUrl);

      // Đảm bảo có mảng images
      if (!this.university.images) {
        this.university.images = [];
      }

      // Nếu có ít nhất một hình ảnh trong mảng images
      if (this.university.images.length > 0) {
        // Thiết lập current image là hình ảnh đầu tiên nếu chưa có
        if (!this.currentImage) {
          this.currentImage = this.university.images[0];
        }
        
        // Đảm bảo gallery có sẵn tất cả các hình ảnh
        this.gallery = [...this.university.images];
        console.log('Gallery populated with images:', this.gallery);
      } 
      // Nếu không có images nhưng có imageUrl riêng
      else if (this.university.imageUrl) {
        this.currentImage = this.university.imageUrl;
        this.gallery = [this.university.imageUrl];
        console.log('Gallery populated with imageUrl:', this.gallery);
      } 
      // Trường hợp không có hình ảnh nào
      else {
        this.currentImage = 'assets/images/university-placeholder.jpg';
        this.gallery = [this.currentImage];
        console.log('No images found, using placeholder');
      }
      
      // Log tình trạng sau khi xử lý
      console.log('Final gallery state:', this.gallery);
      console.log('Current image set to:', this.currentImage);
    }
  }
  
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
      author: ['', [Validators.required, Validators.minLength(3)]],
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      content: ['', [Validators.required, Validators.minLength(20)]],
      programStudied: [''],
      yearOfStudy: [''],
      isInternational: [false],
      pros: [''],
      cons: ['']
    });
  }
  
  /**
   * Phương thức lifecycle hook chạy khi component được khởi tạo
   * Lấy ID trường đại học từ URL và tải dữ liệu
   */
  ngOnInit(): void {
    this.isLoading = true;
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.universityService.getUniversityById(parseInt(id, 10)).subscribe({
        next: (university) => {
          this.university = university;
          this.isLoading = false;
          this.errorMessage = null;
          this.loadReviews(university.id);
          this.handleImageDisplay(); // Call the image handler
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err?.message || 'Failed to load university details. Please try again.';
          console.error('Error loading university:', err);
        }
      });
    } else {
      this.isLoading = false;
      this.errorMessage = 'Invalid university ID';
    }
  }
  
  /**
   * Tải thông tin chi tiết của trường đại học theo ID trong route
   */
  loadUniversityData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.route.paramMap.pipe(
      switchMap(params => {
        const idParam = params.get('id');
        if (!idParam) {
          this.errorMessage = 'Invalid university ID';
          return EMPTY;
        }
        
        const id = Number(idParam);
        if (isNaN(id) || id <= 0) {
          this.errorMessage = this.getFriendlyErrorMessage('invalid_id');
          return EMPTY;
        }
        
        return this.universityService.getUniversityById(id).pipe(
          catchError(error => {
            console.error(`Error fetching university with id ${id}:`, error);
            
            if (error?.status === 403) {
              this.errorMessage = this.getFriendlyErrorMessage('forbidden');
            } else if (error?.status === 404) {
              this.errorMessage = this.getFriendlyErrorMessage('not_found');
            } else if (error?.message) {
              // Lấy thông báo lỗi từ Error object được throw trong service
              this.errorMessage = error.message;
            } else {
              this.errorMessage = this.getFriendlyErrorMessage('generic');
            }
            
            return EMPTY;
          })
        );
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (university) => {
        this.university = university;
        if (university) {
          // Tải đánh giá cho trường đại học
          this.loadReviews(university.id);
          
          // Đặt tiêu đề trang
          document.title = `${university.name} - Korean Universities Review`;
        }
      },
      error: (err) => {
        // Xử lý lỗi nếu có thêm (hiếm khi xảy ra vì đã xử lý trong catchError)
        console.error('Unexpected error:', err);
        if (!this.errorMessage) {
          this.errorMessage = this.getFriendlyErrorMessage('unexpected');
        }
      }
    });
  }
  
  /**
   * Trả về thông báo lỗi thân thiện với người dùng dựa trên loại lỗi
   * @param errorType Loại lỗi cần thông báo
   * @returns Thông báo lỗi thân thiện với người dùng
   */
  getFriendlyErrorMessage(errorType: string): string {
    switch (errorType) {
      case 'invalid_id':
        return 'The university ID in the URL is not valid. Please check the address and try again.';
      case 'forbidden':
        return 'You do not have permission to access this university information. This may be temporarily restricted or require authentication.';
      case 'not_found':
        return 'We couldn\'t find the university you\'re looking for. It may have been removed or the ID is incorrect.';
      case 'network':
        return 'Network connection issue. Please check your internet connection and try again.';
      case 'timeout':
        return 'The request took too long to complete. Our servers might be experiencing high traffic. Please try again later.';
      case 'unexpected':
        return 'An unexpected error occurred. Our team has been notified and is working to fix it.';
      case 'generic':
      default:
        return 'We encountered a problem loading the university information. Please try again later.';
    }
  }
  
  /**
   * Tải danh sách đánh giá của trường đại học
   * @param universityId ID của trường đại học cần lấy đánh giá
   */
  loadReviews(universityId: number): void {
    this.isLoadingReviews = true;
    this.reviewsErrorMessage = null;
    
    this.universityService.getReviewsByUniversityId(universityId)
      .pipe(
        catchError(error => {
          console.error(`Error fetching reviews for university ${universityId}:`, error);
          this.reviewsErrorMessage = 'Failed to load reviews. Please try again later.';
          return of([]);
        }),
        finalize(() => {
          this.isLoadingReviews = false;
        })
      )
      .subscribe(reviews => {
        this.reviews = reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });
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
   */
  nextImage(): void {
    if (this.gallery.length <= 1) return;
    
    const currentIndex = this.gallery.indexOf(this.currentImage);
    const nextIndex = (currentIndex + 1) % this.gallery.length;
    this.currentImage = this.gallery[nextIndex];
    console.log(`Changed to next image: ${nextIndex + 1}/${this.gallery.length}`);
  }
  
  /**
   * Quay lại hình ảnh trước đó trong gallery
   */
  prevImage(): void {
    if (this.gallery.length <= 1) return;
    
    const currentIndex = this.gallery.indexOf(this.currentImage);
    const prevIndex = (currentIndex - 1 + this.gallery.length) % this.gallery.length;
    this.currentImage = this.gallery[prevIndex];
    console.log(`Changed to previous image: ${prevIndex + 1}/${this.gallery.length}`);
  }
  
  /**
   * Chọn một hình ảnh cụ thể từ gallery
   */
  selectImage(index: number): void {
    if (index >= 0 && index < this.gallery.length) {
      this.currentImage = this.gallery[index];
    }
  }
  
  /**
   * Hiển thị/ẩn form đánh giá
   */
  toggleReviewForm(): void {
    this.showReviewForm = !this.showReviewForm;
    if (this.showReviewForm) {
      this.submitErrorMessage = null;
    }
  }
  
  /**
   * Xử lý khi người dùng gửi đánh giá mới
   * Kiểm tra form hợp lệ và trường đại học đã được tải
   */
  submitReview(): void {
    this.submitted = true;
    
    // Kiểm tra form hợp lệ
    if (this.reviewForm.invalid) {
      return;
    }
    
    if (!this.university) {
      console.error('Cannot submit review: University data not loaded');
      this.submitErrorMessage = 'Error: University data not loaded. Please refresh the page and try again.';
      return;
    }
    
    // Chuẩn bị dữ liệu đánh giá
    const formValue = this.reviewForm.value;
    
    // Chuyển đổi chuỗi ngăn cách bằng dấu phẩy thành mảng cho pros
    let prosArray: string[] = [];
    if (typeof formValue.pros === 'string' && formValue.pros.trim()) {
      prosArray = formValue.pros.split(',').map((item: string) => item.trim()).filter(Boolean);
    } else if (Array.isArray(formValue.pros)) {
      prosArray = formValue.pros;
    }
    
    // Chuyển đổi chuỗi ngăn cách bằng dấu phẩy thành mảng cho cons
    let consArray: string[] = [];
    if (typeof formValue.cons === 'string' && formValue.cons.trim()) {
      consArray = formValue.cons.split(',').map((item: string) => item.trim()).filter(Boolean);
    } else if (Array.isArray(formValue.cons)) {
      consArray = formValue.cons;
    }
    
    const reviewData: Review = {
      id: 0, // Sẽ được server tạo
      universityId: this.university.id,
      author: formValue.author,
      date: new Date(),
      rating: formValue.rating,
      content: formValue.content,
      programStudied: formValue.programStudied,
      yearOfStudy: formValue.yearOfStudy,
      isInternational: formValue.isInternational,
      pros: prosArray,
      cons: consArray
    };
    
    // Cập nhật trạng thái đang gửi đánh giá
    this.isSubmittingReview = true;
    this.submitErrorMessage = null;
    
    // Gửi đánh giá
    this.universityService.addReview(reviewData)
      .pipe(
        finalize(() => {
          this.isSubmittingReview = false;
        })
      )
      .subscribe({
        next: (newReview) => {
          this.submitSuccess = true;
          this.reviews = [newReview, ...this.reviews];
          this.reviewForm.reset({
            rating: 5,
            isInternational: false
          });
          this.submitted = false;
          this.showReviewForm = false; // Tự động đóng form sau khi gửi thành công
          
          // Cập nhật điểm đánh giá trung bình
          if (this.university) {
            const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
            this.university.averageRating = Number((totalRating / this.reviews.length).toFixed(1));
            this.university.reviewCount = this.reviews.length;
          }
          
          // Tự động chuyển đến tab đánh giá
          this.setActiveTab('reviews');
          
          // Ẩn thông báo thành công sau 5 giây
          setTimeout(() => {
            this.submitSuccess = false;
          }, 5000);
        },
        error: (error) => {
          console.error('Error submitting review:', error);
          this.submitErrorMessage = 'Failed to submit review. Please try again later.';
        }
      });
  }
  
  /**
   * Tạo mảng biểu diễn rating bằng sao đầy
   * @param rating Số điểm đánh giá (1-5)
   * @returns Mảng số nguyên để hiển thị sao đầy
   */
  getStarsArray(rating: number): number[] {
    const fullStars = Math.floor(rating);
    return Array(fullStars).fill(1);
  }
  
  /**
   * Tạo mảng biểu diễn phần sao còn thiếu
   * @param rating Số điểm đánh giá (1-5)
   * @returns Mảng số nguyên để hiển thị sao trống
   */
  getEmptyStarsArray(rating: number): number[] {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return Array(emptyStars).fill(0);
  }
  
  /**
   * Định dạng số tiền học phí với đơn vị tiền tệ
   * @param amount Số tiền cần định dạng
   * @param currency Đơn vị tiền tệ
   * @returns Chuỗi đã định dạng (ví dụ: ₩5,000,000)
   */
  formatCurrency(amount: number, currency: string): string {
    if (!amount) return 'N/A';
    
    const formatter = new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency || 'KRW',
      maximumFractionDigits: 0
    });
    
    return formatter.format(amount);
  }
  
  /**
   * Tải lại trang khi gặp lỗi
   */
  retry(): void {
    // Reset error states
    this.errorMessage = null;
    this.submitErrorMessage = null;
    this.reviewsErrorMessage = null;
    
    // Display a temporary message
    this.isLoading = true;
    
    // Add a short delay to show the loading state
    setTimeout(() => {
      // Xóa cache trong service để đảm bảo lấy dữ liệu mới
      this.universityService.clearCache();
      this.loadUniversityData();
    }, 800);
  }
  
  /**
   * Tải lại đánh giá khi gặp lỗi
   */
  retryLoadingReviews(): void {
    if (this.university) {
      this.loadReviews(this.university.id);
    }
  }
} 