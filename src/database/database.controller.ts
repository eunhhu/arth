import { Controller } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller("api/db")
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}
}
