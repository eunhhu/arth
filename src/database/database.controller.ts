import { Controller, UseGuards } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { OriginFilterGuard } from 'src/guards/origin-filter.guard';

@Controller("api/db")
@UseGuards(OriginFilterGuard)
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}
}
