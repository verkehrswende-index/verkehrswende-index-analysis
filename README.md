Verkehrswende Index Analyses
====================================

Testet with NodeJS v17.

Typical usage:

* `npm run start -- --cmd=fetch-locations --extractDate=210101`
* `npm run start -- --cmd=generate-extracts --extractDate=210101`
* `npm run start -- --cmd=write-area-configs

## How to generate analyses

* Generate Open Street Map Extract
* Fetch location information
* Fetch mayors
* Run analysis
* Generate area index

### Generate Open Street Map extracts

To generate area extracts, you first have to download extracts of Germany,
Oberbayern, Ile-de-France, and Denmark (as `.osm.pbf` file). You will find
extracts e.g. at Geofabrik:
https://download.geofabrik.de/europe/germany.html
https://download.geofabrik.de/europe/germany/bayern/oberbayern.html
https://download.geofabrik.de/europe/denmark.html
https://download.geofabrik.de/europe/france/ile-de-france.html

Put the extracts in `data/raw/osm/germany-DATE.osm.pbf`,
`data/raw/osm/denmark-DATE.osm.pbf`,
`data/raw/osm/france/ile-de-france-DATE.osm.pbf` and
`data/raw/osm/germany/oberbayern-DATE.osm.pbf`, where DATE is the extract date
(as used in the `extractDate` command line parameter).

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

### Fetch location information

To get a list of all cities to consider, use the `fetch-locations` command to
extract city information from the OSM extracts. The information will be written
do `data/areas.json`.

```sh
npm run start -- --cmd=fetch-locations --extractDate=210101
```

### Fetch mayors

To try to fetch mayor information for the areas from Wikipedia, use the
`fetch-mayors` command. The information will be written do `data/mayors.json`.

```sh
npm run start -- --cmd=fetch-mayors
```

### Run analysis

To run an analysis, use the `analysis` command together with the `analysis` and
`extractDate` parameters (and possibly `areas`). The results will be written to
`data/areas/AREA_SLUG/analysis/ANALYSIS/EXTRACT_DATE/`.

```sh
npm run start -- --cmd=analysis --analysis=bike_infrastructure --extractDate=220101
```

### Generate area index

To generate the area index, use the `generate-index` command. It will write
the index to `data/index.json`.
