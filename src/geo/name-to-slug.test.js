import NameToSlug from "./name-to-slug";

test("Test slug generation", () => {
  var nameToSlug = new NameToSlug();
  expect(nameToSlug.getSlug("foo/bar Foo (Bär) /ß fOO ä-öü")).toBe(
    "foo_bar_foo_baer_ss_foo_ae-oeue"
  );
});
