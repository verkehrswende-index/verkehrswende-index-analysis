import Filter from "./filter.js";

test("", () => {
  var filter = new Filter();
  var way = {
    properties: {
      "cycleway:left": "lane",
    },
  };
  expect(
    filter.match(way, [
      {
        tag: "cycleway:left",
      },
    ])
  ).toBe(true);
  expect(
    filter.match(way, [
      {
        tag: "cycleway:left",
        value: "lane",
      },
    ])
  ).toBe(true);

  expect(
    filter.match(way, [
      {
        tag: "cycleway:left",
        value: null,
      },
    ])
  ).toBe(false);

  expect(
    filter.match(way, [
      {
        tag: "notag",
        value: null,
      },
    ])
  ).toBe(true);
  expect(
    filter.match(way, [
      {
        and: [
          [
            {
              tag: "cycleway:left",
              value: "lane",
            },
          ],
          [
            {
              tag: "notag",
              value: null,
            },
          ],
        ],
      },
    ])
  ).toBe(true);
  expect(
    filter.match(way, [
      {
        and: [
          [
            {
              tag: "notag",
              value: "foo",
            },
          ],
          [
            {
              tag: "notag",
              value: null,
            },
          ],
        ],
      },
    ])
  ).toBe(false);
});
