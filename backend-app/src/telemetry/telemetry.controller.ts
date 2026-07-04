import { Body, Controller, Get, Post, Headers, UnauthorizedException } from '@nestjs/common';
import { TelemetryService, TrackEventDto } from './telemetry.service';

// Emails de admin que pueden ver el resumen de analytics
const ADMIN_EMAILS = ['admin@fluxsql.dev'];

@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  /**
   * POST /telemetry/event
   * Recibe eventos de telemetría desde el desktop (Tauri) o cualquier cliente.
   * Acepta llamadas sin autenticación para sesiones anónimas.
   */
  @Post('event')
  async trackEvent(@Body() body: TrackEventDto) {
    await this.telemetryService.trackEvent({
      userId: body.userId ?? null,
      platform: body.platform,
      event: body.event,
      metadata: body.metadata ?? {},
    });
    return { ok: true };
  }

  /**
   * GET /telemetry/summary
   * Devuelve el resumen de métricas para el dashboard de analytics.
   * Requiere header x-admin-email con un email de admin.
   */
  @Get('summary')
  async getSummary(@Headers('x-admin-email') adminEmail: string) {
    if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail)) {
      throw new UnauthorizedException('Acceso denegado: no eres admin.');
    }
    return this.telemetryService.getSummary();
  }
}
