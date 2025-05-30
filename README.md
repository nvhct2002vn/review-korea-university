# Korean Universities Review

A comprehensive web application for reviewing universities in South Korea. This platform aims to help students, especially international students, make informed decisions about their education choices in Korea.

## Features

- **University Listings**: Browse through detailed information about various universities in South Korea.
- **Search & Filter**: Find universities by location, type, and more.
- **University Details**: Get comprehensive information about each university including programs, tuition fees, admission requirements, and campus facilities.
- **Student Reviews**: Read authentic reviews from current and former students.
- **Review Submission**: Share your own experiences and rate universities.

## Technology Stack

- **Framework**: Angular 19
- **Language**: TypeScript
- **Styling**: CSS
- **API Integration**: RESTful API (planned for future)

## Getting Started

### Prerequisites

- Node.js (v18.18.0 or higher)
- npm (v9.0.0 or higher)
- Angular CLI (v19.2.0 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/review-korea-university.git
   ```

2. Navigate to the project directory:
   ```
   cd review-korea-university
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   ng serve
   ```

5. Open your browser and navigate to `http://localhost:4200`

## Project Structure

- `src/app/components/` - Angular components for different views
- `src/app/services/` - Services for data handling
- `src/app/models/` - TypeScript interfaces and models
- `src/assets/` - Static assets like images

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Data about Korean universities has been compiled from various public sources.
- Special thanks to all contributors and reviewers who have shared their experiences.

# Cấu trúc cơ sở dữ liệu và API cho dự án Review Korea University

Dưới đây là các thông tin chi tiết để tạo database khớp với frontend và danh sách các API cần thiết:

## I. Cấu trúc database

### 1. Bảng `universities`
- `id`: INT (PRIMARY KEY, AUTO_INCREMENT)
- `name`: VARCHAR(255) - Tên tiếng Anh của trường
- `name_korean`: VARCHAR(255) - Tên tiếng Hàn của trường
- `location`: VARCHAR(100) - Địa điểm/thành phố
- `established`: INT - Năm thành lập
- `type`: ENUM('Public', 'Private') - Loại trường (công lập/tư thục)
- `website`: VARCHAR(255) - Website chính thức
- `description`: TEXT - Mô tả chi tiết về trường
- `ranking`: INT - Xếp hạng (nếu có)
- `student_count`: INT - Số lượng sinh viên
- `faculty_count`: INT - Số lượng giảng viên
- `has_international_programs`: BOOLEAN - Có chương trình quốc tế không
- `admission_requirements`: TEXT - Yêu cầu tuyển sinh
- `average_rating`: DECIMAL(3,1) - Điểm đánh giá trung bình
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### 2. Bảng `university_images`
- `id`: INT (PRIMARY KEY, AUTO_INCREMENT)
- `university_id`: INT (FOREIGN KEY -> universities.id)
- `image_url`: VARCHAR(255) - Đường dẫn đến hình ảnh
- `display_order`: INT - Thứ tự hiển thị
- `created_at`: TIMESTAMP

### 3. Bảng `university_departments`
- `id`: INT (PRIMARY KEY, AUTO_INCREMENT)
- `university_id`: INT (FOREIGN KEY -> universities.id)
- `name`: VARCHAR(255) - Tên khoa/ngành học
- `created_at`: TIMESTAMP

### 4. Bảng `tuition_fees`
- `id`: INT (PRIMARY KEY, AUTO_INCREMENT)
- `university_id`: INT (FOREIGN KEY -> universities.id)
- `undergraduate_domestic`: DECIMAL(12,2) - Học phí đại học cho sinh viên trong nước
- `undergraduate_international`: DECIMAL(12,2) - Học phí đại học cho sinh viên quốc tế
- `graduate_domestic`: DECIMAL(12,2) - Học phí sau đại học cho sinh viên trong nước
- `graduate_international`: DECIMAL(12,2) - Học phí sau đại học cho sinh viên quốc tế
- `currency`: VARCHAR(10) - Đơn vị tiền tệ (VD: "KRW", "USD")
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### 5. Bảng `campus_facilities`
- `id`: INT (PRIMARY KEY, AUTO_INCREMENT)
- `university_id`: INT (FOREIGN KEY -> universities.id)
- `name`: VARCHAR(255) - Tên cơ sở vật chất
- `created_at`: TIMESTAMP

### 6. Bảng `reviews`
- `id`: INT (PRIMARY KEY, AUTO_INCREMENT)
- `university_id`: INT (FOREIGN KEY -> universities.id)
- `author`: VARCHAR(100) - Tên người đánh giá
- `rating`: INT - Số điểm đánh giá (1-5)
- `content`: TEXT - Nội dung đánh giá
- `program_studied`: VARCHAR(255) - Chương trình học
- `year_of_study`: VARCHAR(50) - Năm học
- `is_international`: BOOLEAN - Là sinh viên quốc tế không
- `date`: TIMESTAMP - Ngày đánh giá
- `created_at`: TIMESTAMP

### 7. Bảng `review_pros`
- `id`: INT (PRIMARY KEY, AUTO_INCREMENT)
- `review_id`: INT (FOREIGN KEY -> reviews.id)
- `content`: VARCHAR(255) - Nội dung điểm mạnh

### 8. Bảng `review_cons`
- `id`: INT (PRIMARY KEY, AUTO_INCREMENT)
- `review_id`: INT (FOREIGN KEY -> reviews.id)
- `content`: VARCHAR(255) - Nội dung điểm yếu

### 9. Bảng `university_requests`
- `id`: INT (PRIMARY KEY, AUTO_INCREMENT)
- `name`: VARCHAR(255) - Tên tiếng Anh
- `name_korean`: VARCHAR(255) - Tên tiếng Hàn
- `location`: VARCHAR(100) - Địa điểm
- `website`: VARCHAR(255) - Website
- `description`: TEXT - Mô tả
- `requester_name`: VARCHAR(100) - Tên người yêu cầu
- `requester_email`: VARCHAR(100) - Email liên hệ
- `additional_info`: TEXT - Thông tin bổ sung
- `status`: ENUM('pending', 'approved', 'rejected') - Trạng thái
- `submitted_date`: TIMESTAMP - Ngày gửi
- `processed_date`: TIMESTAMP - Ngày xử lý (NULL nếu chưa xử lý)
- `created_at`: TIMESTAMP

## II. API Endpoints Cần Thiết

### Universities

1. **GET /api/universities**
   - Mô tả: Lấy danh sách tất cả trường đại học
   - Tham số query:
     - `location`: Lọc theo địa điểm
     - `type`: Lọc theo loại trường
     - `search`: Tìm kiếm theo tên/mô tả
     - `page`: Trang hiện tại
     - `limit`: Số lượng kết quả trên một trang
   - Response: 
     ```json
     {
       "data": [
         {
           "id": 1,
           "name": "Seoul National University",
           "nameKorean": "서울대학교",
           "location": "Seoul",
           "established": 1946,
           "type": "Public",
           "images": ["https://example.com/image1.jpg"],
           "averageRating": 4.7
         },
         // ...
       ],
       "total": 20,
       "page": 1,
       "limit": 10
     }
     ```

2. **GET /api/universities/top**
   - Mô tả: Lấy danh sách trường đại học xếp hạng cao nhất
   - Tham số query:
     - `limit`: Số lượng kết quả (mặc định: 3)
   - Response: Danh sách trường đại học được sắp xếp theo đánh giá

3. **GET /api/universities/:id**
   - Mô tả: Lấy thông tin chi tiết về một trường đại học
   - Response: Thông tin đầy đủ của trường đại học, bao gồm:
     - Thông tin cơ bản
     - Danh sách hình ảnh
     - Danh sách khoa
     - Thông tin học phí
     - Danh sách cơ sở vật chất

### Reviews

4. **GET /api/universities/:id/reviews**
   - Mô tả: Lấy danh sách đánh giá của một trường đại học
   - Tham số query:
     - `page`: Trang hiện tại
     - `limit`: Số lượng kết quả trên một trang
   - Response: Danh sách đánh giá, bao gồm thông tin người đánh giá, điểm và nội dung

5. **POST /api/reviews**
   - Mô tả: Thêm đánh giá mới
   - Request body:
     ```json
     {
       "universityId": 1,
       "author": "Nguyen Van A",
       "rating": 5,
       "content": "Great university with excellent programs...",
       "programStudied": "Computer Science",
       "yearOfStudy": "2020-2023",
       "isInternational": false,
       "pros": ["Great facilities", "Excellent professors"],
       "cons": ["Expensive tuition", "Competitive admission"]
     }
     ```
   - Response: Thông tin đánh giá vừa được tạo

### University Requests

6. **POST /api/university-requests**
   - Mô tả: Gửi yêu cầu thêm trường đại học mới
   - Request body:
     ```json
     {
       "name": "New University",
       "nameKorean": "새로운 대학교",
       "location": "Busan",
       "website": "https://newuniversity.edu",
       "description": "A new university in Busan...",
       "requesterName": "Nguyen Van B",
       "requesterEmail": "nguyenvanb@example.com",
       "additionalInfo": "This university specializes in..."
     }
     ```
   - Response: Thông tin yêu cầu vừa được tạo

7. **GET /api/university-requests** (Admin API)
   - Mô tả: Lấy danh sách yêu cầu thêm trường đại học (cần xác thực admin)
   - Tham số query:
     - `status`: Lọc theo trạng thái (pending/approved/rejected)
     - `page`: Trang hiện tại
     - `limit`: Số lượng kết quả trên một trang
   - Response: Danh sách yêu cầu thêm trường đại học

8. **PUT /api/university-requests/:id/status** (Admin API)
   - Mô tả: Cập nhật trạng thái yêu cầu thêm trường đại học
   - Request body:
     ```json
     {
       "status": "approved"
     }
     ```
   - Response: Thông tin yêu cầu sau khi cập nhật

## III. Các chức năng backend cần triển khai

1. **Hệ thống tính toán điểm đánh giá trung bình**
   - Cập nhật `average_rating` trong bảng `universities` mỗi khi có đánh giá mới

2. **Hệ thống lọc và tìm kiếm**
   - Xử lý lọc theo địa điểm, loại trường
   - Tìm kiếm theo tên hoặc mô tả

3. **Xử lý hình ảnh**
   - Upload và lưu trữ hình ảnh
   - Tạo URL ảnh thumbnail hiệu quả

4. **Phân trang và giới hạn kết quả**
   - Áp dụng cho các API trả về danh sách dài

5. **Bảo mật**
   - Xác thực cho API admin
   - Xác thực dữ liệu đầu vào để tránh SQL injection

## IV. Lưu ý khi triển khai backend

1. **Thống nhất chuẩn đặt tên API**
   - Sử dụng kebab-case cho URL (`/api/university-requests`)
   - Sử dụng camelCase cho tham số và thuộc tính JSON

2. **Xử lý lỗi**
   - Trả về mã lỗi HTTP phù hợp (400, 404, 500, v.v.)
   - Cung cấp thông báo lỗi rõ ràng

3. **CORS (Cross-Origin Resource Sharing)**
   - Cấu hình CORS cho phép frontend gọi API

4. **Tối ưu hóa hiệu suất**
   - Sử dụng index cho các trường thường xuyên tìm kiếm
   - Tối ưu hóa câu truy vấn JOIN
   - Cân nhắc sử dụng caching cho các dữ liệu ít thay đổi

5. **Ghi log**
   - Ghi log các thao tác quan trọng (thêm đánh giá, yêu cầu thêm trường)
   - Theo dõi lỗi để khắc phục

Với cấu trúc database và danh sách API này, bạn có thể triển khai backend hoàn chỉnh để hỗ trợ các chức năng trên frontend của trang web Review Korea University.

# Review Korea University

Hệ thống đánh giá trường đại học Hàn Quốc.

## Hướng dẫn khởi chạy

### Phát triển không có SSR (Server-Side Rendering)

```
npm run start
```

Hoặc

```
ng serve --configuration=non-ssr
```

### Phát triển với SSR (Server-Side Rendering)

```
npm run start:ssr
```

Hoặc

```
ng serve
```

### Build ứng dụng

#### Build không có SSR

```
npm run build
```

#### Build với SSR

```
npm run build:ssr
```

## Giải quyết vấn đề SSR

Nếu bạn gặp lỗi `TypeError: ɵgetOrCreateAngularServerApp is not a function` khi chạy ứng dụng với SSR, đây là vấn đề đã biết trong một số phiên bản Angular 19.2.x.

Dự án này đã được cấu hình với hai chế độ chạy:
1. Chế độ không có SSR (mặc định) - nhanh hơn cho phát triển
2. Chế độ có SSR - giống với môi trường sản xuất

### Lưu ý về PowerShell

Nếu bạn gặp lỗi về việc không thể chạy script trong PowerShell, bạn có thể cần phải điều chỉnh chính sách thực thi:

```
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Hoặc sử dụng Command Prompt (cmd) thay vì PowerShell.

