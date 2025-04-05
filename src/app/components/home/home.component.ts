import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { University } from '../../models/university.model';
import { UniversityService } from '../../services/university.service';

/**
 * Component hiển thị trang chủ của ứng dụng
 * Hiển thị giới thiệu về trang web và các trường đại học được đánh giá cao nhất
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  // Top universities by ranking
  topRankedUniversities: University[] = [];
  isLoadingTopRanked = true;
  topRankedError = false;
  
  // Top universities by rating
  topRatedUniversities: University[] = [];
  isLoadingTopRated = true;
  topRatedError = false;
  
  // Most reviewed universities
  mostReviewedUniversities: University[] = [];
  isLoadingMostReviewed = true;
  mostReviewedError = false;

  constructor(private universityService: UniversityService) { }

  ngOnInit(): void {
    this.loadTopRankedUniversities();
    this.loadTopRatedUniversities();
    this.loadMostReviewedUniversities();
  }

  // Load universities with highest ranking
  loadTopRankedUniversities(): void {
    this.isLoadingTopRanked = true;
    this.topRankedError = false;
    
    this.universityService.getTopUniversities().subscribe({
      next: (universities) => {
        this.topRankedUniversities = universities.slice(0, 4);
        this.isLoadingTopRanked = false;
      },
      error: (error) => {
        console.error('Error loading top ranked universities:', error);
        this.topRankedError = true;
        this.isLoadingTopRanked = false;
      }
    });
  }

  // Load universities with highest ratings
  loadTopRatedUniversities(): void {
    this.isLoadingTopRated = true;
    this.topRatedError = false;
    
    this.universityService.getTopRatedUniversities().subscribe({
      next: (universities) => {
        this.topRatedUniversities = universities.slice(0, 4);
        this.isLoadingTopRated = false;
      },
      error: (error) => {
        console.error('Error loading top rated universities:', error);
        this.topRatedError = true;
        this.isLoadingTopRated = false;
      }
    });
  }

  // Load universities with most reviews
  loadMostReviewedUniversities(): void {
    this.isLoadingMostReviewed = true;
    this.mostReviewedError = false;
    
    this.universityService.getMostReviewedUniversities().subscribe({
      next: (universities) => {
        this.mostReviewedUniversities = universities.slice(0, 4);
        this.isLoadingMostReviewed = false;
      },
      error: (error) => {
        console.error('Error loading most reviewed universities:', error);
        this.mostReviewedError = true;
        this.isLoadingMostReviewed = false;
      }
    });
  }

  // Helper method to generate star ratings display
  getStarsArray(rating: number): number[] {
    const fullStars = Math.floor(rating);
    const result: number[] = Array(5).fill(0).map((_, index) => index < fullStars ? 1 : 0);
    
    // Add half star if needed
    if (rating % 1 >= 0.5) {
      result[fullStars] = 0.5 as any;
    }
    
    return result;
  }

  // Retry loading if there was an error
  retryTopRanked(): void {
    this.loadTopRankedUniversities();
  }

  retryTopRated(): void {
    this.loadTopRatedUniversities();
  }

  retryMostReviewed(): void {
    this.loadMostReviewedUniversities();
  }
} 