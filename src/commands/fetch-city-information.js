import Excel from "exceljs";

export default class FetchCityInformation {
  constructor(store) {
    this.store = store;
  }

  async call() {
    ["2019", "2020"].forEach((year) => this.fetch(year));
  }

  async fetch(year) {
    var rawDataPath = `data/raw/cities/de/gemeindeverzeichnis/${year}.xlsx`;

    const workBook = new Excel.Workbook();
    await workBook.xlsx.readFile(rawDataPath);
    const workSheet = workBook.worksheets[1];
    var data = {};
    workSheet.eachRow((row, number) => {
      var keys = [];
      for (let i = 3; i <= 7; i++) {
        keys.push(row.getCell(i).value || "");
      }
      const key = keys.join("");
      const city = row.getCell(8).value || "";
      const population = row.getCell(10).value || "";
      if (typeof population !== "number") {
        return;
      }
      data[key] = { city, population };
    });
    await this.store.write(`cache/city_information/data.${year}.json`, data);
  }
}
