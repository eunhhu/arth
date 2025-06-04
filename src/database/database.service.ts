import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, readdirSync, rmSync } from 'fs';
import { join } from 'path';
import Database from 'better-sqlite3';
import { getConfig } from 'src/lib/util';

@Injectable()
export class DatabaseService {
    private readonly dbDir:string = getConfig("db");

    private open(db: string) {
        const path = join(this.dbDir, `${db}.sqlite`);
        if(!existsSync(path)) throw new Error("Database not found");
        return new Database(path);
    }

    getDatabases() {
        return readdirSync(this.dbDir)
            .filter(f => f.endsWith('.sqlite'))
            .map(f => f.replace('.sqlite', ''));
    }

    getCollections(db:string) {
        const dbpath = join(this.dbDir, `${db}.sqlite`);
        if(!existsSync(dbpath)) throw new Error("Database not found");
        const database = new Database(dbpath);
        const rows = database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
        database.close();
        return rows.map(r => r.name as string);
    }

    getDocuments(db:string, collection:string, options?:{ limit?:number, skip?:number, sortField?: string, sortOrder?: 'asc' | 'desc' }) {
        const database = this.open(db);
        if(!this.hasTable(database, collection)) {
            database.close();
            throw new Error("Collection not found");
        }
        let docs = database.prepare(`SELECT id, data FROM ${collection}`).all().map(row => JSON.parse(row.data));
        database.close();
        if(options?.sortField && options?.sortOrder) {
            docs = docs.sort((a, b) => {
                if(options.sortOrder === 'asc') return a[options.sortField] > b[options.sortField] ? 1 : -1;
                else return a[options.sortField] < b[options.sortField] ? 1 : -1;
            });
        }
        if(options?.skip) docs = docs.slice(options.skip);
        if(options?.limit) docs = docs.slice(0, options.limit);
        return docs;
    }

    getDocument(db:string, collection:string, id:string) {
        const database = this.open(db);
        if(!this.hasTable(database, collection)) {
            database.close();
            throw new Error("Collection not found");
        }
        const row = database.prepare(`SELECT data FROM ${collection} WHERE id = ?`).get(id);
        database.close();
        if(row) {
            try { return JSON.parse(row.data); }
            catch { throw new Error("Invalid document"); }
        }
        throw new Error("Document not found");
    }

    searchDocuments(db:string, collection:string, field:string, value:string) {
        const docs = this.getDocuments(db, collection);
        return docs.filter(doc => doc[field] === value);
    }

    createDatabase(name:string) {
        const path = join(this.dbDir, `${name}.sqlite`);
        if(!existsSync(path)) {
            const database = new Database(path);
            database.close();
        } else throw new Error("Database already exists");
    }

    createCollection(db:string, name:string) {
        const database = this.open(db);
        if(this.hasTable(database, name)) {
            database.close();
            throw new Error("Collection already exists");
        }
        database.prepare(`CREATE TABLE IF NOT EXISTS ${name} (id TEXT PRIMARY KEY, data TEXT)`).run();
        database.close();
    }

    createDocument(db:string, collection:string, data:Record<string, any>, id?:string) {
        const database = this.open(db);
        if(!this.hasTable(database, collection)) {
            database.close();
            throw new Error("Collection not found");
        }
        if(!id) id = Date.now().toString();
        data = { ...data, _id: id };
        const stmt = database.prepare(`INSERT INTO ${collection} (id, data) VALUES (?, ?)`);
        try {
            stmt.run(id, JSON.stringify(data));
        } catch {
            database.close();
            throw new Error("Document already exists");
        }
        database.close();
    }

    appendDocument(db:string, collection:string, id:string, data:Record<string, any>) {
        const prev = this.getDocument(db, collection, id);
        const newDoc = { ...prev, ...data };
        this.updateDocument(db, collection, id, newDoc);
    }

    appendDocuments(db:string, collection:string, data:Record<string, any>[]) {
        const docs = this.getDocuments(db, collection);
        docs.forEach(d => this.appendDocument(db, collection, d._id, data));
    }

    updateDocument(db:string, collection:string, id:string, data:Record<string, any>) {
        const database = this.open(db);
        if(!this.hasTable(database, collection)) {
            database.close();
            throw new Error("Collection not found");
        }
        const stmt = database.prepare(`UPDATE ${collection} SET data = ? WHERE id = ?`);
        const res = stmt.run(JSON.stringify({ ...data, _id: id }), id);
        database.close();
        if(res.changes === 0) throw new Error("Document not found");
    }

    deleteFields(db:string, collection:string, id:string, fields:string[]) {
        const prev = this.getDocument(db, collection, id);
        fields.forEach(f => delete prev[f]);
        this.updateDocument(db, collection, id, prev);
    }

    deleteAllFields(db:string, collection:string, fields:string[]) {
        const docs = this.getDocuments(db, collection);
        docs.forEach(d => this.deleteFields(db, collection, d._id, fields));
    }

    deleteDatabase(name:string) {
        const path = join(this.dbDir, `${name}.sqlite`);
        if(existsSync(path)) {
            rmSync(path);
        } else throw new Error("Database not found");
    }

    deleteCollection(db:string, name:string) {
        const database = this.open(db);
        if(!this.hasTable(database, name)) {
            database.close();
            throw new Error("Collection not found");
        }
        database.prepare(`DROP TABLE IF EXISTS ${name}`).run();
        database.close();
    }

    deleteDocument(db:string, collection:string, id:string) {
        const database = this.open(db);
        if(!this.hasTable(database, collection)) {
            database.close();
            throw new Error("Collection not found");
        }
        const res = database.prepare(`DELETE FROM ${collection} WHERE id = ?`).run(id);
        database.close();
        if(res.changes === 0) throw new Error("Document not found");
    }

    private hasTable(db: Database, name: string) {
        const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(name);
        return !!row;
    }
}
