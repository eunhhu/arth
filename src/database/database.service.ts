import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getConfig } from 'src/lib/util';

@Injectable()
export class DatabaseService {
    private readonly dbDir:string = getConfig("db");

    getDatabases() {
        const r = readdirSync(this.dbDir);
        return r;
    }

    getCollections(db:string) {
        const path = join(this.dbDir, db);
        if(existsSync(path)) {
            const r = readdirSync(path);
            return r;
        } else throw new Error("Database not found");
    }

    getDocuments(db:string, collection:string, options?:{ limit?:number, skip?:number, sortField?: string, sortOrder?: 'asc' | 'desc' }) {
        const path = join(this.dbDir, db, collection);
        if(existsSync(path)) {
            let whole = readdirSync(path).map(f => f.replace(".json", "")).map(id => this.getDocument(db, collection, id));
            if(options.sortField && options.sortOrder) {
                whole = whole.sort((a, b) => {
                    if(options.sortOrder === "asc") {
                        return a[options.sortField] > b[options.sortField] ? 1 : -1;
                    } else {
                        return a[options.sortField] < b[options.sortField] ? 1 : -1;
                    }
                });
            }
            if(options.skip) whole = whole.slice(options.skip);
            if(options.limit) whole = whole.slice(0, options.limit);
            return whole;
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

    searchDocuments(db:string, collection:string, field:string, value:string) {
        const path = join(this.dbDir, db, collection);
        if(existsSync(path)) {
            return readdirSync(path).map(f => f.replace(".json", ""))
            .map(id => this.getDocument(db, collection, id))
            .filter(doc => doc[field] === value);
        } else throw new Error("Collection not found");
    }

    createDatabase(name:string) {
        const path = join(this.dbDir, name);
        if(!existsSync(path)) {
            return mkdirSync(path);
        } else throw new Error("Database already exists");
    }

    createCollection(db:string, name:string) {
        const dbpath = join(this.dbDir, db);
        if(!existsSync(dbpath)) throw new Error("Database not found");
        const path = join(dbpath, name);
        if(!existsSync(path)) {
            return mkdirSync(path);
        } else throw new Error("Collection already exists");
    }

    createDocument(db:string, collection:string, data:Record<string, any>, id?:string) {
        if(!id) id = Date.now().toString();
        data = { ...data, _id: id };
        const path = join(this.dbDir, db, collection, `${id}.json`);
        if(!existsSync(path)) {
            writeFileSync(path, JSON.stringify(data, null, 2));
        } else throw new Error("Document already exists");
    }

    appendDocument(db:string, collection:string, id:string, data:Record<string, any>) {
        const path = join(this.dbDir, db, collection, `${id}.json`);
        if(!existsSync(path)) {
            const prev = readFileSync(path, "utf-8");
            try{
                const prevData = JSON.parse(prev);
                writeFileSync(path, JSON.stringify({ ...prevData, ...data }, null, 2));
            } catch(e) {
                throw new Error("Invalid document");
            }
        } else throw new Error("Document not found");
    }

    appendDocuments(db:string, collection:string, data:Record<string, any>[]) {
        const path = join(this.dbDir, db, collection);
        if(existsSync(path)) {
            readdirSync(path).forEach(f => {
                this.appendDocument(db, collection, f.replace(".json", ""), data);
            });
        } else throw new Error("Collection not found");
    }

    updateDocument(db:string, collection:string, id:string, data:Record<string, any>) {
        const path = join(this.dbDir, db, collection, `${id}.json`);
        if(existsSync(path)) {
            writeFileSync(path, JSON.stringify(data, null, 2));
        } else throw new Error("Document not found");
    }

    deleteFields(db:string, collection:string, id:string, fields:string[]) {
        const path = join(this.dbDir, db, collection, `${id}.json`);
        if(existsSync(path)) {
            const prev = readFileSync(path, "utf-8");
            try{
                const prevData = JSON.parse(prev);
                fields.forEach(f => delete prevData[f]);
                writeFileSync(path, JSON.stringify(prevData, null, 2));
            } catch(e) {
                throw new Error("Invalid document");
            }
        } else throw new Error("Document not found");
    }

    deleteAllFields(db:string, collection:string, fields:string[]) {
        const path = join(this.dbDir, db, collection);
        if(existsSync(path)) {
            readdirSync(path).forEach(f => {
                this.deleteFields(db, collection, f.replace(".json", ""), fields);
            });
        } else throw new Error("Collection not found");
    }

    deleteDatabase(name:string) {
        const path = join(this.dbDir, name);
        if(existsSync(path)) {
            rmSync(path, { recursive: true });
        } else throw new Error("Database not found");
    }

    deleteCollection(db:string, name:string) {
        const path = join(this.dbDir, db, name);
        if(existsSync(path)) {
            rmSync(path, { recursive: true });
        } else throw new Error("Collection not found");
    }

    deleteDocument(db:string, collection:string, id:string) {
        const path = join(this.dbDir, db, collection, `${id}.json`);
        if(existsSync(path)) {
            rmSync(path);
        } else throw new Error("Document not found");
    }
}
