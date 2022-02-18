Verkehrswende Index Analyses
====================================

Testet with NodeJS v17.

Typical usage:

* `npm run start -- --cmd=generate-extracts --extractDate=210101`
* `npm run start -- --cmd=fetch-locations --extractDate=210101`
* `npm run start -- --cmd=write-area-configs

## How to generate analyses

* Generate Open Street Map Extract

### Generate Open Street Map Extracts

To generate area extracts, you first have to download an extract of Germany (as
`.osm.pbf` file). You will find extracts e.g. at Geofabrik:
https://download.geofabrik.de/europe/germany.html

Put the extract in `data/raw/osm/germany-DATE.osm.pbf`, where DATE is the
extract date (as used in the `extractDate` command line parameter).

Use the `generate-extracts` command like this:

```sh
npm run start -- --cmd=generate-extracts --extractDate=210101
```

This will generate extracts in `data/cache/osm/extracts/DATE/AREA_SLUG.osm.pbf`
and area boundaries in `data/cache/osm/boundaries/DATE/AREA_SLUG.osm.pbf`.

Use the `areas` command to only generate the extracts for some areas:

```sh
npm run start -- --cmd=generate-extracts --extractDate=210101 --areas=muenchen,trier
```
