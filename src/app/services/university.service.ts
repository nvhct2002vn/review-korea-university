import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { University, Review, UniversityRequest } from '../models/university.model';

/**
 * Service xử lý dữ liệu liên quan đến các trường đại học
 * @Injectable đánh dấu class này có thể được tiêm vào các component khác
 * providedIn: 'root' đảm bảo service này được cung cấp ở cấp độ ứng dụng (singleton)
 */
@Injectable({
  providedIn: 'root'
})
export class UniversityService {
  /**
   * Dữ liệu mẫu về các trường đại học
   * Trong môi trường thực tế, dữ liệu này sẽ được lấy từ API
   */
  private universities: University[] = [
    {
      id: 1,
      name: 'Seoul National University',
      nameKorean: '서울대학교',
      location: 'Seoul',
      established: 1946,
      type: 'Public',
      website: 'https://en.snu.ac.kr/',
      description: 'Seoul National University is a national research university located in Seoul, South Korea. It is widely considered to be the most prestigious university in South Korea. Founded in 1946, it is one of the oldest and largest universities in South Korea with 16 colleges and 9 professional schools.',
      ranking: 1,
      studentCount: 27000,
      facultyCount: 2500,
      hasInternationalPrograms: true,
      images: ['https://placehold.co/600x400/3f51b5/ffffff?text=Seoul+National+University', 'https://placehold.co/600x400/3f51b5/ffffff?text=SNU+Campus'],
      departments: ['Liberal Arts', 'Social Sciences', 'Natural Sciences', 'Engineering', 'Medicine', 'Agriculture', 'Fine Arts', 'Education', 'Law', 'Business Administration'],
      admissionRequirements: 'TOPIK Level 4 or higher, Academic transcripts, Statement of purpose, Letters of recommendation',
      tuitionFees: {
        undergraduate: {
          domestic: 5000000,
          international: 7000000
        },
        graduate: {
          domestic: 6000000,
          international: 8000000
        },
        currency: 'KRW'
      },
      campusFacilities: ['Library', 'Sports Center', 'Student Union', 'Dormitories', 'Research Labs'],
      averageRating: 4.7
    },
    {
      id: 2,
      name: 'Korea University',
      nameKorean: '고려대학교',
      location: 'Seoul',
      established: 1905,
      type: 'Private',
      website: 'https://www.korea.edu/',
      description: 'Korea University is a private research university in Seoul, South Korea. It is one of the oldest and most prestigious universities in the country. The university is notable for its emphasis on legal education and research in international law.',
      ranking: 3,
      studentCount: 25000,
      facultyCount: 2200,
      hasInternationalPrograms: true,
      images: ['https://placehold.co/600x400/8e24aa/ffffff?text=Korea+University', 'https://placehold.co/600x400/8e24aa/ffffff?text=KU+Campus'],
      departments: ['Liberal Arts', 'Social Sciences', 'Natural Sciences', 'Engineering', 'Medicine', 'Business Administration', 'Education', 'International Studies'],
      admissionRequirements: 'TOPIK Level 3 or higher, Academic transcripts, Statement of purpose, Letters of recommendation',
      tuitionFees: {
        undergraduate: {
          domestic: 5500000,
          international: 7500000
        },
        graduate: {
          domestic: 6500000,
          international: 8500000
        },
        currency: 'KRW'
      },
      campusFacilities: ['Library', 'Sports Center', 'Student Union', 'Dormitories', 'Research Labs', 'Medical Center'],
      averageRating: 4.5
    },
    {
      id: 3,
      name: 'Yonsei University',
      nameKorean: '연세대학교',
      location: 'Seoul',
      established: 1885,
      type: 'Private',
      website: 'https://www.yonsei.ac.kr/en_sc/',
      description: 'Yonsei University is a private research university in Seoul, South Korea. It is one of the oldest and most prestigious universities in South Korea. The university was established in 1885 and is part of the prestigious SKY universities.',
      ranking: 2,
      studentCount: 26000,
      facultyCount: 2300,
      hasInternationalPrograms: true,
      images: ['https://placehold.co/600x400/00897b/ffffff?text=Yonsei+University', 'https://placehold.co/600x400/00897b/ffffff?text=Yonsei+Campus'],
      departments: ['Liberal Arts', 'Social Sciences', 'Natural Sciences', 'Engineering', 'Medicine', 'Business Administration', 'Theology', 'Music'],
      admissionRequirements: 'TOPIK Level 3 or higher, Academic transcripts, Statement of purpose, Letters of recommendation',
      tuitionFees: {
        undergraduate: {
          domestic: 5500000,
          international: 7500000
        },
        graduate: {
          domestic: 6500000,
          international: 8500000
        },
        currency: 'KRW'
      },
      campusFacilities: ['Library', 'Sports Center', 'Student Union', 'Dormitories', 'Research Labs', 'Medical Center'],
      averageRating: 4.6
    }
  ];

