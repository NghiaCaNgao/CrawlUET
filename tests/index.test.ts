import { add } from '../src/index';

describe('testing index file', () => {
    test('empty string should result in zero', () => {
        expect(add('')).toBe(0);
    });

    test('empty string should result in zero', () => {
        expect(() => {
            add("[1,2,4,-5]");
        }).toThrow(RangeError('Negatives are not allowed: -5'));
    });
});