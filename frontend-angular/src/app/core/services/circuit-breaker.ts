import { Injectable } from '@angular/core';

/**
 * Modelado orientado a dominio para los estados del circuito.
 * Garantiza Type safety enforcement y restringe mutaciones inválidas.
 */
type CircuitState = 'CLOSED' | 'OPEN';

@Injectable({
  providedIn: 'root'
})
export class CircuitBreakerService {
  // Aplicación de Immutability patterns para la configuración
  private readonly FAILURE_LIMIT: number = 3;
  private readonly RESET_TIME_MS: number = 5000;

  // Optimización de declaraciones y tipado explícito (Static typing)
  private failures: number = 0;
  private state: CircuitState = 'CLOSED';
  private lastFailureTime: number | null = null;

  /**
   * Evalúa si la operación puede ejecutarse basándose en el estado actual.
   * @returns {boolean} True si el circuito permite el paso, False si está bloqueado.
   */
  canExecute(): boolean {
    // Control flow optimization & Guard clauses
    if (this.state === 'CLOSED') {
      return true;
    }

    if (this.canResetCircuit()) {
      this.closeCircuit();
      return true;
    }

    return false;
  }

  /**
   * Registra una operación fallida y abre el circuito si se supera el umbral.
   */
  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.shouldOpenCircuit()) {
      this.openCircuit();
    }
  }

  // ========================================================================
  // Métodos Privados: High cohesion / Low coupling & Cognitive load minimization
  // ========================================================================

  /**
   * Evalúa de forma pura si el tiempo de penalización ha transcurrido.
   * @returns {boolean}
   */
  private canResetCircuit(): boolean {
    if (!this.lastFailureTime) return false;
    return (Date.now() - this.lastFailureTime) > this.RESET_TIME_MS;
  }

  /**
   * Evalúa si se cumplen las condiciones para cambiar el estado a OPEN.
   * @returns {boolean}
   */
  private shouldOpenCircuit(): boolean {
    return this.failures >= this.FAILURE_LIMIT && this.state !== 'OPEN';
  }

  /**
   * Muta el estado interno cerrando el circuito y reseteando contadores.
   */
  private closeCircuit(): void {
    this.state = 'CLOSED';
    this.failures = 0;
    this.lastFailureTime = null; // Scope optimization: limpieza de memoria
    console.log('✅ Circuito CERRADO de nuevo. Reanudando tráfico normal.');
  }

  /**
   * Muta el estado interno abriendo el circuito.
   */
  private openCircuit(): void {
    this.state = 'OPEN';
    console.warn('🚨 Circuito ABIERTO. Demasiados fallos. Redirigiendo a modo Offline.');
  }
}