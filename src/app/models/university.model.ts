/**
 * Định nghĩa interface University mô tả dữ liệu của một trường đại học
 * Interface này chứa tất cả thông tin cần thiết để hiển thị thông tin đại học
 */
export interface University {
  id: number;                         // ID duy nhất của trường đại học
  name: string;                       // Tên tiếng Anh của trường đại học
  nameKorean?: string;                // Tên tiếng Hàn (tùy chọn - dấu ? nghĩa là có thể không có)
  location: string;                   // Vị trí (thành phố) của trường
  established: number;                // Năm thành lập
  type: 'Public' | 'Private';         // Loại trường: Công lập hoặc Tư thục
  website: string;                    // Địa chỉ website chính thức
  description: string;                // Mô tả về trường đại học
  ranking?: number;                   // Thứ hạng (tùy chọn)
  studentCount?: number;              // Số lượng sinh viên (tùy chọn)
  facultyCount?: number;              // Số lượng giảng viên (tùy chọn)
  hasInternationalPrograms: boolean;  // Có chương trình quốc tế hay không
  images: string[];                   // Mảng đường dẫn đến hình ảnh của trường
  departments: string[];              // Mảng tên các khoa/ngành học
  admissionRequirements?: string;     // Yêu cầu tuyển sinh (tùy chọn)
  tuitionFees?: TuitionFees;          // Thông tin học phí (tùy chọn, sử dụng interface TuitionFees)
  campusFacilities?: string[];        // Mảng các cơ sở vật chất trong khuôn viên (tùy chọn)
  averageRating?: number;             // Điểm đánh giá trung bình (tùy chọn)
}

/**
 * Định nghĩa interface TuitionFees mô tả cấu trúc học phí
 * Phân chia theo bậc học và đối tượng học (trong nước/quốc tế)
 */
export interface TuitionFees {
  undergraduate?: {                   // Học phí bậc đại học (tùy chọn)
    domestic: number;                 // Dành cho sinh viên trong nước
    international: number;            // Dành cho sinh viên quốc tế
  };
  graduate?: {                        // Học phí bậc sau đại học (tùy chọn)
    domestic: number;                 // Dành cho sinh viên trong nước
    international: number;            // Dành cho sinh viên quốc tế
  };
  currency: string;                   // Đơn vị tiền tệ (VD: "KRW", "USD")
}

/**
 * Định nghĩa interface Review mô tả đánh giá của sinh viên về trường đại học
 * Chứa thông tin về người đánh giá và nội dung đánh giá
 */
export interface Review {
  id: number;                         // ID duy nhất của bài đánh giá
  universityId: number;               // ID của trường đại học được đánh giá
  author: string;                     // Tên người đánh giá
  date: Date;                         // Ngày đánh giá
  rating: number;                     // Điểm đánh giá (thường từ 1-5)
  content: string;                    // Nội dung đánh giá chi tiết
  programStudied?: string;            // Chương trình/ngành học của người đánh giá (tùy chọn)
  yearOfStudy?: string;               // Năm học tại trường (tùy chọn)
  isInternational?: boolean;          // Có phải sinh viên quốc tế không (tùy chọn)
  pros?: string[];                    // Mảng các điểm mạnh (tùy chọn)
  cons?: string[];                    // Mảng các điểm yếu (tùy chọn)
}

/**
 * Định nghĩa interface UniversityRequest mô tả yêu cầu thêm trường đại học mới
 * Được sử dụng khi người dùng muốn đề xuất một trường đại học chưa có trong hệ thống
 */
export interface UniversityRequest {
  id?: number;                        // ID duy nhất của yêu cầu (sẽ được tạo bởi backend)
  name: string;                       // Tên tiếng Anh của trường đại học
  nameKorean?: string;                // Tên tiếng Hàn (tùy chọn)
  location: string;                   // Vị trí (thành phố) của trường
  website?: string;                   // Địa chỉ website chính thức (tùy chọn)
  description?: string;               // Mô tả về trường đại học (tùy chọn)
  requesterName: string;              // Tên người yêu cầu
  requesterEmail: string;             // Email của người yêu cầu để có thể liên hệ
  additionalInfo?: string;            // Thông tin bổ sung (tùy chọn)
  status?: 'pending' | 'approved' | 'rejected'; // Trạng thái của yêu cầu (sẽ được xử lý bởi backend)
  submittedDate?: Date;               // Ngày gửi yêu cầu (sẽ được tạo bởi backend)
} 