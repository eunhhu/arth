import { BadRequestException, Body, Controller, Delete, Get, Patch, Post, Put, Query } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller("api/db")
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get("dbs")
  getDatabases() {
    return this.databaseService.getDatabases();
  }

  @Get("cols")
  getCollections(@Query("db") db:string) {
    try{
      return this.databaseService.getCollections(db);
    } catch(e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get("docs")
  getDocuments(
    @Query("db") db:string,
    @Query("col") collection:string,
    @Query("limit") limit?:number,
    @Query("skip") skip?:number,
    @Query("sortField") sortField?: string,
    @Query("sortOrder") sortOrder: 'asc' | 'desc' = 'asc'
  ) {
    try{
      return this.databaseService.getDocuments(db, collection, { limit, skip, sortField, sortOrder });
    } catch(e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get("doc")
  getDocument(@Query("db") db:string, @Query("col") collection:string, @Query("id") id:string) {
    try{
      return this.databaseService.getDocument(db, collection, id);
    } catch(e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get("docs/search")
  searchDocuments(
    @Query("db") db: string,
    @Query("col") collection: string,
    @Query("field") field: string,
    @Query("value") value: string
  ) {
    try{
      return this.databaseService.searchDocuments(db, collection, field, value);
    } catch(e) {
      throw new BadRequestException(e.message);
    }
  }

  @Put("db")
  createDatabase(@Body("name") name:string) {
    try{
      return this.databaseService.createDatabase(name);
    } catch(e) {
      throw new BadRequestException(e.message);
    }
  }

  @Put("col")
  createCollection(@Body("db") db:string, @Body("name") name:string) {
    try{
      return this.databaseService.createCollection(db, name);
    } catch(e) {
      throw new BadRequestException(e.message);
    }
  }

  @Put("doc")
  createDocument(@Body("db") db:string, @Body("col") collection:string, @Body("data") data:Record<string, any>, @Body("id") id?:string) {
    try{
      return this.databaseService.createDocument(db, collection, data, id);
    } catch(e) {
      throw new BadRequestException(e.message);
    }
  }

  @Patch("doc")
  appendDocument(@Body("db") db:string, @Body("col") collection:string, @Body("id") id:string, @Body("data") data:Record<string, any>) {
    try{
      return this.databaseService.appendDocument(db, collection, id, data);
    } catch(e) {
      throw new BadRequestException(e.message);
    }
  }

  @Patch("docs")
  appendDocuments(@Body("db") db:string, @Body("col") collection:string, @Body("data") data:Record<string, any>[]) {
    try{
      return this.databaseService.appendDocuments(db, collection, data);
    } catch(e) {
      throw new BadRequestException(e.message);
    }
  }

  @Patch("doc/update")
  updateDocument(@Body("db") db:string, @Body("col") collection:string, @Body("id") id:string, @Body("data") data:Record<string, any>) {
    try{
      return this.databaseService.updateDocument(db, collection, id, data);
    } catch(e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete("doc/fields")
  deleteFields(@Body("db") db:string, @Body("col") collection:string, @Body("id") id:string, @Body("fields") fields:string[]) {
    try{
      return this.databaseService.deleteFields(db, collection, id, fields);
    } catch(e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete("docs/fields")
  deleteFieldsAll(@Body("db") db:string, @Body("col") collection:string, @Body("fields") fields:string[]) {
    try{
      return this.databaseService.deleteAllFields(db, collection, fields);
    } catch(e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete("db")
  deleteDatabase(@Query("name") name:string) {
    try{
      return this.databaseService.deleteDatabase(name);
    } catch(e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete("col")
  deleteCollection(@Query("db") db:string, @Query("name") name:string) {
    try{
      return this.databaseService.deleteCollection(db, name);
    } catch(e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete("doc")
  deleteDocument(@Query("db") db:string, @Query("col") collection:string, @Query("id") id:string) {
    try{
      return this.databaseService.deleteDocument(db, collection, id);
    } catch(e) {
      throw new BadRequestException(e.message);
    }
  }
}
