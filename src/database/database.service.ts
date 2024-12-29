import { Injectable } from '@nestjs/common';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getConfig } from 'src/lib/util';

@Injectable()
export class DatabaseService {
    private readonly dbDir:string = getConfig("db");

    getDatabases() {
        return readdirSync(this.dbDir);
    }

    getCollections(name:string) {
        const path = join(this.dbDir, name);
        if(existsSync(path)) {
            return readdirSync(path);
        } else throw new Error("Database not found");
    }

    getDocuments(db:string, collection:string) {
        const path = join(this.dbDir, db, collection);
        if(existsSync(path)) {
            return readdirSync(path).map(f => f.replace(".json", ""));
        } else throw new Error("Collection not found");
    }

    getDocument(db:string, collection:string, id:string) {
        const path = join(this.dbDir, db, collection, `${id}.json`);
        if(existsSync(path)) {
            try{
                return JSON.parse(readFileSync(path).toString());
            } catch(e) {
                throw new Error("Invalid document");
            }
        } else throw new Error("Document not found");
    }

    createDatabase(name:string) {
        const path = join(this.dbDir, name);
        if(!existsSync(path)) {
            return path;
        } else throw new Error("Database already exists");
    }

    createCollection(db:string, name:string) {
        const path = join(this.dbDir, db, name);
        if(!existsSync(path)) {
            return path;
        } else throw new Error("Collection already exists");
    }

    createDocument(db:string, collection:string, data:any, id?:string) {
        if(!id) id = Date.now().toString();
        data = { ...data, _id: id };
        const path = join(this.dbDir, db, collection, `${id}.json`);
        if(!existsSync(path)) {
            writeFileSync(path, JSON.stringify(data, null, 2));
        } else throw new Error("Document already exists");
    }
}
