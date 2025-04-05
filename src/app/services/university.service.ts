import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {catchError, map, finalize, tap, share} from 'rxjs/operators';
import {University, Review, UniversityRequest} from '../models/university.model';
import {environment} from '../../environments/environment';

/**
 * Service xử lý dữ liệu liên quan đến các trường đại học
 * @Injectable đánh dấu class này có thể được tiêm vào các component khác
 * providedIn: 'root' đảm bảo service này được cung cấp ở cấp độ ứng dụng (singleton)
 */
@Injectable({
  providedIn: 'root'
})
export class UniversityService {
  // URL cơ sở cho các API endpoints
  private apiUrl = environment.apiUrl;

  // Cờ theo dõi trạng thái các API call đang thực hiện
  private isLoadingUniversities = false;
  private isLoadingTopUniversities = false;
  private isLoadingTopRatedUniversities = false;
  private isLoadingMostReviewedUniversities = false;
  private isSearchingUniversities = false;
  private isLoadingByLocation = false;
  private isLoadingByType = false;

  // Cache cho các API calls
  private universitiesCache: University[] = [];
  private locationsCache: string[] | null = null;
  private typesCache: string[] | null = null;
  private searchCache: Map<string, University[]> = new Map();
  private locationFilterCache: Map<string, University[]> = new Map();
  private typeFilterCache: Map<string, University[]> = new Map();

  // Cache để lưu trữ dữ liệu
  private cache: {
    [key: string]: {
      data: any,
      expiry: number
    }
  } = {};

  // Thời gian cache sẽ hết hạn sau 5 phút
  private cacheDuration = 5 * 60 * 1000;

  /**
   * Constructor - Tiêm HttpClient để gọi API
   * @param http HttpClient service để thực hiện các HTTP request
   */
  constructor(private http: HttpClient) {
    // Khởi tạo cache
    this.universitiesCache = [];
  }

  /**
   * Lấy danh sách tất cả các trường đại học (có phân trang và lọc)
   * @param page Số trang (bắt đầu từ 0)
   * @param size Kích thước trang (số phần tử mỗi trang)
   * @param search Từ khóa tìm kiếm (tùy chọn)
   * @param location Vị trí để lọc (tùy chọn)
   * @param type Loại trường đại học để lọc (tùy chọn)
   * @returns Observable chứa mảng các đối tượng University hoặc response phân trang
   */
  getUniversities(
    page: number = 0,
    size: number = 9999,
    search?: string,
    location?: string,
    type?: string
  ): Observable<any> {
    // Đảm bảo page và size luôn hợp lệ
    page = isNaN(page) || page < 0 ? 0 : page;
    size = isNaN(size) || size <= 0 ? 9999 : size;

    // Nếu đang tải dữ liệu, trả về Observable rỗng để tránh gọi API lặp lại
    if (this.isLoadingUniversities) {
      console.log('Already loading universities, skipping duplicate request');
      return of([]);
    }

    // Kiểm tra sử dụng cache (chỉ khi không có lọc và là trang đầu tiên)
    const useCache = page === 0 && size === 9999 && !search && !location && !type;
    if (useCache && this.universitiesCache && this.universitiesCache.length > 0) {
      console.log('Returning universities from cache:', this.universitiesCache.length);
      return of(this.universitiesCache);
    }

    this.isLoadingUniversities = true;

    // Tạo params cho request phân trang và lọc
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // Log thông tin request để debug
    console.log(`Fetching universities with params: page=${page}, size=${size}`);

    // Thêm các tham số tìm kiếm và lọc (nếu có)
    if (search) params = params.set('search', search);
    if (location) params = params.set('location', location);
    if (type) params = params.set('type', type);

    console.log(`Fetching universities from API:`, {page, size, search, location, type});

    return this.http.get<any>(`${this.apiUrl}/universities`, {params}).pipe(
      tap(response => {
        console.log('Raw API Response (Universities):', response);
      }),
      map(response => {
        // Xử lý theo format API đã cung cấp: { success, message, data, timestamp }
        if (response && response.success && response.data) {
          console.log('API response format matches expected structure');

          // Trả về response với định dạng phân trang
          if (response.data.content && Array.isArray(response.data.content)) {
            const paginationResponse = {
              content: this.processUniversities(response.data.content),
              page: response.data.page || 0,
              size: response.data.size || size,
              totalElements: response.data.totalElements || 0,
              totalPages: response.data.totalPages || 0
            };

            // Cập nhật cache nếu là trang đầu tiên và không có lọc
            if (useCache) {
              this.universitiesCache = paginationResponse.content;
            }

            console.log('Processing paginated data:', paginationResponse);
            return paginationResponse;
          }

          // Nếu data là mảng trực tiếp (không có phân trang)
          if (Array.isArray(response.data)) {
            const universities = this.processUniversities(response.data);

            // Cập nhật cache nếu là request mặc định
            if (useCache) {
              this.universitiesCache = universities;
            }

            console.log('Processing data array directly:', universities.length);
            return universities;
          }
        }
        // Các trường hợp phản hồi khác
        else if (response) {
          // Nếu API trả về mảng trực tiếp
          if (Array.isArray(response)) {
            const universities = this.processUniversities(response);

            // Cập nhật cache nếu là request mặc định
            if (useCache) {
              this.universitiesCache = universities;
            }

            console.log('Processing direct array response:', universities.length);
            return universities;
          }
          // Nếu API trả về object với content property trực tiếp (định dạng phân trang)
          if (response.content && Array.isArray(response.content)) {
            const paginationResponse = {
              content: this.processUniversities(response.content),
              page: response.page || 0,
              size: response.size || size,
              totalElements: response.totalElements || 0,
              totalPages: response.totalPages || 0
            };

            // Cập nhật cache nếu là request mặc định
            if (useCache) {
              this.universitiesCache = paginationResponse.content;
            }

            console.log('Processing content array directly:', paginationResponse);
            return paginationResponse;
          }
          // Nếu API trả về các định dạng khác
          console.warn('Unexpected API response format:', response);
        }

        console.warn('No processable data found in the API response');
        return [];
      }),
      catchError(error => {
        console.error('Error fetching universities from API:', error);
        if (error.status === 0) {
          console.log('Network error detected, using sample data as fallback');
        } else {
          console.log('API error detected, using sample data as fallback');
        }
        return this.getSampleUniversities(); // Fallback to sample data
      }),
      finalize(() => {
        this.isLoadingUniversities = false;
        console.log('Universities loading completed');
      }),
      share() // Chia sẻ kết quả cho tất cả subscribers
    );
  }

