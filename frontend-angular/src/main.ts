import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

/**
 * Punto de entrada principal de la aplicación (Bootstrapper).
 * Inicializa el árbol de componentes de Angular de forma determinista.
 */
bootstrapApplication(App, appConfig)
  .catch((err: unknown): void => {
    // Type narrowing & Exception safety enforcement
    // Garantizamos que el manejo del error sea predecible sin importar qué objeto se lance
    if (err instanceof Error) {
      console.error(`[Bootstrap Error - Fatal]: ${err.message}\n`, err.stack);
    } else {
      console.error('[Bootstrap Error - Fatal]: Excepción no estándar capturada en el nivel raíz.', err);
    }
  });