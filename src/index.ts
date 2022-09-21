import CrawlModel from "./models/base.model";
import { Query, Response } from "../src/interfaces"

class Test extends CrawlModel {
    constructor(host: string, limit: number, semesterID: string, map: Map<string, string>) {
        super(host, limit, semesterID, map);
    }

    protected parse(data: string): object {
        return {}
    }

    public async testFetch(query: Query = {}): Promise<Response<string>> {
        return await this.fetch(query);
    }
}

(async function abc() {
    const map: Map<string, string> = new Map(Object.entries({
        "a": "b"
    }));

    const test: Test = new Test("http://112.137.129.87/qldt/as", 0, "100", map);
    const data = await test.testFetch({ a: "asdasda" });

    console.log(data);
})();

