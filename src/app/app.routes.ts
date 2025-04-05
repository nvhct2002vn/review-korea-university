import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { UniversityListComponent } from './components/university-list/university-list.component';
import { UniversityDetailComponent } from './components/university-detail/university-detail.component';
import { UniversityRequestComponent } from './components/university-request/university-request.component';

/**
 * Cấu hình các routes (đường dẫn) cho ứng dụng
 * Mỗi route bao gồm:
 * - path: đường dẫn URL
 * - component: component sẽ được hiển thị khi URL khớp với path
 */
export const routes: Routes = [
  // Route mặc định: khi URL là trang chủ (''), hiển thị HomeComponent
  { path: '', component: HomeComponent },
  
  // Route cho trang danh sách đại học: hiển thị UniversityListComponent
  { path: 'universities', component: UniversityListComponent },
  
  // Route có tham số: hiển thị chi tiết một đại học cụ thể với ID tương ứng
  // Tham số :id sẽ được truy cập trong component qua ActivatedRoute
  { path: 'universities/:id', component: UniversityDetailComponent },
  
  // Route cho trang yêu cầu thêm trường đại học mới
  { path: 'request', component: UniversityRequestComponent },
  
  // Wildcard route (**): Bắt tất cả các URL không khớp với các route trên
  // và chuyển hướng về trang chủ
  { path: '**', redirectTo: '' }
];
