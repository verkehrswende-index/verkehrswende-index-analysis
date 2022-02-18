import Excel from "exceljs";

export default class FetchCarLicenses {
  constructor(store) {
    this.store = store;
  }

  async call() {
    ["2019", "2020"].forEach((year) => this.fetch(year));
  }

  async fetch(year) {
    var rawDataPath = `data/raw/car_licenses/de/fz3_${year}.xlsx`;

    const workBook = new Excel.Workbook();
    console.log(workBook);
    await workBook.xlsx.readFile(rawDataPath);
    const workSheet =
      workBook.getWorksheet("FZ3.1") || workBook.getWorksheet("FZ 3.1");
    var data = [];
    workSheet.eachRow((row, number) => {
      const location = row.getCell(4).value || "";
      const cars = row.getCell(6).value || "";
      const locationMatch = location.match(/^(\d{5})  (.*)$/);
      if (!locationMatch || typeof cars !== "number") {
        return;
      }
      const zip = locationMatch[1];
      const city = locationMatch[2];
      data.push({ zip, city, cars });
    });
    await this.store.write(`cache/car_licenses/data.${year}.json`, data);
  }
}
