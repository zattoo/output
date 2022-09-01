const {combineBody} = require('../utils');

describe('CombineBody', () => {
    it('returns the the combined text', () => {
        const res = combineBody({
            name: 'bar',
            previousBody: 'foo',
            outputText: 'bar',
        });
        expect(JSON.stringify(res)).toBe(JSON.stringify('foo\n<!-- output start - bar -->\nbar\n<!-- output end - bar -->'));
    });

    it('replaces the comment with a new one.', () => {
        const res = combineBody({
            name: 'bar',
            previousBody: 'bar\n\n<!-- output start - bar -->\nbar\n<!-- output end - bar -->',
            outputText: 'baz',
        });
        expect(JSON.stringify(res)).toBe(JSON.stringify('bar\n\n\n<!-- output start - bar -->\nbaz\n<!-- output end - bar -->'));
    });

    it('replaces the comment with a new one while having content after', () => {
        const res = combineBody({
            name: 'bar',
            previousBody: 'bar\n\n<!-- output start - bar -->\nbar\n<!-- output end - bar -->\n\nzap',
            outputText: 'baz',
        });
        expect(JSON.stringify(res)).toBe(JSON.stringify('bar\n\n\n<!-- output start - bar -->\nbaz\n<!-- output end - bar -->\n\nzap'));
    });
});
