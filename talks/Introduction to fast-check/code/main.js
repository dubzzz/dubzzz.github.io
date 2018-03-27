const assert = require('assert');
const fc = require('fast-check');

const mysort = (arr, cmp) => arr.sort(cmp);
const count = (arr, value) => arr.filter(v => v === value).length;

describe('mysort', () => {
    it('should contain the same items', () => fc.assert(fc.property(
        fc.array(fc.integer()),
        (data) => {
            const sorted = mysort(data.slice(0), (a, b) => a-b);
            assert.equal(sorted.length, data.length);
            for (const item of data)
                assert.equal(count(sorted, item), count(data, item));
        }
    )));
    it('should produce ordered array', () => fc.assert(fc.property(
        fc.array(fc.integer()),
        (data) => {
            const sorted = mysort(data, (a, b) => a-b);
            for (let idx = 1 ; idx < sorted.length ; ++idx)
                assert.ok(sorted[idx-1] <= sorted[idx]);
        }
    )));
    it('should be stable', () => fc.assert(fc.property(
        fc.array(fc.integer()),
        (data) => {
            const sorted = mysort(data.map((v, idx) => [v, idx]), (a, b) => a[0]-b[0]);
            for (let idx = 1 ; idx < sorted.length ; ++idx)
                if (sorted[idx-1][0] === sorted[idx][0])
                    assert.ok(sorted[idx-1][1] <= sorted[idx][1]);
        }
    )));
});
