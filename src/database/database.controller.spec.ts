import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseController } from './database.controller';
import { DatabaseService } from './database.service';
import { BadRequestException } from '@nestjs/common';

// Mock DatabaseService
const mockDatabaseService = {
  getDatabases: jest.fn(),
  getCollections: jest.fn(),
  getDocuments: jest.fn(),
  getDocument: jest.fn(),
  searchDocuments: jest.fn(),
  createDatabase: jest.fn(),
  createCollection: jest.fn(),
  createDocument: jest.fn(),
  appendDocument: jest.fn(),
  appendDocuments: jest.fn(),
  updateDocument: jest.fn(),
  deleteFields: jest.fn(),
  deleteAllFields: jest.fn(),
  deleteDatabase: jest.fn(),
  deleteCollection: jest.fn(),
  deleteDocument: jest.fn(),
};

describe('DatabaseController', () => {
  let controller: DatabaseController;
  let service: DatabaseService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatabaseController],
      providers: [
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    controller = module.get<DatabaseController>(DatabaseController);
    service = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test cases for each method
  describe('getDatabases', () => {
    it('should call service.getDatabases and return the result', () => {
      const expectedResult = ['db1', 'db2'];
      mockDatabaseService.getDatabases.mockReturnValue(expectedResult);
      expect(controller.getDatabases()).toEqual(expectedResult);
      expect(mockDatabaseService.getDatabases).toHaveBeenCalled();
    });
  });

  describe('getCollections', () => {
    const db = 'testDb';
    it('should call service.getCollections and return the result', () => {
      const expectedResult = ['col1', 'col2'];
      mockDatabaseService.getCollections.mockReturnValue(expectedResult);
      expect(controller.getCollections(db)).toEqual(expectedResult);
      expect(mockDatabaseService.getCollections).toHaveBeenCalledWith(db);
    });

    it('should throw BadRequestException if service throws', () => {
      const errorMessage = 'Service error';
      mockDatabaseService.getCollections.mockImplementation(() => {
        throw new Error(errorMessage);
      });
      expect(() => controller.getCollections(db)).toThrow(new BadRequestException(errorMessage));
    });
  });

  describe('getDocuments', () => {
    const params = { db: 'testDb', collection: 'testCol', limit: 10, skip: 0, sortField: 'name', sortOrder: 'asc' as 'asc' | 'desc' };
    it('should call service.getDocuments and return the result', () => {
      const expectedResult = [{ id: '1', name: 'doc1' }];
      mockDatabaseService.getDocuments.mockReturnValue(expectedResult);
      expect(controller.getDocuments(params.db, params.collection, params.limit, params.skip, params.sortField, params.sortOrder)).toEqual(expectedResult);
      expect(mockDatabaseService.getDocuments).toHaveBeenCalledWith(params.db, params.collection, { limit: params.limit, skip: params.skip, sortField: params.sortField, sortOrder: params.sortOrder });
    });

    it('should throw BadRequestException if service throws', () => {
      const errorMessage = 'Service error';
      mockDatabaseService.getDocuments.mockImplementation(() => {
        throw new Error(errorMessage);
      });
      expect(() => controller.getDocuments(params.db, params.collection)).toThrow(new BadRequestException(errorMessage));
    });
  });

  describe('getDocument', () => {
    const params = { db: 'testDb', collection: 'testCol', id: 'docId' };
    it('should call service.getDocument and return the result', () => {
      const expectedResult = { id: 'docId', data: 'some data' };
      mockDatabaseService.getDocument.mockReturnValue(expectedResult);
      expect(controller.getDocument(params.db, params.collection, params.id)).toEqual(expectedResult);
      expect(mockDatabaseService.getDocument).toHaveBeenCalledWith(params.db, params.collection, params.id);
    });
    it('should throw BadRequestException if service throws', () => {
      const errorMessage = 'Not found';
      mockDatabaseService.getDocument.mockImplementation(() => { throw new Error(errorMessage); });
      expect(() => controller.getDocument(params.db, params.collection, params.id))
        .toThrow(new BadRequestException(errorMessage));
    });
  });

  describe('createDatabase', () => {
    const body = { name: 'newDb' };
    it('should call service.createDatabase', () => {
      mockDatabaseService.createDatabase.mockReturnValue(undefined); // Assuming void or success message
      controller.createDatabase(body.name);
      expect(mockDatabaseService.createDatabase).toHaveBeenCalledWith(body.name);
    });
    it('should throw BadRequestException if service throws', () => {
      const errorMessage = 'DB already exists';
      mockDatabaseService.createDatabase.mockImplementation(() => { throw new Error(errorMessage); });
      expect(() => controller.createDatabase(body.name))
        .toThrow(new BadRequestException(errorMessage));
    });
  });

  describe('createCollection', () => {
    const body = { db: 'testDb', name: 'newCollection' };
    it('should call service.createCollection', () => {
      mockDatabaseService.createCollection.mockReturnValue(undefined);
      controller.createCollection(body.db, body.name);
      expect(mockDatabaseService.createCollection).toHaveBeenCalledWith(body.db, body.name);
    });
    it('should throw BadRequestException if service throws', () => {
      const errorMessage = 'Collection already exists';
      mockDatabaseService.createCollection.mockImplementation(() => { throw new Error(errorMessage); });
      expect(() => controller.createCollection(body.db, body.name))
        .toThrow(new BadRequestException(errorMessage));
    });
  });

  describe('createDocument', () => {
    const body = { db: 'testDb', col: 'testCol', data: { field: 'value' }, id: 'newDoc' };
    it('should call service.createDocument', () => {
      mockDatabaseService.createDocument.mockReturnValue(undefined);
      controller.createDocument(body.db, body.col, body.data, body.id);
      expect(mockDatabaseService.createDocument).toHaveBeenCalledWith(body.db, body.col, body.data, body.id);
    });
    it('should call service.createDocument without id if not provided', () => {
        mockDatabaseService.createDocument.mockReturnValue(undefined);
        controller.createDocument(body.db, body.col, body.data);
        expect(mockDatabaseService.createDocument).toHaveBeenCalledWith(body.db, body.col, body.data, undefined);
      });
    it('should throw BadRequestException if service throws', () => {
      const errorMessage = 'Document already exists';
      mockDatabaseService.createDocument.mockImplementation(() => { throw new Error(errorMessage); });
      expect(() => controller.createDocument(body.db, body.col, body.data, body.id))
        .toThrow(new BadRequestException(errorMessage));
    });
  });

  describe('appendDocument', () => {
    const body = { db: 'testDb', col: 'testCol', id: 'doc1', data: { newField: 'newValue' } };
    it('should call service.appendDocument', () => {
      mockDatabaseService.appendDocument.mockReturnValue(undefined);
      controller.appendDocument(body.db, body.col, body.id, body.data);
      expect(mockDatabaseService.appendDocument).toHaveBeenCalledWith(body.db, body.col, body.id, body.data);
    });
    it('should throw BadRequestException if service throws', () => {
      const errorMessage = 'Document not found for append';
      mockDatabaseService.appendDocument.mockImplementation(() => { throw new Error(errorMessage); });
      expect(() => controller.appendDocument(body.db, body.col, body.id, body.data))
        .toThrow(new BadRequestException(errorMessage));
    });
  });

  describe('updateDocument', () => {
    const body = { db: 'testDb', col: 'testCol', id: 'doc1', data: { field: 'updatedValue' } };
    it('should call service.updateDocument', () => {
      mockDatabaseService.updateDocument.mockReturnValue(undefined);
      controller.updateDocument(body.db, body.col, body.id, body.data);
      expect(mockDatabaseService.updateDocument).toHaveBeenCalledWith(body.db, body.col, body.id, body.data);
    });
    it('should throw BadRequestException if service throws', () => {
      const errorMessage = 'Document not found for update';
      mockDatabaseService.updateDocument.mockImplementation(() => { throw new Error(errorMessage); });
      expect(() => controller.updateDocument(body.db, body.col, body.id, body.data))
        .toThrow(new BadRequestException(errorMessage));
    });
  });

  describe('deleteDatabase', () => {
    const query = { name: 'dbToDelete' };
    it('should call service.deleteDatabase', () => {
      mockDatabaseService.deleteDatabase.mockReturnValue(undefined);
      controller.deleteDatabase(query.name);
      expect(mockDatabaseService.deleteDatabase).toHaveBeenCalledWith(query.name);
    });
    it('should throw BadRequestException if service throws', () => {
      const errorMessage = 'Database not found for deletion';
      mockDatabaseService.deleteDatabase.mockImplementation(() => { throw new Error(errorMessage); });
      expect(() => controller.deleteDatabase(query.name))
        .toThrow(new BadRequestException(errorMessage));
    });
  });

  describe('deleteCollection', () => {
    const query = { db: 'testDb', name: 'colToDelete' };
    it('should call service.deleteCollection', () => {
      mockDatabaseService.deleteCollection.mockReturnValue(undefined);
      controller.deleteCollection(query.db, query.name);
      expect(mockDatabaseService.deleteCollection).toHaveBeenCalledWith(query.db, query.name);
    });
    it('should throw BadRequestException if service throws', () => {
      const errorMessage = 'Collection not found for deletion';
      mockDatabaseService.deleteCollection.mockImplementation(() => { throw new Error(errorMessage); });
      expect(() => controller.deleteCollection(query.db, query.name))
        .toThrow(new BadRequestException(errorMessage));
    });
  });

  describe('deleteDocument', () => {
    const query = { db: 'testDb', col: 'testCol', id: 'docToDelete' };
    it('should call service.deleteDocument', () => {
      mockDatabaseService.deleteDocument.mockReturnValue(undefined);
      controller.deleteDocument(query.db, query.col, query.id);
      expect(mockDatabaseService.deleteDocument).toHaveBeenCalledWith(query.db, query.col, query.id);
    });
    it('should throw BadRequestException if service throws', () => {
      const errorMessage = 'Document not found for deletion';
      mockDatabaseService.deleteDocument.mockImplementation(() => { throw new Error(errorMessage); });
      expect(() => controller.deleteDocument(query.db, query.col, query.id))
        .toThrow(new BadRequestException(errorMessage));
    });
  });

  // TODO: Add tests for searchDocuments, appendDocuments, deleteFields, deleteAllFields
  // These will follow similar patterns:
  // 1. Test success: service call, correct response/return.
  // 2. Test service failure: service throws, controller throws BadRequestException.
});
