import { describe, it, expect } from 'vitest';
import { LOCALES, TOPICS, itemsFor } from '$lib/quiz/topics.js';

describe('quiz topic data', () => {
  it('exposes the seven topics with metadata', () => {
    expect(Object.keys(TOPICS).sort()).toEqual(
      ['animals', 'clothes', 'colorshapes', 'food', 'instruments', 'toys', 'vehicles'].sort()
    );
    for (const topic of Object.values(TOPICS)) {
      expect(topic.id).toBeTruthy();
      expect(topic.titleKey).toBeTruthy();
      expect(topic.icon).toBeTruthy();
      expect(topic.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('every topic has at least 12 items', () => {
    for (const topic of Object.values(TOPICS)) {
      expect(topic.items.length, topic.id).toBeGreaterThanOrEqual(12);
    }
  });

  it('emojis are unique within a topic', () => {
    for (const topic of Object.values(TOPICS)) {
      const emojis = topic.items.map((i) => i.emoji);
      expect(new Set(emojis).size, topic.id).toBe(emojis.length);
    }
  });

  it('every item has a non-empty name in every locale', () => {
    for (const topic of Object.values(TOPICS)) {
      for (const item of topic.items) {
        for (const loc of LOCALES) {
          expect(item[loc], `${topic.id} ${item.emoji} missing ${loc}`).toBeTruthy();
        }
      }
    }
  });

  it('names are unique within each topic and locale', () => {
    for (const topic of Object.values(TOPICS)) {
      for (const loc of LOCALES) {
        const names = topic.items.map((i) => i[loc]);
        expect(new Set(names).size, `${topic.id} ${loc}`).toBe(names.length);
      }
    }
  });

  it('itemsFor returns the topic items and [] for unknown topics', () => {
    expect(itemsFor('animals')).toBe(TOPICS.animals.items);
    expect(itemsFor('nope')).toEqual([]);
  });
});
