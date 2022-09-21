import CrawlModel from "../src/models/base.model"
import { Query, Response } from "../src/interfaces"
import * as test1Result from "./resource/test1.json"

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

    public testParseResponse<T>(fetchedData: Response<string>, handle?: (data: string) => T): Response<T | object> {
        return this.parseResponse<T>(fetchedData, handle);
    }
}

describe("Test base crawler class", () => {
    test("Test constructor", () => {
        expect(() => {
            const test: Test = new Test("a", 10, "100", new Map<string, string>);
        }).toThrow(Error("Unknown host"));

        expect(() => {
            const test: Test = new Test("https://google.com.vn", -1, "100", new Map<string, string>);
        }).toThrow(Error("Must be greater than or equal zero (unset)"));

        expect((() => {
            const test: Test = new Test("https://google.com.vn", 0, "100", new Map<string, string>);

            return test.host + "\n"
                + test.limit + "\n"
                + test.semesterID + "\n"
                + test.map;
        })()).toBe("https://google.com.vn\n0\n100\n[object Map]");
    });

    test("Test fetching data 1", async () => {
        const map: Map<string, string> = new Map(Object.entries({
            "a": "b"
        }));

        const test: Test = new Test("http://112.137.129.87/qldt/as", 0, "100", map);
        const data = await test.testFetch({ a: "this is a test" });
        expect(data).toStrictEqual({
            status: 500,
            data: "",
            message: "Request failed with status code 404"
        })
    });

    test("Test fetching data 2", async () => {
        const map: Map<string, string> = new Map(Object.entries({
            "a": "b"
        }));

        const test: Test = new Test("https://example.com/", 0, "100", map);
        const data = await test.testFetch({ a: "this is a test" });

        expect(data).toStrictEqual({
            status: test1Result.status,
            data: test1Result.data,
            message: test1Result.message
        })
    });

    test("Test fetching data 3", async () => {
        const map: Map<string, string> = new Map(Object.entries({
            "a": "b"
        }));

        const test: Test = new Test("https://example.com/", 0, "100", map);
        const data = await test.testFetch({ a: "this is a test" });
        const ans = test.testParseResponse<any>(data);

        expect(ans).toStrictEqual({
            status: 200,
            data: {},
            message: "success"
        })
    });

    test("Test fetching data 4", async () => {
        const map: Map<string, string> = new Map(Object.entries({
            "a": "b"
        }));

        const testFuncFilter = (_data: string): object => {
            return {}
        }

        const test: Test = new Test("https://example.com/", 0, "100", map);
        const data = await test.testFetch({ a: "this is a test" });

        const ans = test.testParseResponse<object>(data, testFuncFilter);

        expect(ans).toStrictEqual({
            status: 200,
            data: {},
            message: "success"
        })
    });

    test("Test fetching data 5", async () => {
        const map: Map<string, string> = new Map(Object.entries({
            "a": "b"
        }));

        const testFuncFilter = (_data: string): object => {
            throw new Error("I don't know why");
            return {}
        }

        const test: Test = new Test("https://example.com/", 0, "100", map);
        const data = await test.testFetch({ a: "this is a test" });

        const ans = test.testParseResponse<object>(data, testFuncFilter);

        expect(ans).toStrictEqual({
            status: 400,
            data: {},
            message: "I don't know why"
        })
    });

    test("Test fetching data 6", async () => {
        const map: Map<string, string> = new Map(Object.entries({
            "a": "b"
        }));

        const testFuncFilter = (_data: string): object => {
            throw new Error("I don't know why");
            return {}
        }

        const test: Test = new Test("http://112.137.129.87/qldt/as", 0, "100", map);
        const data: Response<string> = {
            status: 400,
            data: "aka",
            message: "I don't know why"
        }

        const ans = test.testParseResponse<object>(data, testFuncFilter);

        expect(ans).toStrictEqual({
            status: 400,
            data: {},
            message: "I don't know why"
        })
    });
})