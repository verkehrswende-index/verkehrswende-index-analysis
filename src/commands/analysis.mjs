import PQueue from 'p-queue';
import delay from 'delay';
import process from 'process';

/**
 * Command to run an analysis.
 */
export default class Analysis {
  constructor(list, store, areas) {
    this.list = list;
    this.store = store;
    this.areas = areas;
  }

  /**
   * Runs the command.
   *
   * @param {Object} params - Command parameters.
   * @param {string} params.analysis - Analysis to run.
   * @param {string[]} [params.areas] - Areas to consider.
   * @param {string} params.extractDate - Date of the extract to use.
   * @param {bool} [params.useCache] - Use cached intermediate values, default false.
   */
  async call(params) {
    const queue = new PQueue({concurrency: 1});
    var analysis = params.analysis;
    var areas = await this.areas.getAll();
    console.log(areas.length, "known areas");
    for (const areaX of areas) {
      const area = await this.areas.getArea(areaX.getSlug());
      if (params.areas && ! params.areas.includes(area.getSlug())) {
        continue;
      }
      queue.add(async () => {
        console.log("Analysing", area.name);
        if (! params.useCache) {
          if (this.list[analysis].refresh) {
            await this.list[analysis].refresh(area, {extractDate: params.extractDate});
          }
        }
        await this.list[analysis].start(area, {extractDate: params.extractDate});
        console.log("Done Analysing", area.name);
      });
    }
    while (queue.size) {
      process.stdout.write("\r\x1b[K");
      process.stdout.write(queue.size + " jobs running");
      await delay(1000);
    }
  };
}
