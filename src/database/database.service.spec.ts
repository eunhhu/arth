import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import * as fs from 'fs';
import Database from 'better-sqlite3';
import { getConfig } from 'src/lib/util';

// Mock dependencies
jest.mock('fs');
jest.mock('better-sqlite3');
jest.mock('src/lib/util', () => ({
  getConfig: jest.fn(),
}));

const mockGetConfig = getConfig as jest.Mock;
const mockFsExistsSync = fs.existsSync as jest.Mock;
const mockFsReaddirSync = fs.readdirSync as jest.Mock;
const mockFsRmSync = fs.rmSync as jest.Mock;
const mockFsMkdirSync = fs.mkdirSync as jest.Mock; // Though not directly used by service, good to have if tests expand

const mockDbInstance = {
  prepare: jest.fn(),
  close: jest.fn(),
};
const mockDbStatement = {
  all: jest.fn(),
  get: jest.fn(),
  run: jest.fn(),
};

(Database as unknown as jest.Mock).mockImplementation(() => mockDbInstance);
mockDbInstance.prepare.mockImplementation(() => mockDbStatement);

describe('DatabaseService', () => {
  let service: DatabaseService;
  const testDbDir = '/test-db-dir';

  beforeEach(async () => {
    jest.clearAllMocks();

    mockGetConfig.mockReturnValue(testDbDir);

    // Default mock implementations
    mockFsExistsSync.mockReturnValue(true); // Assume DB file exists by default for 'open'
    mockDbInstance.prepare.mockReturnValue(mockDbStatement); // Default prepare returns a statement

    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseService],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDatabases', () => {
    it('should return a list of database names', () => {
      mockFsReaddirSync.mockReturnValue(['db1.sqlite', 'db2.sqlite', 'config.txt']);
      const dbs = service.getDatabases();
      expect(mockFsReaddirSync).toHaveBeenCalledWith(testDbDir);
      expect(dbs).toEqual(['db1', 'db2']);
    });
  });

  describe('getCollections', () => {
    it('should return a list of collection names for a database', () => {
      mockFsExistsSync.mockReturnValue(true); // DB file exists
      mockDbStatement.all.mockReturnValue([{ name: 'col1' }, { name: 'col2' }]);
      const collections = service.getCollections('testDb');
      expect(Database).toHaveBeenCalledWith(`${testDbDir}/testDb.sqlite`);
      expect(mockDbInstance.prepare).toHaveBeenCalledWith("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
      expect(mockDbStatement.all).toHaveBeenCalled();
      expect(mockDbInstance.close).toHaveBeenCalled();
      expect(collections).toEqual(['col1', 'col2']);
    });

    it('should throw if database file does not exist', () => {
      mockFsExistsSync.mockReturnValue(false);
      expect(() => service.getCollections('nonExistentDb')).toThrow('Database not found');
    });
  });

  describe('getDocuments', () => {
    const dbName = 'myDb';
    const collectionName = 'myCollection';
    const mockDocs = [{ _id: '1', data: '{"name":"doc1"}' }, { _id: '2', data: '{"name":"doc2"}' }];
    const parsedDocs = [{name: "doc1"}, {name: "doc2"}];


    it('should return documents from a collection', () => {
      mockFsExistsSync.mockReturnValue(true); // For open() and hasTable
      mockDbStatement.get.mockReturnValue({ name: collectionName }); // For hasTable
      mockDbStatement.all.mockReturnValue(mockDocs.map(d => ({ id: d._id, data: d.data })));

      const documents = service.getDocuments(dbName, collectionName);

      expect(Database).toHaveBeenCalledWith(`${testDbDir}/${dbName}.sqlite`);
      expect(mockDbInstance.prepare).toHaveBeenCalledWith(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`);
      expect(mockDbStatement.get).toHaveBeenCalledWith(collectionName); // from hasTable
      expect(mockDbInstance.prepare).toHaveBeenCalledWith(`SELECT id, data FROM ${collectionName}`);
      expect(mockDbStatement.all).toHaveBeenCalled();
      expect(documents).toEqual(parsedDocs);
      expect(mockDbInstance.close).toHaveBeenCalledTimes(1); // ensure db is closed
    });

    it('should throw if collection not found', () => {
      mockFsExistsSync.mockReturnValue(true);
      mockDbStatement.get.mockReturnValue(null); // Simulate collection not found in hasTable
      expect(() => service.getDocuments(dbName, 'nonExistentCollection')).toThrow('Collection not found');
      expect(mockDbInstance.close).toHaveBeenCalledTimes(1);
    });

    it('should sort documents if sort options are provided', () => {
        mockFsExistsSync.mockReturnValue(true);
        mockDbStatement.get.mockReturnValue({ name: collectionName }); // For hasTable
        const unsortedDocs = [ { data: '{"name":"Charlie", "age":30}' }, { data: '{"name":"Alice", "age":20}' }, { data: '{"name":"Bob", "age":25}' }];
        const expectedSortedDocs = [ {name:"Alice", age:20}, {name:"Bob", age:25}, {name:"Charlie", age:30}];
        mockDbStatement.all.mockReturnValue(unsortedDocs);

        const documents = service.getDocuments(dbName, collectionName, { sortField: 'age', sortOrder: 'asc' });
        expect(documents).toEqual(expectedSortedDocs);
    });

    it('should limit and skip documents if options are provided', () => {
        mockFsExistsSync.mockReturnValue(true);
        mockDbStatement.get.mockReturnValue({ name: collectionName }); // For hasTable
        const allDocs = [ { data: '{"id":"1"}' }, { data: '{"id":"2"}' }, { data: '{"id":"3"}' }, { data: '{"id":"4"}' }];
        const expectedDocs = [JSON.parse(allDocs[1].data)]; // Skip 1, Limit 1
        mockDbStatement.all.mockReturnValue(allDocs);

        const documents = service.getDocuments(dbName, collectionName, { skip: 1, limit: 1 });
        expect(documents).toEqual(expectedDocs);
    });
  });

  describe('getDocument', () => {
    const dbName = 'myDb';
    const collectionName = 'myCollection';
    const docId = '123';
    const mockDocData = { name: 'testDoc' };

    it('should return a single document by id', () => {
      mockFsExistsSync.mockReturnValue(true);
      mockDbStatement.get.mockReturnValueOnce({ name: collectionName }); // For hasTable
      mockDbStatement.get.mockReturnValueOnce({ data: JSON.stringify(mockDocData) }); // For actual getDocument call

      const document = service.getDocument(dbName, collectionName, docId);

      expect(mockDbInstance.prepare).toHaveBeenCalledWith(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`); // hasTable
      expect(mockDbInstance.prepare).toHaveBeenCalledWith(`SELECT data FROM ${collectionName} WHERE id = ?`);
      expect(mockDbStatement.get).toHaveBeenCalledWith(docId);
      expect(document).toEqual(mockDocData);
      expect(mockDbInstance.close).toHaveBeenCalledTimes(1);
    });

    it('should throw if document not found', () => {
      mockFsExistsSync.mockReturnValue(true);
      mockDbStatement.get.mockReturnValueOnce({ name: collectionName }); // For hasTable
      mockDbStatement.get.mockReturnValueOnce(null); // Simulate document not found
      expect(() => service.getDocument(dbName, collectionName, 'nonExistentId')).toThrow('Document not found');
      expect(mockDbInstance.close).toHaveBeenCalledTimes(1);
    });

    it('should throw if collection not found', () => {
        mockFsExistsSync.mockReturnValue(true);
        mockDbStatement.get.mockReturnValue(null); // hasTable returns false
        expect(() => service.getDocument(dbName, "badCollection", docId)).toThrow('Collection not found');
        expect(mockDbInstance.close).toHaveBeenCalledTimes(1);
    });

    it('should throw if document data is invalid JSON', () => {
        mockFsExistsSync.mockReturnValue(true);
        mockDbStatement.get.mockReturnValueOnce({ name: collectionName }); // For hasTable
        mockDbStatement.get.mockReturnValueOnce({ data: "invalid json" });
        expect(() => service.getDocument(dbName, collectionName, docId)).toThrow('Invalid document');
        expect(mockDbInstance.close).toHaveBeenCalledTimes(1);
    });
  });

  describe('createDatabase', () => {
    it('should create a database file if it does not exist', () => {
      mockFsExistsSync.mockReturnValue(false);
      service.createDatabase('newDb');
      expect(mockFsExistsSync).toHaveBeenCalledWith(`${testDbDir}/newDb.sqlite`);
      expect(Database).toHaveBeenCalledWith(`${testDbDir}/newDb.sqlite`);
      expect(mockDbInstance.close).toHaveBeenCalled();
    });

    it('should throw if database already exists', () => {
      mockFsExistsSync.mockReturnValue(true);
      expect(() => service.createDatabase('existingDb')).toThrow('Database already exists');
    });
  });

  describe('createCollection', () => {
    const dbName = 'myDb';
    const newCollectionName = 'newCollection';

    it('should create a collection table if it does not exist', () => {
      mockFsExistsSync.mockReturnValue(true); // DB exists
      mockDbStatement.get.mockReturnValue(null); // Collection does not exist (from hasTable)

      service.createCollection(dbName, newCollectionName);

      expect(mockDbInstance.prepare).toHaveBeenCalledWith(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`);
      expect(mockDbStatement.get).toHaveBeenCalledWith(newCollectionName);
      expect(mockDbInstance.prepare).toHaveBeenCalledWith(`CREATE TABLE IF NOT EXISTS ${newCollectionName} (id TEXT PRIMARY KEY, data TEXT)`);
      expect(mockDbStatement.run).toHaveBeenCalled();
      expect(mockDbInstance.close).toHaveBeenCalled();
    });

    it('should throw if collection already exists', () => {
      mockFsExistsSync.mockReturnValue(true);
      mockDbStatement.get.mockReturnValue({ name: newCollectionName }); // Collection exists
      expect(() => service.createCollection(dbName, newCollectionName)).toThrow('Collection already exists');
      expect(mockDbInstance.close).toHaveBeenCalled();
    });
  });

  describe('createDocument', () => {
    const dbName = 'myDb';
    const collectionName = 'myCollection';
    const docData = { key: 'value' };

    it('should create a document with a generated id', () => {
      mockFsExistsSync.mockReturnValue(true);
      mockDbStatement.get.mockReturnValue({ name: collectionName }); // Collection exists
      const expectedId = Date.now().toString(); // Approximate, timing dependent
      jest.spyOn(Date, 'now').mockReturnValue(parseInt(expectedId));


      service.createDocument(dbName, collectionName, docData);

      expect(mockDbInstance.prepare).toHaveBeenCalledWith(`INSERT INTO ${collectionName} (id, data) VALUES (?, ?)`);
      expect(mockDbStatement.run).toHaveBeenCalledWith(expectedId, JSON.stringify({ ...docData, _id: expectedId }));
      expect(mockDbInstance.close).toHaveBeenCalled();
    });

    it('should create a document with a provided id', () => {
      mockFsExistsSync.mockReturnValue(true);
      mockDbStatement.get.mockReturnValue({ name: collectionName }); // Collection exists
      const providedId = 'customId123';

      service.createDocument(dbName, collectionName, docData, providedId);

      expect(mockDbStatement.run).toHaveBeenCalledWith(providedId, JSON.stringify({ ...docData, _id: providedId }));
    });

    it('should throw if document already exists (duplicate id)', () => {
      mockFsExistsSync.mockReturnValue(true);
      mockDbStatement.get.mockReturnValue({ name: collectionName }); // Collection exists
      mockDbStatement.run.mockImplementation(() => {
        const error = new Error('UNIQUE constraint failed: myCollection.id');
        // Simulate better-sqlite3 error for UNIQUE constraint
        (error as any).code = 'SQLITE_CONSTRAINT_PRIMARYKEY';
        throw error;
      });

      expect(() => service.createDocument(dbName, collectionName, docData, 'existingId')).toThrow('Document already exists');
      expect(mockDbInstance.close).toHaveBeenCalled();
    });

    it('should throw if collection not found', () => {
        mockFsExistsSync.mockReturnValue(true);
        mockDbStatement.get.mockReturnValue(null); // collection does not exist
        expect(() => service.createDocument(dbName, "badCollection", docData)).toThrow("Collection not found");
        expect(mockDbInstance.close).toHaveBeenCalled();
    });
  });

  describe('updateDocument', () => {
    const dbName = 'myDb';
    const collectionName = 'myCollection';
    const docId = '123';
    const docData = { key: 'updatedValue' };

    it('should update an existing document', () => {
      mockFsExistsSync.mockReturnValue(true);
      mockDbStatement.get.mockReturnValue({ name: collectionName }); // Collection exists
      mockDbStatement.run.mockReturnValue({ changes: 1 }); // Simulate 1 row updated

      service.updateDocument(dbName, collectionName, docId, docData);

      expect(mockDbInstance.prepare).toHaveBeenCalledWith(`UPDATE ${collectionName} SET data = ? WHERE id = ?`);
      expect(mockDbStatement.run).toHaveBeenCalledWith(JSON.stringify({ ...docData, _id: docId }), docId);
      expect(mockDbInstance.close).toHaveBeenCalled();
    });

    it('should throw if document to update is not found', () => {
      mockFsExistsSync.mockReturnValue(true);
      mockDbStatement.get.mockReturnValue({ name: collectionName }); // Collection exists
      mockDbStatement.run.mockReturnValue({ changes: 0 }); // Simulate 0 rows updated

      expect(() => service.updateDocument(dbName, collectionName, 'nonExistentId', docData)).toThrow('Document not found');
      expect(mockDbInstance.close).toHaveBeenCalled();
    });
  });

  describe('deleteDatabase', () => {
    it('should delete the database file if it exists', () => {
      mockFsExistsSync.mockReturnValue(true);
      service.deleteDatabase('dbToDelete');
      expect(mockFsExistsSync).toHaveBeenCalledWith(`${testDbDir}/dbToDelete.sqlite`);
      expect(mockFsRmSync).toHaveBeenCalledWith(`${testDbDir}/dbToDelete.sqlite`);
    });

    it('should throw if database to delete does not exist', () => {
      mockFsExistsSync.mockReturnValue(false);
      expect(() => service.deleteDatabase('nonExistentDb')).toThrow('Database not found');
    });
  });

  describe('deleteCollection', () => {
    const dbName = 'myDb';
    const collectionName = 'collectionToDelete';

    it('should drop the collection table if it exists', () => {
      mockFsExistsSync.mockReturnValue(true); // DB exists
      mockDbStatement.get.mockReturnValue({ name: collectionName }); // Collection exists

      service.deleteCollection(dbName, collectionName);

      expect(mockDbInstance.prepare).toHaveBeenCalledWith(`DROP TABLE IF EXISTS ${collectionName}`);
      expect(mockDbStatement.run).toHaveBeenCalled();
      expect(mockDbInstance.close).toHaveBeenCalled();
    });

    it('should throw if collection to delete does not exist', () => {
      mockFsExistsSync.mockReturnValue(true);
      mockDbStatement.get.mockReturnValue(null); // Collection does not exist
      expect(() => service.deleteCollection(dbName, 'nonExistentCollection')).toThrow('Collection not found');
      expect(mockDbInstance.close).toHaveBeenCalled();
    });
  });

  describe('deleteDocument', () => {
    const dbName = 'myDb';
    const collectionName = 'myCollection';
    const docId = 'docToDelete';

    it('should delete a document if it exists', () => {
      mockFsExistsSync.mockReturnValue(true);
      mockDbStatement.get.mockReturnValue({ name: collectionName }); // Collection exists
      mockDbStatement.run.mockReturnValue({ changes: 1 }); // 1 row deleted

      service.deleteDocument(dbName, collectionName, docId);

      expect(mockDbInstance.prepare).toHaveBeenCalledWith(`DELETE FROM ${collectionName} WHERE id = ?`);
      expect(mockDbStatement.run).toHaveBeenCalledWith(docId);
      expect(mockDbInstance.close).toHaveBeenCalled();
    });

    it('should throw if document to delete is not found', () => {
      mockFsExistsSync.mockReturnValue(true);
      mockDbStatement.get.mockReturnValue({ name: collectionName }); // Collection exists
      mockDbStatement.run.mockReturnValue({ changes: 0 }); // 0 rows deleted

      expect(() => service.deleteDocument(dbName, collectionName, 'nonExistentId')).toThrow('Document not found');
      expect(mockDbInstance.close).toHaveBeenCalled();
    });
  });

  // Tests for appendDocument, appendDocuments, deleteFields, deleteAllFields, searchDocuments
  // would require more intricate setups, potentially spying on other service methods or more complex mock return values.
  // For example, appendDocument calls getDocument and updateDocument.
  describe('appendDocument', () => {
    const dbName = 'myDb';
    const collectionName = 'myCollection';
    const docId = 'docToAppend';
    const existingData = { name: 'Original', count: 1 };
    const newData = { count: 2, newField: 'added' };
    const expectedData = { name: 'Original', count: 2, newField: 'added', _id: docId };

    it('should append data to an existing document', () => {
      // Mock getDocument
      const getDocumentSpy = jest.spyOn(service, 'getDocument').mockResolvedValueOnce(existingData as any);
      // Mock updateDocument
      const updateDocumentSpy = jest.spyOn(service, 'updateDocument').mockResolvedValueOnce(undefined);

      service.appendDocument(dbName, collectionName, docId, newData);

      expect(getDocumentSpy).toHaveBeenCalledWith(dbName, collectionName, docId);
      expect(updateDocumentSpy).toHaveBeenCalledWith(dbName, collectionName, docId, expectedData);
    });
  });

  describe('searchDocuments', () => {
    const dbName = 'myDb';
    const collectionName = 'myCollection';
    const field = 'status';
    const value = 'active';
    const allDocs = [
      { id: '1', status: 'active', data: 'first' },
      { id: '2', status: 'inactive', data: 'second' },
      { id: '3', status: 'active', data: 'third' },
    ];
    const expectedDocs = [
      { id: '1', status: 'active', data: 'first' },
      { id: '3', status: 'active', data: 'third' },
    ];

    it('should filter documents based on field and value', () => {
      const getDocumentsSpy = jest.spyOn(service, 'getDocuments').mockReturnValue(allDocs);
      const results = service.searchDocuments(dbName, collectionName, field, value);
      expect(getDocumentsSpy).toHaveBeenCalledWith(dbName, collectionName);
      expect(results).toEqual(expectedDocs);
    });
  });

});