  /**
   * Dữ liệu mẫu về các đánh giá từ sinh viên
   * Trong môi trường thực tế, dữ liệu này sẽ được lấy từ API
   */
  private reviews: Review[] = [
    {
      id: 1,
      universityId: 1,
      author: 'David Kim',
      date: new Date('2023-05-15'),
      rating: 5,
      content: 'My experience at Seoul National University was exceptional. The professors are world-class and the facilities are top-notch. I particularly enjoyed the international atmosphere and the various opportunities for research.',
      programStudied: 'Computer Science',
      yearOfStudy: '2020-2023',
      isInternational: true,
      pros: ['Excellent faculty', 'Great research opportunities', 'Beautiful campus'],
      cons: ['Competitive environment', 'High cost of living in Seoul']
    },
    {
      id: 2,
      universityId: 2,
      author: 'Jessica Park',
      date: new Date('2023-06-20'),
      rating: 4,
      content: 'Korea University provided me with a well-rounded education. The business program is particularly strong, with good connections to industry. Campus life is vibrant with many clubs and activities.',
      programStudied: 'Business Administration',
      yearOfStudy: '2019-2023',
      isInternational: false,
      pros: ['Strong industry connections', 'Active campus life', 'Good career services'],
      cons: ['Large class sizes', 'Some outdated facilities']
    },
    {
      id: 3,
      universityId: 3,
      author: 'Michael Chen',
      date: new Date('2023-04-10'),
      rating: 5,
      content: 'Yonsei University offers an excellent environment for international students. The Global Village program helped me adjust quickly. The curriculum is challenging but rewarding, and there are many opportunities for extracurricular activities.',
      programStudied: 'International Studies',
      yearOfStudy: '2020-2024',
      isInternational: true,
      pros: ['Great support for international students', 'Modern facilities', 'Strong alumni network'],
      cons: ['Heavy workload', 'Expensive dormitories']
    }
  ];

  /**
   * Dữ liệu mẫu về các yêu cầu thêm trường đại học
   * Trong môi trường thực tế, dữ liệu này sẽ được lưu vào API/database
   */
  private universityRequests: UniversityRequest[] = [];

  constructor() { }

  /**
   * Lấy danh sách tất cả các trường đại học
   * @returns Observable chứa mảng các đối tượng University
   */
  getUniversities(): Observable<University[]> {
    return of(this.universities);
  }

  /**
   * Lấy thông tin chi tiết của một trường đại học theo ID
   * @param id ID của trường đại học cần lấy thông tin
   * @returns Observable chứa đối tượng University hoặc undefined nếu không tìm thấy
   */
  getUniversityById(id: number): Observable<University | undefined> {
    const university = this.universities.find(uni => uni.id === id);
    return of(university);
  }

  /**
   * Lấy danh sách đánh giá của một trường đại học cụ thể
   * @param universityId ID của trường đại học cần lấy đánh giá
   * @returns Observable chứa mảng các đối tượng Review của trường đại học đó
   */
  getReviewsByUniversityId(universityId: number): Observable<Review[]> {
    const filteredReviews = this.reviews.filter(review => review.universityId === universityId);
    return of(filteredReviews);
  }

  /**
   * Lấy danh sách tất cả các đánh giá
   * @returns Observable chứa mảng tất cả các đối tượng Review
   */
  getAllReviews(): Observable<Review[]> {
    return of(this.reviews);
  }

  /**
   * Thêm một đánh giá mới
   * @param review Thông tin đánh giá cần thêm (không bao gồm ID vì sẽ được tạo tự động)
   * @returns Observable chứa đối tượng Review đã được thêm vào hệ thống
   */
  addReview(review: Omit<Review, 'id'>): Observable<Review> {
    const newReview: Review = {
      ...review,
      id: this.reviews.length + 1,  // Tạo ID mới bằng cách lấy độ dài mảng + 1
      date: new Date()              // Tạo ngày hiện tại
    };

    this.reviews.push(newReview);   // Thêm đánh giá mới vào mảng

    // Cập nhật đánh giá trung bình cho trường đại học
    this.updateAverageRating(review.universityId);

    return of(newReview);           // Trả về Observable chứa đánh giá mới
  }

  /**
   * Cập nhật điểm đánh giá trung bình của một trường đại học
   * @param universityId ID của trường đại học cần cập nhật điểm
   */
  private updateAverageRating(universityId: number): void {
    // Lọc các đánh giá thuộc về trường đại học cụ thể
    const universityReviews = this.reviews.filter(review => review.universityId === universityId);

    if (universityReviews.length > 0) {
      // Tính điểm trung bình từ các đánh giá
      const totalRating = universityReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / universityReviews.length;

      // Tìm và cập nhật trường đại học với điểm trung bình mới
      const university = this.universities.find(uni => uni.id === universityId);
      if (university) {
        university.averageRating = Number(averageRating.toFixed(1)); // Làm tròn đến 1 số thập phân
      }
    }
  }

  /**
   * Lấy danh sách các trường đại học có đánh giá cao nhất
   * @param limit Số lượng trường đại học cần lấy
   * @returns Observable chứa mảng các đối tượng University đã được sắp xếp theo đánh giá
   */
  getTopRatedUniversities(limit: number = 3): Observable<University[]> {
    return of([...this.universities])
      .pipe(
        map(universities =>
          universities
            .filter(uni => uni.averageRating !== undefined)
            .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
            .slice(0, limit)
        )
      );
  }

  /**
   * Thêm yêu cầu trường đại học mới
   * @param request Đối tượng yêu cầu thêm trường đại học
   * @returns Observable chứa đối tượng UniversityRequest đã được thêm
   */
  submitUniversityRequest(request: Omit<UniversityRequest, 'id' | 'status' | 'submittedDate'>): Observable<UniversityRequest> {
    const newRequest: UniversityRequest = {
      ...request,
      id: this.universityRequests.length + 1,  // Tạo ID mới
      status: 'pending',                       // Đặt trạng thái mặc định là đang chờ xử lý
      submittedDate: new Date()                // Đặt ngày hiện tại
    };

    this.universityRequests.push(newRequest);  // Thêm yêu cầu vào mảng
    return of(newRequest);                     // Trả về Observable chứa yêu cầu mới
  }

  /**
   * Lấy danh sách tất cả các yêu cầu thêm trường đại học
   * @returns Observable chứa mảng các đối tượng UniversityRequest
   */
  getUniversityRequests(): Observable<UniversityRequest[]> {
    return of(this.universityRequests);
  }
}
