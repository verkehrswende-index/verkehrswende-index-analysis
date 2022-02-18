import nodeFetch from "node-fetch";

export default class Fetcher {
  fetch(url, args = {}) {
    args.headers = {
      ...args.headers,
      "User-Agent":
        "Verkehrswende-Index Analyser / https://verkehrswende-index.de/",
    };
    return nodeFetch(url, args);
  }
}