  /**
   * Lấy thông tin chi tiết của một trường đại học theo ID
   * @param id ID của trường đại học
   * @returns Observable của đối tượng University
   */
  getUniversityById(id: number): Observable<University> {
    console.log(`Fetching university details for ID: ${id}`);

    // Kiểm tra cache trước
    const cachedUniversity = this.universitiesCache.find(u => u.id === id);
    if (cachedUniversity) {
      console.log(`University ID ${id} found in cache:`, cachedUniversity);

      // Cập nhật ảnh từ cache (chỉ xử lý khi cần)
      if (cachedUniversity.images && cachedUniversity.images.length > 0) {
        console.log(`Cached university has ${cachedUniversity.images.length} images`);
      } else if (cachedUniversity.imageUrl) {
        console.log(`Cached university has imageUrl: ${cachedUniversity.imageUrl}`);
      }

      return of(cachedUniversity);
    }

    // Không có trong cache, call API
    const url = `${this.apiUrl}/universities/${id}`;
    console.log(`Calling API: ${url}`);

    return this.http.get<any>(url).pipe(
      tap(response => {
        console.log(`API response for university ID ${id}:`, response);
      }),
      map(response => {
        // Xử lý API response theo định dạng đã cung cấp
        let universityData: any = null;

        if (response && response.success && response.data) {
          universityData = response.data;
        } else if (response && !response.success) {
          throw new Error(response.message || 'API returned unsuccessful response');
        } else if (response) {
          // Trường hợp API không trả về cấu trúc { success, data } mà trả về dữ liệu trực tiếp
          universityData = response;
        } else {
          throw new Error('API returned invalid data format');
        }

        // Xử lý dữ liệu trả về từ API
        const university = this.processUniversity(universityData);

        // Xử lý riêng cho images trong trường hợp này nếu cần
        if (university.images.length === 0) {
          console.log(`No images found in primary response, fetching images separately for university ${id}`);
          this.getUniversityImages(id).subscribe(images => {
            if (images && images.length > 0) {
              university.images = images;
              university.imageUrl = images[0];
              // Cập nhật cache
              this.updateUniversityCache(university);
            }
          });
        }

        // Lưu vào cache để sử dụng sau
        this.updateUniversityCache(university);

        console.log(`Processed university ${id} data:`, university);
        return university;
      }),
      catchError(error => {
        console.error(`Error fetching university ID ${id}:`, error);

        // Xử lý lỗi cụ thể dựa trên mã lỗi
        if (error.status === 403) {
          return throwError(() => new Error('Access to this university data is restricted. You may not have permission to view it.'));
        } else if (error.status === 404) {
          return throwError(() => new Error('University not found. The requested university may not exist or has been removed.'));
        } else if (error.status === 0) {
          console.log('Backend server is down, using sample data as fallback');
          // Sử dụng dữ liệu mẫu trong trường hợp server không phản hồi
          const sampleUniversities = this.getSampleUniversities();
          if (Array.isArray(sampleUniversities)) {
            const sampleUniversity = sampleUniversities.find((u: University) => u.id === id);
            if (sampleUniversity) {
              return of(sampleUniversity);
            }
          }
          return throwError(() => new Error('Could not connect to server. Please check your internet connection and try again.'));
        }

        return throwError(() => new Error('Failed to load university details. Please try again later.'));
      })
    );
  }

