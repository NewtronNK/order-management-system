import { applyDecorators, Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

export function ControllerWithGuard(prefix: string) {
  return applyDecorators(
    Controller(prefix),
    UseGuards(JwtAuthGuard)
  );
}
