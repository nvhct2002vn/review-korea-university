import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { University } from '../../models/university.model';
import { UniversityService } from '../../services/university.service';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { Subscription, catchError, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { PaginatorModule } from 'primeng/paginator';

// Define PaginatorState interface locally to avoid import error
interface PaginatorState {
  page?: number;
  first?: number;
  rows?: number;
  pageCount?: number;
}

@Component({
  selector: 'app-university-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    PaginatorModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  templateUrl: './university-list.component.html',
  styleUrls: ['./university-list.component.css']
})
export class UniversityListComponent implements OnInit, OnDestroy {
  // Data
  universities: University[] = [];
  filteredUniversities: University[] = [];
  paginatedUniversities: University[] = [];

  // Search and filter
  searchQuery: string = '';
  selectedLocation: string = '';
  selectedType: string = '';

  // Filter dropdowns
  locations: string[] = [];
  universityTypes: string[] = [];

  // Sorting
  sortBy: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  first: number = 0; // PrimeNG pagination first record index
  itemsPerPage: number = 0; // 4 items per row, 5 rows = 20 items
  rowsPerPageOptions: number[] = [9999];
  totalRecords: number = 0;

  // UI states
  loading: boolean = true;
  errorMessage: string = '';

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private universityService: UniversityService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Đảm bảo giá trị mặc định cho itemsPerPage
    this.itemsPerPage = 9999;
  }

  ngOnInit(): void {
    this.setupSearchAndFilterSubscriptions();
    this.loadUniversities();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  setupSearchAndFilterSubscriptions(): void {
    // Monitor URL query params
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        this.searchQuery = params['q'] || '';
        this.selectedLocation = params['location'] || '';
        this.selectedType = params['type'] || '';

        if (this.universities.length > 0) {
          this.filterUniversities();
        }
      })
    );
  }

  // Handle PrimeNG paginator events
  onPageChange(event: any): void {
    console.log('Page change event:', event);

    // Lưu giá trị rows trước
    if (event.rows && event.rows !== this.itemsPerPage) {
      console.log(`Rows changed from ${this.itemsPerPage} to ${event.rows}`);
      this.itemsPerPage = event.rows;
      this.first = 0; // Reset về trang đầu tiên khi thay đổi số lượng mục trên trang
    }

    // Xử lý thay đổi trang
    if (event.page !== undefined) {
      console.log(`Page changed to ${event.page}`);
      this.first = event.page * this.itemsPerPage;
    } else if (event.first !== undefined) {
      console.log(`First changed to ${event.first}`);
      this.first = event.first;
    }

    // Đảm bảo itemsPerPage không bằng 0
    if (this.itemsPerPage <= 0) {
      this.itemsPerPage = 9999;
    }

    // Gọi lại API khi chuyển trang hoặc thay đổi số lượng mục trên trang
    const pageIndex = Math.max(0, Math.floor(this.first / this.itemsPerPage));
    console.log(`Loading page ${pageIndex} with itemsPerPage=${this.itemsPerPage}`);
    this.loadUniversitiesPage(pageIndex);
  }

  // Phương thức tải một trang đại học cụ thể
  loadUniversitiesPage(pageIndex: number): void {
    this.loading = true;
    this.errorMessage = '';
    console.log(`Đang tải dữ liệu cho trang ${pageIndex}, kích thước trang ${this.itemsPerPage}`);

    // Đảm bảo giá trị mặc định cho phân trang
    if (this.itemsPerPage <= 0) {
      this.itemsPerPage = 9999;
    }

    // Đảm bảo pageIndex không phải NaN
    if (isNaN(pageIndex)) {
      pageIndex = 0;
    }

    this.subscriptions.push(
      this.universityService.getUniversities(
        pageIndex,
        this.itemsPerPage,
        this.searchQuery,
        this.selectedLocation,
        this.selectedType
      )
        .pipe(
          catchError(error => {
            console.error('Error loading universities page:', error);
            this.errorMessage = 'Không thể tải dữ liệu đại học. Vui lòng thử lại sau.';
            return of([]);
          }),
          finalize(() => {
            this.loading = false;
            console.log('Đã hoàn thành tải dữ liệu');
          })
        )
        .subscribe(response => {
          console.log('API Response:', response);

          if (response && response.content && Array.isArray(response.content)) {
            this.paginatedUniversities = response.content;
            this.totalRecords = response.totalElements || 0;

            console.log(`Loaded page ${pageIndex} with ${this.paginatedUniversities.length} universities`);
            console.log('Pagination info:', {
              page: response.page,
              size: response.size,
              totalElements: response.totalElements,
              totalPages: response.totalPages
            });
            console.log('First 3 universities:', this.paginatedUniversities.slice(0, 3));
          } else if (Array.isArray(response)) {
            this.paginatedUniversities = response;
            this.totalRecords = response.length;

            console.log(`Loaded ${this.paginatedUniversities.length} universities as array`);
            console.log('First 3 universities:', this.paginatedUniversities.slice(0, 3));
          } else {
            console.error('Unexpected response format:', response);
            this.errorMessage = 'Dữ liệu trả về không đúng định dạng';
          }
        })
    );
  }

  loadUniversities(): void {
    this.loading = true;
    this.errorMessage = '';

    console.log('Starting to load universities...');

    // Đảm bảo giá trị mặc định cho phân trang
    if (this.itemsPerPage <= 0) {
      this.itemsPerPage = 9999;
    }

    // Tính toán tham số phân trang cho API
    const pageIndex = Math.floor(this.first / this.itemsPerPage) || 0;

    this.subscriptions.push(
      this.universityService.getUniversities(
        pageIndex,
        this.itemsPerPage,
        this.searchQuery,
        this.selectedLocation,
        this.selectedType
      )
        .pipe(
          catchError(error => {
            console.error('Error loading universities:', error);
            this.errorMessage = 'Failed to load universities. Please try again later.';

            // Sử dụng dữ liệu mẫu fallback
            console.log('Using sample data as fallback');
            return this.universityService.getSampleUniversities();
          }),
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe(response => {
          console.log('API Response:', response);

          // Kiểm tra nếu response có định dạng phân trang
          if (response && response.content && Array.isArray(response.content)) {
            this.universities = response.content;
            this.totalRecords = response.totalElements || 0;
            this.itemsPerPage = response.size || this.itemsPerPage;

            console.log(`Loaded ${this.universities.length} universities successfully!`);
            console.log('Pagination info:', {
              page: response.page,
              size: response.size,
              totalElements: response.totalElements,
              totalPages: response.totalPages
            });
          } else if (Array.isArray(response)) {
            // Xử lý trường hợp response là mảng đơn giản
            this.universities = response;
            this.totalRecords = response.length;

            console.log(`Loaded ${this.universities.length} universities successfully!`);
          }

          this.extractFilters();
          this.paginatedUniversities = this.universities;

          // Hiển thị 3 đại học đầu tiên để debug
          console.log('First 3 universities:', this.paginatedUniversities.slice(0, 3));
        })
    );
  }

  extractFilters(): void {
    // Extract unique locations
    this.locations = [...new Set(
      this.universities
        .map(university => university.location)
        .filter(location => location && location.trim() !== '')
    )].sort();

    // Extract unique university types
    this.universityTypes = [...new Set(
      this.universities
        .map(university => university.type)
        .filter(type => type && type.trim() !== '')
    )].sort();
  }

  filterUniversities(): void {
    console.log(`Filtering universities with search='${this.searchQuery}', location='${this.selectedLocation}', type='${this.selectedType}'`);

    // Cập nhật URL với các tham số tìm kiếm
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchQuery || null,
        location: this.selectedLocation || null,
        type: this.selectedType || null
      },
      queryParamsHandling: 'merge'
    });

    // Gọi API với các filter được áp dụng nhưng lấy tất cả dữ liệu
    this.loadAllUniversities();
  }

  // Phương thức tải tất cả đại học
  loadAllUniversities(): void {
    this.loading = true;
    this.errorMessage = '';
    console.log(`Đang tải tất cả dữ liệu đại học`);

    this.subscriptions.push(
      this.universityService.getUniversities(
        0,  // pageIndex = 0
        9999, // pageSize lớn - lấy tất cả
        this.searchQuery,
        this.selectedLocation,
        this.selectedType
      )
        .pipe(
          catchError(error => {
            console.error('Error loading all universities:', error);
            this.errorMessage = 'Không thể tải dữ liệu đại học. Vui lòng thử lại sau.';
            return this.universityService.getSampleUniversities();
          }),
          finalize(() => {
            this.loading = false;
            console.log('Đã hoàn thành tải dữ liệu');
          })
        )
        .subscribe((response: any) => {
          console.log('API Response:', response);

          if (response && response.content && Array.isArray(response.content)) {
            this.universities = response.content;
            console.log(`Loaded ${this.universities.length} universities`);
          } else if (Array.isArray(response)) {
            this.universities = response;
            console.log(`Loaded ${this.universities.length} universities as array`);
          } else {
            console.error('Unexpected response format:', response);
            this.errorMessage = 'Dữ liệu trả về không đúng định dạng';
          }

          // Sắp xếp đại học sau khi tải
          this.sortUniversities(this.sortBy);
        })
    );
  }

  sortUniversities(sortField: string): void {
    this.sortBy = sortField;

    this.universities.sort((a, b) => {
      let result = 0;

      switch (sortField) {
        case 'name':
          result = (a.name || '').localeCompare(b.name || '');
          break;
        case 'ranking':
          // Handle null or undefined ranking values
          if (!a.ranking && !b.ranking) result = 0;
          else if (!a.ranking) result = 1;
          else if (!b.ranking) result = -1;
          else result = a.ranking - b.ranking;
          break;
        case 'rating':
          // Handle null or undefined rating values
          const ratingA = a.averageRating || 0;
          const ratingB = b.averageRating || 0;
          result = ratingB - ratingA; // Higher rating first
          break;
        default:
          result = 0;
      }

      // Reverse for descending order
      return this.sortDirection === 'asc' ? result : -result;
    });
  }

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortUniversities(this.sortBy);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedLocation = '';
    this.selectedType = '';
    this.filterUniversities();
  }

  updatePaginatedUniversities(): void {
    // Calculate start and end indexes for pagination
    const startIndex = this.first;
    const endIndex = startIndex + this.itemsPerPage;

    // Log pagination details for debugging
    console.log('Pagination info:', {
      first: this.first,
      itemsPerPage: this.itemsPerPage,
      startIndex: startIndex,
      endIndex: endIndex,
      totalRecords: this.totalRecords
    });

    // Update the paginated universities array
    this.paginatedUniversities = this.filteredUniversities.slice(startIndex, endIndex);

    // Log how many items are on the current page
    console.log(`Current page contains ${this.paginatedUniversities.length} universities`);
  }

  navigateToDetail(id: number | string): void {
    this.router.navigate(['/universities', id]);
  }

  getUniversityImageUrl(university: University): string | null {
    if (!university) return null;

    // Check for university images from API
    if (university.images && university.images.length > 0) {
      return university.images[0];
    }

    return null; // Return null to trigger the placeholder alternative in template
  }

  getStars(rating: number): ('full' | 'half' | 'empty')[] {
    const stars: ('full' | 'half' | 'empty')[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push('half');
    }

    // Fill remaining with empty stars
    while (stars.length < 5) {
      stars.push('empty');
    }

    return stars;
  }

  truncateDescription(text: string, maxLength: number): string {
    if (!text) return '';

    // Return the full text if it's shorter than the maximum length
    if (text.length <= maxLength) {
      return text;
    }

    // Find the last space before the maximum length
    let lastSpaceIndex = text.lastIndexOf(' ', maxLength - 3);

    // If no space found or it's too close to the beginning, cut at maxLength - 3
    if (lastSpaceIndex <= maxLength / 3) {
      lastSpaceIndex = maxLength - 3;
    }

    // Return the truncated text with ellipsis
    return text.substring(0, lastSpaceIndex) + '...';
  }

  formatUniversityName(name: string): string {
    if (!name) return '';
    return name; // The CSS will handle the ellipsis
  }

  formatDescriptionForDisplay(description: string): string {
    if (!description) return '';

    // Keep original description - ellipsis will be added by CSS
    return description.replace(/\s+/g, ' ').trim();
  }
}
