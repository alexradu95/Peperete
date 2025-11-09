import { describe, it, expect, beforeEach } from 'vitest';
import { MaterialRegistry } from './MaterialRegistry';

describe('MaterialRegistry', () => {
  beforeEach(() => {
    // Clear registry before each test
    MaterialRegistry.materials.clear();
    MaterialRegistry.categories.clear();
  });

  describe('register', () => {
    it('should register a valid material', () => {
      const material = {
        id: 'test-material',
        name: 'Test Material',
        category: 'test',
        component: () => null,
        props: {},
        audioReactive: false,
        description: 'A test material'
      };

      MaterialRegistry.register(material);

      const registered = MaterialRegistry.get('test-material');
      expect(registered).toEqual(material);
    });

    it('should allow null component for basic materials', () => {
      const material = {
        id: 'basic-material',
        name: 'Basic Material',
        category: 'basic',
        component: null,
        props: {},
        audioReactive: false,
        description: 'Basic material'
      };

      MaterialRegistry.register(material);

      const registered = MaterialRegistry.get('basic-material');
      expect(registered).toEqual(material);
    });

    it('should not register material with missing required fields', () => {
      const invalidMaterial = {
        id: 'invalid',
        name: 'Invalid'
        // missing category
      };

      MaterialRegistry.register(invalidMaterial);

      const registered = MaterialRegistry.get('invalid');
      expect(registered).toBeNull();
    });

    it('should not register material with undefined component', () => {
      const material = {
        id: 'test',
        name: 'Test',
        category: 'test',
        // component is undefined
      };

      MaterialRegistry.register(material);

      const registered = MaterialRegistry.get('test');
      expect(registered).toBeNull();
    });
  });

  describe('get', () => {
    it('should return null for non-existent material', () => {
      const material = MaterialRegistry.get('non-existent');
      expect(material).toBeNull();
    });

    it('should return registered material', () => {
      const testMaterial = {
        id: 'test',
        name: 'Test',
        category: 'test',
        component: () => null
      };

      MaterialRegistry.register(testMaterial);

      const retrieved = MaterialRegistry.get('test');
      expect(retrieved.id).toBe('test');
      expect(retrieved.name).toBe('Test');
    });
  });

  describe('getAll', () => {
    it('should return empty array when no materials registered', () => {
      const materials = MaterialRegistry.getAll();
      expect(materials).toEqual([]);
    });

    it('should return all registered materials', () => {
      MaterialRegistry.register({ id: 'mat1', name: 'Material 1', category: 'test', component: null });
      MaterialRegistry.register({ id: 'mat2', name: 'Material 2', category: 'test', component: null });

      const materials = MaterialRegistry.getAll();
      expect(materials).toHaveLength(2);
      expect(materials.map(m => m.id)).toContain('mat1');
      expect(materials.map(m => m.id)).toContain('mat2');
    });
  });

  describe('getAllByCategory', () => {
    it('should group materials by category', () => {
      MaterialRegistry.register({ id: 'basic1', name: 'Basic 1', category: 'basic', component: null });
      MaterialRegistry.register({ id: 'basic2', name: 'Basic 2', category: 'basic', component: null });
      MaterialRegistry.register({ id: 'animated1', name: 'Animated 1', category: 'animated', component: null });

      const byCategory = MaterialRegistry.getAllByCategory();

      expect(byCategory.basic).toHaveLength(2);
      expect(byCategory.animated).toHaveLength(1);
      expect(byCategory.basic.map(m => m.id)).toContain('basic1');
      expect(byCategory.basic.map(m => m.id)).toContain('basic2');
      expect(byCategory.animated[0].id).toBe('animated1');
    });

    it('should return empty object when no materials registered', () => {
      const byCategory = MaterialRegistry.getAllByCategory();
      expect(byCategory).toEqual({});
    });
  });

  describe('getByCategory', () => {
    it('should return materials for specific category', () => {
      MaterialRegistry.register({ id: 'basic1', name: 'Basic 1', category: 'basic', component: null });
      MaterialRegistry.register({ id: 'animated1', name: 'Animated 1', category: 'animated', component: null });

      const basicMaterials = MaterialRegistry.getByCategory('basic');
      expect(basicMaterials).toHaveLength(1);
      expect(basicMaterials[0].id).toBe('basic1');
    });

    it('should return empty array for non-existent category', () => {
      const materials = MaterialRegistry.getByCategory('non-existent');
      expect(materials).toEqual([]);
    });
  });
});
