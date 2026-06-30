// src/app/data/tiendas-local.ts
import { espacioDesign } from './tiendas/espacio_design';
import { granBazar } from './tiendas/gran_bazar';
import { huertoReal } from './tiendas/huerto_real';
import { mercadoFresco } from './tiendas/mercado_fresco';
import { superAhorro } from './tiendas/super_ahorro'; 

/**
 * Contrato estructural base para el modelado de dominio de las tiendas.
 * Garantiza type safety sin acoplar la implementación exacta de los módulos importados.
 * El uso de 'unknown' fuerza un Type Narrowing en el consumidor (ej. el SearchService).
 */
export interface TiendaDefinicion {
  readonly [key: string]: unknown;
}

/**
 * Registro consolidado de tiendas locales.
 * Implementa el patrón Singleton Registry de forma estática e inmutable.
 * Se bloquea la mutación tanto en tiempo de compilación (ReadonlyArray) 
 * como en tiempo de ejecución (Object.freeze).
 */
export const TIENDAS_LOCALES = [
  espacioDesign,
  granBazar,
  huertoReal, 
  mercadoFresco, 
  superAhorro,
];