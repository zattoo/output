const {combineBody} = require('../utils');

describe('CombineBody', () => {
    it('returns the the combined text', () => {
        const res = combineBody('foo', 'bar');
        expect(JSON.stringify(res)).toBe(JSON.stringify('foo\n\n<!-- output start -->\nbar\n<!-- output end -->'));
    });

    it('replaces the comment with a new one.', () => {
        const res = combineBody('bar\n\n<!-- output start -->\nbar\n<!-- output end -->', 'baz');
        expect(JSON.stringify(res)).toBe(JSON.stringify('bar\n\n<!-- output start -->\nbaz\n<!-- output end -->'));
    });

    it('replaces the comment with a new one while having content after', () => {
        const res = combineBody('bar\n\n<!-- output start -->\nbar\n<!-- output end -->\n\nzap', 'baz');
        expect(JSON.stringify(res)).toBe(JSON.stringify('bar\n\n<!-- output start -->\nbaz\n<!-- output end -->\n\nzap'));
    });
});
