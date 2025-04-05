import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

/**
 * Bootstrap function for server-side rendering
 * Explicitly exported as a named export to ensure compatibility with Angular 19.2+
 */
export function bootstrap() {
  return bootstrapApplication(AppComponent, config);
}

// Default export for backward compatibility
export default bootstrap;
