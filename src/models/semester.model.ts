import { Semester, ResponseSemester, Response } from "../interfaces";
import CrawlModel from "./base.model";

class CrawlSemester extends CrawlModel {
    private static readonly HostName: string = "http://112.137.129.87/qldt/";

    constructor() {
        super(CrawlSemester.HostName, 0, "", new Map<string, string>());
    }

    /**
    * @override
    * Parse data to correct form.
    * @param data 
    * @returns 
    */
    protected parse(data: string): ResponseSemester {
        const raw_1: string = data.match(/<select(.|\n)*?select>/g)![0];
        const raw_2: string[] = raw_1.match(/<option(.|\n)*?option>/g)?.slice(1) || [];

        const item: Semester[] = raw_2.map((item: string) => ({
            id: item.match(/"\d*"/g)![0].slice(1, -1),
            value: item.match(/>.*</g)![0].slice(1, -1)
        }));

        return {
            length: raw_2.length,
            data: item
        }
    }

    /**
    * Endpoint model.
    * @returns {Promise<Response<ResponseSemester>>} response
    */
    public async getSemesters(): Promise<Response<ResponseSemester>> {
        return this.parseResponse<ResponseSemester>(await this.fetch()) as
            Response<ResponseSemester>;
    }
}

export default new CrawlSemester();