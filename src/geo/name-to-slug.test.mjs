import NameToSlug from './name-to-slug.mjs';

test('Test slug generation', () => {
  var nameToSlug = new NameToSlug();
  expect(nameToSlug.getSlug('Foo Bär fOO äöü')).toBe('foo_baer_foo_aeoeue');
});
