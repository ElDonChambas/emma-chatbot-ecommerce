import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

/**
 * Configuración global y registro de dependencias de la aplicación (Bootstrapper Configuration).
 * Implementa el patrón Singleton de configuración estática e inmutable.
 */
export const appConfig: Readonly<ApplicationConfig> = Object.freeze({
  providers: [
    /* Control flow optimization: Minimiza la sobrecarga del framework fusionando 
       eventos síncronos dentro del mismo tick del Event Loop. */
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    /* Registro determinista de rutas estructurales. */
    provideRouter(routes),
    
    /* Registro del cliente HTTP garantizando single-instance en el scope global. */
    provideHttpClient(),
  ]
});