  /**
   * Trích xuất URL ảnh từ đối tượng response
   * @param data Dữ liệu đầu vào (có thể là đối tượng hoặc mảng)
   * @returns Mảng chứa các URL ảnh
   */
  private extractImageUrls(data: any): string[] {
    console.log('Extracting image URLs from data:', data);
    const urls: string[] = [];

    // Xử lý trường hợp images là mảng URL
    if (data.images) {
      if (Array.isArray(data.images)) {
        // Trường hợp mảng chuỗi
        if (data.images.length > 0 && typeof data.images[0] === 'string') {
          urls.push(...data.images);
        }
        // Trường hợp mảng đối tượng
        else if (data.images.length > 0 && typeof data.images[0] === 'object') {
          const imageUrls = data.images
            .map((img: any) => img.imageUrl || img.image_url || img.url || img.path || null)
            .filter(Boolean);
          urls.push(...imageUrls);
        }
      }
      // Trường hợp chuỗi đơn
      else if (typeof data.images === 'string') {
        urls.push(data.images);
      }
    }

    // Xử lý trường hợp có image_url hoặc imageUrl
    if (data.image_url || data.imageUrl) {
      const imageUrl = data.image_url || data.imageUrl;
      if (!urls.includes(imageUrl)) {
        urls.push(imageUrl);
      }
    }

    // Xử lý trường hợp university_images
    if (data.university_images && Array.isArray(data.university_images)) {
      const imageUrls = data.university_images
        .map((img: any) => img.image_url || img.imageUrl || img.url || img.path || null)
        .filter(Boolean);

      imageUrls.forEach((url: string) => {
        if (!urls.includes(url)) {
          urls.push(url);
        }
      });
    }

    console.log(`Extracted ${urls.length} image URLs:`, urls);
    return urls;
  }

  /**
   * Cập nhật cache với đối tượng university mới
   */
  private updateUniversityCache(university: University): void {
    // Nếu không tồn tại trong cache, thêm vào
    const existingIndex = this.universitiesCache.findIndex(u => u.id === university.id);
    if (existingIndex >= 0) {
      this.universitiesCache[existingIndex] = university;
    } else {
      this.universitiesCache.push(university);
    }
  }

