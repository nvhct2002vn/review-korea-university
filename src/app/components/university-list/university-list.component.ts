import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { University } from '../../models/university.model';
import { UniversityService } from '../../services/university.service';

/**
 * Component hiển thị danh sách các trường đại học với tính năng lọc và tìm kiếm
 */
@Component({
  selector: 'app-university-list',     // Selector CSS để sử dụng component này
  standalone: true,                    // Component độc lập không cần module
  imports: [CommonModule, RouterLink], // Import các module/directive cần thiết
  templateUrl: './university-list.component.html', // Template HTML của component
  styleUrls: ['./university-list.component.css']   // CSS của component
})
export class UniversityListComponent implements OnInit {
  // Mảng lưu trữ tất cả các trường đại học gốc từ service
  universities: University[] = [];
  
  // Mảng lưu trữ các trường đại học sau khi lọc (sẽ hiển thị lên UI)
  filteredUniversities: University[] = [];
  
  // Biến lưu giá trị lọc theo địa điểm
  locationFilter: string = '';
  
  // Biến lưu giá trị lọc theo loại trường (công lập/tư thục)
  typeFilter: string = '';
  
  // Biến lưu từ khóa tìm kiếm
  searchTerm: string = '';

  /**
   * Constructor - Tiêm UniversityService để lấy dữ liệu
   * @param universityService Service cung cấp dữ liệu về các trường đại học
   */
  constructor(private universityService: UniversityService) { }

  /**
   * Phương thức lifecycle hook, chạy khi component được khởi tạo
   * Gọi hàm loadUniversities để lấy dữ liệu từ service
   */
  ngOnInit(): void {
    this.loadUniversities();
  }

  /**
   * Tải danh sách trường đại học từ service
   * Sau khi tải xong, cập nhật cả mảng gốc và mảng đã lọc
   */
  loadUniversities(): void {
    this.universityService.getUniversities().subscribe(
      (data) => {
        this.universities = data;
        this.filteredUniversities = data;
      }
    );
  }

  /**
   * Áp dụng các bộ lọc đã chọn (địa điểm, loại và tìm kiếm)
   * Kết quả lọc sẽ được lưu vào mảng filteredUniversities
   */
  applyFilters(): void {
    this.filteredUniversities = this.universities.filter(university => {
      // Kiểm tra khớp với bộ lọc địa điểm
      const matchesLocation = this.locationFilter ? university.location === this.locationFilter : true;
      
      // Kiểm tra khớp với bộ lọc loại trường
      const matchesType = this.typeFilter ? university.type === this.typeFilter : true;
      
      // Kiểm tra khớp với từ khóa tìm kiếm (trong tên hoặc mô tả)
      const matchesSearch = this.searchTerm 
        ? university.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
          university.description.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;
      
      // Chỉ trả về true khi khớp với TẤT CẢ các bộ lọc
      return matchesLocation && matchesType && matchesSearch;
    });
  }

  /**
   * Xử lý sự kiện khi người dùng thay đổi bộ lọc địa điểm
   * @param location Giá trị địa điểm đã chọn
   */
  onLocationFilterChange(location: string): void {
    this.locationFilter = location;
    this.applyFilters();
  }

  /**
   * Xử lý sự kiện khi người dùng thay đổi bộ lọc loại trường
   * @param type Giá trị loại đã chọn
   */
  onTypeFilterChange(type: string): void {
    this.typeFilter = type;
    this.applyFilters();
  }

  /**
   * Xử lý sự kiện khi người dùng nhập từ khóa tìm kiếm
   * @param searchTerm Từ khóa tìm kiếm
   */
  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }

  /**
   * Lấy danh sách tất cả các địa điểm duy nhất từ dữ liệu
   * @returns Mảng chứa các giá trị địa điểm duy nhất
   */
  getUniqueLocations(): string[] {
    return [...new Set(this.universities.map(uni => uni.location))];
  }

  /**
   * Lấy danh sách tất cả các loại trường duy nhất từ dữ liệu
   * @returns Mảng chứa các giá trị loại trường duy nhất
   */
  getUniqueTypes(): string[] {
    return [...new Set(this.universities.map(uni => uni.type))];
  }

  /**
   * Đặt lại tất cả các bộ lọc về giá trị mặc định
   * Hiển thị lại toàn bộ danh sách trường đại học
   */
  resetFilters(): void {
    this.locationFilter = '';
    this.typeFilter = '';
    this.searchTerm = '';
    this.filteredUniversities = this.universities;
  }
} 