  /**
   * Lấy danh sách hình ảnh cho một trường đại học
   * @param universityId ID của trường đại học cần lấy hình ảnh
   * @returns Observable chứa mảng các URL hình ảnh
   */
  getUniversityImages(universityId: number): Observable<string[]> {
    return this.http.get<any>(`${this.apiUrl}/universities/${universityId}/images`).pipe(
      map(response => {
        console.log(`API Response (Images for university ${universityId}):`, response);

        // Xử lý theo cấu trúc API đã cung cấp
        if (response && response.success && response.data) {
          // data có thể là một mảng string trực tiếp
          if (Array.isArray(response.data)) {
            return response.data;
          }
        } else if (response && Array.isArray(response)) {
          // Trường hợp API trả về mảng trực tiếp
          return response;
        }

        return [];
      }),
      catchError(error => {
        console.error(`Error fetching images for university ${universityId}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Lấy danh sách đánh giá cho một trường đại học
   * @param universityId ID của trường đại học cần lấy đánh giá
   * @returns Observable chứa mảng các đánh giá
   */
  getReviewsByUniversityId(universityId: number): Observable<Review[]> {
    return this.http.get<any>(`${this.apiUrl}/reviews/university/${universityId}`).pipe(
      map(response => {
        console.log(`API Response (Reviews for university ${universityId}):`, response);

        // Xử lý theo cấu trúc API đã cung cấp
        if (response && response.success && response.data) {
          // Nếu data là một đối tượng pagination (có trường content)
          if (response.data.content && Array.isArray(response.data.content)) {
            return response.data.content.map((review: any) => this.processReview(review));
          }

          // Nếu data là mảng trực tiếp
          if (Array.isArray(response.data)) {
            return response.data.map((review: any) => this.processReview(review));
          }
        } else if (response && Array.isArray(response)) {
          // Trường hợp API trả về mảng trực tiếp
          return response.map((review: any) => this.processReview(review));
        }

        return [];
      }),
      catchError(error => {
        console.error(`Error fetching reviews for university ${universityId} from API:`, error);
        return of([]); // Trả về mảng rỗng khi lỗi
      })
    );
  }

  /**
   * Thêm đánh giá mới cho một trường đại học
   * @param review Đối tượng Review cần thêm
   * @returns Observable chứa đánh giá đã được thêm (có ID)
   */
  addReview(review: Review): Observable<Review> {
    return this.http.post<any>(`${this.apiUrl}/reviews`, review).pipe(
      map(response => {
        console.log('API Response (Add Review):', response);

        if (response && response.success && response.data) {
          return this.processReview(response.data);
        } else if (response && !response.success) {
          throw new Error(response.message || 'Failed to add review');
        } else if (response) {
          // Trường hợp API không trả về theo cấu trúc { success, data } mà trả về dữ liệu trực tiếp
          return this.processReview(response);
        }

        throw new Error('Failed to add review: Invalid API response');
      }),
      catchError(error => {
        console.error('Error adding review:', error);
        throw error;
      })
    );
  }

  /**
   * Gửi yêu cầu thêm trường đại học mới
   * @param request Thông tin trường đại học cần thêm
   * @returns Observable chứa phản hồi từ server
   */
  submitUniversityRequest(request: UniversityRequest): Observable<any> {
    // BE chưa có API này, sẽ cập nhật sau khi BE triển khai
    console.log('University request submitted:', request);
    return of({success: true, message: 'Yêu cầu đã được gửi thành công'});
  }

  /**
   * Tìm kiếm các trường đại học theo từ khóa
   * @param query Từ khóa tìm kiếm
   * @returns Observable chứa mảng các trường đại học phù hợp
   */
  searchUniversities(query: string): Observable<University[]> {
    if (this.isSearchingUniversities) {
      return of([]);
    }

    // Kiểm tra cache
    if (this.searchCache.has(query)) {
      return of(this.searchCache.get(query) || []);
    }

    this.isSearchingUniversities = true;

    return this.http.get<any>(`${this.apiUrl}/universities/search?query=${query}`).pipe(
      map(response => {
        if (response && response.data) {
          return this.processUniversities(response.data);
        }
        return [];
      }),
      tap(results => {
        // Lưu vào cache
        this.searchCache.set(query, results);
      }),
      catchError(error => {
        console.error('Error searching universities:', error);
        // Fallback đến tìm kiếm phía client
        return this.getSampleUniversities().pipe(
          map(universities => this.performClientSideSearch(universities, query))
        );
      }),
      finalize(() => {
        this.isSearchingUniversities = false;
      }),
      share()
    );
  }

  /**
   * Thực hiện tìm kiếm phía client (dữ liệu mẫu)
   * @param universities Mảng các đại học để tìm kiếm
   * @param query Từ khóa tìm kiếm
   * @returns Mảng các đại học phù hợp với từ khóa
   */
  private performClientSideSearch(universities: University[], query: string): University[] {
    const lowerQuery = query.toLowerCase();
    return universities.filter(univ =>
      univ.name.toLowerCase().includes(lowerQuery) ||
      (univ.nameKorean && univ.nameKorean.toLowerCase().includes(lowerQuery)) ||
      (univ.description && univ.description.toLowerCase().includes(lowerQuery)) ||
      (univ.location && univ.location.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Lấy danh sách các trường đại học theo địa điểm
   * @param location Địa điểm cần lọc
   * @returns Observable chứa mảng các trường đại học ở địa điểm đã chọn
   */
  getUniversitiesByLocation(location: string): Observable<University[]> {
    if (this.isLoadingByLocation) {
      return of([]);
    }

    // Kiểm tra cache
    if (this.locationFilterCache.has(location)) {
      return of(this.locationFilterCache.get(location) || []);
    }

    this.isLoadingByLocation = true;

    return this.http.get<any>(`${this.apiUrl}/universities/by-location?location=${location}`).pipe(
      map(response => {
        if (response && response.data) {
          return this.processUniversities(response.data);
        }
        return [];
      }),
      tap(results => {
        // Lưu vào cache
        this.locationFilterCache.set(location, results);
      }),
      catchError(error => {
        console.error('Error filtering universities by location:', error);
        // Fallback đến lọc phía client
        return this.getSampleUniversities().pipe(
          map(universities => universities.filter(u => u.location === location))
        );
      }),
      finalize(() => {
        this.isLoadingByLocation = false;
      }),
      share()
    );
  }

  /**
   * Lấy danh sách các trường đại học theo loại (Public/Private)
   * @param type Loại trường đại học cần lọc
   * @returns Observable chứa mảng các trường đại học thuộc loại đã chọn
   */
  getUniversitiesByType(type: 'Public' | 'Private'): Observable<University[]> {
    if (this.isLoadingByType) {
      return of([]);
    }

    // Kiểm tra cache
    if (this.typeFilterCache.has(type)) {
      return of(this.typeFilterCache.get(type) || []);
    }

    this.isLoadingByType = true;

    return this.http.get<any>(`${this.apiUrl}/universities/by-type?type=${type}`).pipe(
      map(response => {
        if (response && response.data) {
          return this.processUniversities(response.data);
        }
        return [];
      }),
      tap(results => {
        // Lưu vào cache
        this.typeFilterCache.set(type, results);
      }),
      catchError(error => {
        console.error('Error filtering universities by type:', error);
        // Fallback đến lọc phía client
        return this.getSampleUniversities().pipe(
          map(universities => universities.filter(u => u.type === type))
        );
      }),
      finalize(() => {
        this.isLoadingByType = false;
      }),
      share()
    );
  }

  /**
   * Lấy danh sách tất cả các địa điểm của trường đại học
   * @returns Observable chứa mảng các địa điểm
   */
  getLocations(): Observable<string[]> {
    // Nếu có trong cache, trả về từ cache
    if (this.locationsCache) {
      return of(this.locationsCache);
    }

    return this.http.get<any>(`${this.apiUrl}/universities/locations`).pipe(
      map(response => {
        if (response && response.data) {
          return response.data as string[];
        }
        return [];
      }),
      tap(locations => {
        // Lưu vào cache
        this.locationsCache = locations;
      }),
      catchError(error => {
        console.error('Error fetching locations:', error);
        // Fallback đến trích xuất từ dữ liệu mẫu
        return this.getSampleUniversities().pipe(
          map(universities => {
            const locations = universities
              .filter(u => u.location)
              .map(u => u.location)
              .filter((value, index, self) => self.indexOf(value) === index);
            return locations as string[];
          })
        );
      }),
      share()
    );
  }

  /**
   * Lấy danh sách tất cả các loại trường đại học
   * @returns Observable chứa mảng các loại trường
   */
  getTypes(): Observable<string[]> {
    // Nếu có trong cache, trả về từ cache
    if (this.typesCache) {
      return of(this.typesCache);
    }

    return this.http.get<any>(`${this.apiUrl}/universities/types`).pipe(
      map(response => {
        if (response && response.data) {
          return response.data as string[];
        }
        return [];
      }),
      tap(types => {
        // Lưu vào cache
        this.typesCache = types;
      }),
      catchError(error => {
        console.error('Error fetching university types:', error);
        // Trả về các loại mặc định
        return of(['Public', 'Private']);
      }),
      share()
    );
  }

  /**
   * Lấy danh sách các trường đại học xếp hạng cao nhất
   * @returns Observable chứa mảng các trường đại học xếp hạng cao nhất
   */
  getTopUniversities(): Observable<University[]> {
    // Nếu đang tải dữ liệu, trả về Observable rỗng để tránh gọi API lặp lại
    if (this.isLoadingTopUniversities) {
      return of([]);
    }

    this.isLoadingTopUniversities = true;

    return this.http.get<any>(`${this.apiUrl}/universities/top?size=3`).pipe(
      map(response => {
        if (response && response.data && response.data.content) {
          return this.processUniversities(response.data.content);
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching top universities:', error);
        return this.getSampleTopUniversities();
      }),
      finalize(() => {
        this.isLoadingTopUniversities = false;
      })
    );
  }

  /**
   * Lấy danh sách các trường đại học có đánh giá cao nhất
   * @returns Observable chứa mảng các trường đại học có đánh giá cao nhất
   */
  getTopRatedUniversities(): Observable<University[]> {
    // Nếu đang tải dữ liệu, trả về Observable rỗng để tránh gọi API lặp lại
    if (this.isLoadingTopRatedUniversities) {
      return of([]);
    }

    this.isLoadingTopRatedUniversities = true;

    // Sử dụng API chung nhưng với tham số sắp xếp theo rating
    return this.http.get<any>(`${this.apiUrl}/universities?sortBy=averageRating&size=3`).pipe(
      map(response => {
        if (response && response.data && response.data.content) {
          return this.processUniversities(response.data.content);
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching top rated universities:', error);
        return this.getSampleUniversities().pipe(
          map(universities => {
            return [...universities]
              .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
              .slice(0, 3);
          })
        );
      }),
      finalize(() => {
        this.isLoadingTopRatedUniversities = false;
      })
    );
  }

  /**
   * Lấy danh sách các trường đại học có nhiều đánh giá nhất
   * @returns Observable chứa mảng các trường đại học có nhiều đánh giá nhất
   */
  getMostReviewedUniversities(): Observable<University[]> {
    // Nếu đang tải dữ liệu, trả về Observable rỗng để tránh gọi API lặp lại
    if (this.isLoadingMostReviewedUniversities) {
      return of([]);
    }

    this.isLoadingMostReviewedUniversities = true;

    // Sử dụng API chung nhưng với tham số sắp xếp theo số lượng đánh giá
    return this.http.get<any>(`${this.apiUrl}/universities?sortBy=reviewCount&size=3`).pipe(
      map(response => {
        if (response && response.data && response.data.content) {
          return this.processUniversities(response.data.content);
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching most reviewed universities:', error);
        return this.getSampleUniversities().pipe(
          map(universities => {
            return [...universities]
              .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
              .slice(0, 3);
          })
        );
      }),
      finalize(() => {
        this.isLoadingMostReviewedUniversities = false;
      })
    );
  }

  /**
   * Xử lý dữ liệu University từ API response
   * @param data Dữ liệu university từ BE
   * @returns University đã được xử lý
   */
  private processUniversity(data: any): University {
    // Log để debug
    console.log('Processing university data:', data);

    // Xử lý facilities trước khi tạo đối tượng university
    let facilityArray: string[] = [];

    // Xử lý trường facilities có thể là string hoặc mảng
    if (data.facilities) {
      if (Array.isArray(data.facilities)) {
        facilityArray = data.facilities;
      } else if (typeof data.facilities === 'string') {
        facilityArray = data.facilities.split(' ').filter(Boolean);
      }
    } else if (data.campusFacilities) {
      if (Array.isArray(data.campusFacilities)) {
        facilityArray = data.campusFacilities;
      } else if (typeof data.campusFacilities === 'string') {
        facilityArray = data.campusFacilities.split(' ').filter(Boolean);
      }
    }

    // Chuyển đổi từ DTO của BE sang model University trong FE
    const university: University = {
      id: data.id,
      name: data.name,
      nameKorean: data.nameKorean || data.name_korean,
      location: data.location,
      established: data.established,
      type: data.type as 'Public' | 'Private',
      website: data.website,
      description: data.description,
      ranking: data.ranking,
      studentCount: data.studentCount || data.student_count,
      facultyCount: data.facultyCount || data.faculty_count,
      hasInternationalPrograms: data.hasInternationalPrograms || data.has_international_programs || false,
      images: [],
      imageUrl: undefined,
      departments: [],
      admissionRequirements: data.admissionRequirements || data.admission_requirements,
      campusFacilities: facilityArray,
      averageRating: data.averageRating || data.average_rating || 0,
      reviewCount: data.reviewCount || data.review_count || 0,
      tuitionFees: data.tuition || data.tuitionFees
    };

    console.log(`University ${data.id} basic data processed`);

    // Mặc định tạo một mảng rỗng cho images
    university.images = [];

    // Xử lý hình ảnh từ nhiều nguồn khác nhau
    const processedImages: string[] = [];

    // 1. Xử lý trường images là mảng URL hoặc chuỗi
    if (data.images) {
      console.log(`Images field present in data for university ${data.id}:`, data.images);

      if (Array.isArray(data.images)) {
        console.log(`Images is an array with ${data.images.length} items`);

        // Nếu là mảng chuỗi
        if (data.images.length > 0 && typeof data.images[0] === 'string') {
          console.log('Images is array of strings');
          processedImages.push(...data.images);
        }
        // Nếu là mảng đối tượng
        else if (data.images.length > 0 && typeof data.images[0] === 'object') {
          console.log('Images is array of objects');
          const urls = data.images
            .map((img: any) => {
              const url = img.imageUrl || img.image_url || img.url || img.path || null;
              console.log(`Processing image object:`, img, `extracted URL:`, url);
              return url;
            })
            .filter(Boolean);
          processedImages.push(...urls);
        }
      }
      // Nếu là chuỗi đơn lẻ (API có thể trả về chuỗi URL trực tiếp)
      else if (typeof data.images === 'string') {
        console.log('Images is a single string:', data.images);
        // Trường hợp nhiều URL ngăn cách bằng khoảng trắng
        if (data.images.includes(' ')) {
          const urls = data.images.split(' ').filter(Boolean);
          console.log('Split space-separated URLs:', urls);
          processedImages.push(...urls);
        } else {
          processedImages.push(data.images);
        }
      } else {
        console.log('Images has unexpected format:', typeof data.images);
      }
    } else {
      console.log(`No images field in data for university ${data.id}`);
    }

    // 2. Xử lý trường image_url hoặc imageUrl
    if (data.image_url || data.imageUrl) {
      const imageUrl = data.image_url || data.imageUrl;
      console.log(`Found image_url/imageUrl:`, imageUrl);
      if (!processedImages.includes(imageUrl)) {
        processedImages.push(imageUrl);
      }
    }

    // 3. Xử lý trường university_images
    if (data.university_images && Array.isArray(data.university_images)) {
      console.log(`Found university_images array with ${data.university_images.length} items`);
      const imageUrls = data.university_images
        .map((img: any) => {
          const url = img.image_url || img.imageUrl || img.url || img.path || null;
          console.log(`Processing university_image:`, img, `extracted URL:`, url);
          return url;
        })
        .filter(Boolean);

      // Thêm URL unique
      imageUrls.forEach((url: string) => {
        if (!processedImages.includes(url)) {
          processedImages.push(url);
        }
      });
    }

    // 4. Gán các hình ảnh đã xử lý vào đối tượng university
    university.images = processedImages;

    // 5. Thiết lập imageUrl nếu có ít nhất một hình ảnh
    if (processedImages.length > 0) {
      university.imageUrl = processedImages[0];
      console.log(`Found ${processedImages.length} images for university ID ${university.id}:`, processedImages);
    } else {
      console.log(`No images found for university ID ${university.id}`);
    }

    // Xử lý departments (có thể là mảng hoặc chuỗi ngăn cách bằng khoảng trắng)
    if (data.departments) {
      if (Array.isArray(data.departments)) {
        university.departments = data.departments;
        console.log(`Departments processed: ${university.departments.length} departments`);
      } else if (typeof data.departments === 'string') {
        // Phân tách chuỗi thành mảng theo khoảng trắng
        university.departments = data.departments.split(' ');
        console.log(`Departments processed from string: ${university.departments.length} departments`);
      }
    } else if (data.university_departments && Array.isArray(data.university_departments)) {
      university.departments = data.university_departments.map((dept: any) => dept.name);
      console.log(`University departments processed: ${university.departments.length} departments`);
    }

    // Đảm bảo mảng departments không bị null
    if (!university.departments) {
      university.departments = [];
    }

    console.log(`University ${data.id} completely processed:`, university);
    return university;
  }

  /**
   * Xử lý mảng universities từ API response
   * @param data Mảng các university từ BE
   * @returns Mảng University đã được xử lý
   */
  private processUniversities(data: any[]): University[] {
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map(item => this.processUniversity(item));
  }

  /**
   * Xử lý dữ liệu Review từ API response
   * @param data Dữ liệu review từ BE
   * @returns Review đã được xử lý
   */
  private processReview(data: any): Review {
    // Log review data để debug
    console.log('Processing review data:', data);

    const review: Review = {
      id: data.id,
      universityId: data.universityId || data.university_id,
      author: data.author,
      date: new Date(data.date || data.createdAt || data.created_at || Date.now()),
      rating: data.rating,
      content: data.content,
      programStudied: data.programStudied || data.program_studied,
      yearOfStudy: data.yearOfStudy || data.year_of_study,
      isInternational: data.isInternational || data.is_international || false,
      pros: [],
      cons: []
    };

    // Xử lý pros và cons dựa trên cấu trúc có thể có
    if (data.pros) {
      if (Array.isArray(data.pros)) {
        review.pros = data.pros;
      } else if (typeof data.pros === 'string') {
        review.pros = data.pros.split(',').map((item: string) => item.trim()).filter(Boolean);
      }
    }

    if (data.cons) {
      if (Array.isArray(data.cons)) {
        review.cons = data.cons;
      } else if (typeof data.cons === 'string') {
        review.cons = data.cons.split(',').map((item: string) => item.trim()).filter(Boolean);
      }
    }

    return review;
  }

  // Các phương thức dữ liệu mẫu dưới đây dùng cho fallback khi API không hoạt động

  /**
   * Lấy dữ liệu mẫu về các trường đại học
   * @returns Observable chứa dữ liệu mẫu
   */
  public getSampleUniversities(): Observable<University[]> {
    console.log('API fallback: Using sample universities data');

    // Tạo dữ liệu mẫu với ảnh placeholder
    const sampleData: University[] = [
      {
        id: 1,
        name: 'Seoul National University',
        nameKorean: '서울대학교',
        location: 'Seoul',
        established: 1946,
        type: 'Public',
        website: 'https://en.snu.ac.kr/',
        description: 'Seoul National University is a prestigious university in South Korea, known for its rigorous academics and research contributions.',
        ranking: 1,
        studentCount: 27000,
        facultyCount: 2500,
        hasInternationalPrograms: true,
        images: [
          'assets/images/university-placeholder.jpg',
          'assets/images/university-placeholder.jpg'
        ],
        imageUrl: 'assets/images/university-placeholder.jpg',
        departments: ['Liberal Arts', 'Engineering', 'Medicine', 'Science'],
        admissionRequirements: 'TOPIK Level 4 or higher, Academic transcripts',
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
        campusFacilities: ['Library', 'Dormitories', 'Research Labs'],
        averageRating: 4.7,
        reviewCount: 45
      },
      {
        id: 2,
        name: 'Korea University',
        nameKorean: '고려대학교',
        location: 'Seoul',
        established: 1905,
        type: 'Private',
        website: 'https://www.korea.edu/',
        description: 'Korea University is a private university in Seoul, South Korea, known for its business and law programs.',
        ranking: 2,
        studentCount: 25000,
        facultyCount: 2200,
        hasInternationalPrograms: true,
        images: [
          'assets/images/university-placeholder.jpg',
          'assets/images/university-placeholder.jpg'
        ],
        imageUrl: 'assets/images/university-placeholder.jpg',
        departments: ['Business', 'Law', 'Engineering', 'Liberal Arts'],
        admissionRequirements: 'TOPIK Level 3 or higher',
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
        campusFacilities: ['Library', 'Sports Center', 'Student Union'],
        averageRating: 4.5,
        reviewCount: 38
      },
      {
        id: 3,
        name: 'Yonsei University',
        nameKorean: '연세대학교',
        location: 'Seoul',
        established: 1885,
        type: 'Private',
        website: 'https://www.yonsei.ac.kr/',
        description: 'Yonsei University is one of the oldest and most prestigious universities in South Korea, with a strong focus on international studies.',
        ranking: 3,
        studentCount: 26000,
        facultyCount: 2300,
        hasInternationalPrograms: true,
        images: [
          'assets/images/university-placeholder.jpg',
          'assets/images/university-placeholder.jpg'
        ],
        imageUrl: 'assets/images/university-placeholder.jpg',
        departments: ['Medicine', 'Business', 'International Studies', 'Engineering'],
        admissionRequirements: 'TOPIK Level 3 or higher',
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
        campusFacilities: ['Library', 'Medical Center', 'Global Village'],
        averageRating: 4.6,
        reviewCount: 42
      },
      {
        id: 4,
        name: 'KAIST (Korea Advanced Institute of Science and Technology)',
        nameKorean: '한국과학기술원',
        location: 'Daejeon',
        established: 1971,
        type: 'Public',
        website: 'https://www.kaist.ac.kr/',
        description: 'KAIST is the leading science and technology university in Korea, focusing on engineering and advanced research.',
        ranking: 4,
        studentCount: 10000,
        facultyCount: 1200,
        hasInternationalPrograms: true,
        images: [
          'assets/images/university-placeholder.jpg'
        ],
        imageUrl: 'assets/images/university-placeholder.jpg',
        departments: ['Electrical Engineering', 'Computer Science', 'Physics', 'Biology'],
        admissionRequirements: 'TOPIK Level 3 or higher, strong background in STEM subjects',
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
        campusFacilities: ['Research Labs', 'Innovation Center', 'Science Library'],
        averageRating: 4.8,
        reviewCount: 30
      },
      {
        id: 5,
        name: 'Busan National University',
        nameKorean: '부산대학교',
        location: 'Busan',
        established: 1946,
        type: 'Public',
        website: 'https://www.pusan.ac.kr/',
        description: 'Busan National University is the top university in the Busan region, with strong programs in engineering and marine sciences.',
        ranking: 5,
        studentCount: 22000,
        facultyCount: 2100,
        hasInternationalPrograms: true,
        images: [
          'assets/images/university-placeholder.jpg'
        ],
        imageUrl: 'assets/images/university-placeholder.jpg',
        departments: ['Marine Sciences', 'Engineering', 'Business', 'Arts'],
        admissionRequirements: 'TOPIK Level 3 or higher',
        tuitionFees: {
          undergraduate: {
            domestic: 4800000,
            international: 6800000
          },
          graduate: {
            domestic: 5800000,
            international: 7800000
          },
          currency: 'KRW'
        },
        campusFacilities: ['Marine Research Center', 'Library', 'Student Center'],
        averageRating: 4.4,
        reviewCount: 25
      }
    ];

    return of(sampleData);
  }

  /**
   * Lấy dữ liệu mẫu về top trường đại học
   * @returns Observable chứa dữ liệu mẫu về top trường
   */
  private getSampleTopUniversities(): Observable<University[]> {
    console.log('API fallback: Using sample top universities data');
    return this.getSampleUniversities().pipe(
      map(universities => {
        return [...universities].sort((a, b) => (a.ranking || 999) - (b.ranking || 999)).slice(0, 3);
      })
    );
  }

  /**
   * Lấy dữ liệu mẫu về đánh giá
   * @param universityId ID của trường đại học cần lấy đánh giá
   * @returns Observable chứa mảng các đánh giá mẫu
   */
  private getSampleReviews(universityId: number): Observable<Review[]> {
    console.log(`API fallback: Using sample reviews for university ${universityId}`);

    const sampleReviews: Review[] = [
      {
        id: 1,
        universityId: universityId,
        author: 'Kim Min-ji',
        date: new Date(),
        rating: 4.5,
        content: 'This university provides excellent education and has great facilities. The professors are very knowledgeable and supportive.',
        programStudied: 'Computer Science',
        yearOfStudy: '2021-2025',
        isInternational: false,
        pros: ['Great professors', 'Good facilities'],
        cons: ['Competitive environment']
      },
      {
        id: 2,
        universityId: universityId,
        author: 'John Smith',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        rating: 5,
        content: 'My experience as an international student was amazing. The university has great support systems for foreign students.',
        programStudied: 'International Business',
        yearOfStudy: '2020-2024',
        isInternational: true,
        pros: ['Good support for international students', 'Diverse community'],
        cons: ['Expensive tuition']
      }
    ];

    return of(sampleReviews);
  }

  /**
   * Xóa tất cả cache để refresh dữ liệu
   */
  clearCache(): void {
    this.universitiesCache = [];
    this.locationsCache = null;
    this.typesCache = null;
    this.searchCache.clear();
    this.locationFilterCache.clear();
    this.typeFilterCache.clear();
  }

  getUniversityImageUrl(university: University): string | null {
    if (!university) return null;

    // Check for university images from API
    if (university.images && university.images.length > 0) {
      return university.images[0];
    }

    // No need to use placeholder image file that doesn't exist
    // return 'assets/images/university-placeholder.jpg';
    return null; // Return null to trigger the university-placeholder alternative in template
  }

  // Add more robust error handling for API calls
  private handleApiError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);

      // Add more detailed error logging to help debug the connection issue
      if (error.status === 0) {
        console.log('Network error detected, using sample data as fallback');
      } else {
        console.error('API Error details:', error);
      }

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
