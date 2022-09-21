import axios from "axios";
import { Query, Response } from "../interfaces"

export default abstract class CrawlModel {
    private readonly HostRegex: RegExp =
        new RegExp(
            "^https?:\/\/(www\.)?"
            + "[-a-zA-Z0-9@:%._\+~#=]{1,256}\."
            + "[a-zA-Z0-9()]{1,6}([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$");

    private _host: string = "";
    private _limit: number = 0;
    private _semesterID: string = "";
    private _map: Map<string, string> = new Map<string, string>;

    public get host(): string {
        return this._host;
    }

    public set host(host: string) {
        if (host.match(this.HostRegex)) {
            this._host = host;
        } else throw new Error("Unknown host");
    }

    public get limit(): number {
        return this._limit;
    }

    public set limit(limit: number) {
        if (limit >= 0) {
            this._limit = limit;
        } else throw new Error("Must be greater than or equal zero (unset)");
    }

    public get semesterID(): string {
        return this._semesterID;
    }

    public set semesterID(semesterID: string) {
        this._semesterID = semesterID;
    }

    public get map(): Map<string, string> {
        return this._map;
    }

    public set map(map: Map<string, string>) {
        this._map = map;
    }

    constructor(host: string, limit: number, semesterID: string, map: Map<string, string>) {
        this.host = host;
        this.limit = limit;
        this.semesterID = semesterID;
        this.map = map;
    }

    /**
     * Create query string from query object.
     * @param {Query} query
     * @returns {string} query string
     */
    private joinParameter(query: Query = {}): string {
        return "?" + Object.keys(query)
            .map(item => this.map.get(item) + "=" + (query as any)[item!])
            .join("&");
    }

    /**
     * Fetch data with query object.
     * @param {Query} query
     * @returns {Promise<Response<string>>} 
     */
    protected async fetch(query: Query = {}): Promise<Response<string>> {
        try {
            const response = await axios.get(this.host + this.joinParameter(query));

            return {
                status: response.status,
                data: (response.status === 200) ? response.data : undefined,
                message: response.statusText
            }
        } catch (error) {
            let message = "unknown error";
            if (error instanceof Error) {
                message = error.message;
            }

            return {
                status: 500,
                data: "",
                message: message
            }
        }
    }

    /**
     * Convert data to json.
     * @param {Response<string>} fetchedData 
     * @returns {Response<T | object>}
     */
    protected parseResponse<T>(
        fetchedData: Response<string>, handle?: (data: string) => T): Response<T | object> {

        try {
            if (fetchedData.status === 200) {
                return {
                    status: 200,
                    data: (handle)
                        ? handle(fetchedData.data)
                        : this.parse(fetchedData.data),
                    message: "success"
                }
            } else throw new Error(fetchedData.message);
        } catch (error) {
            let message = "Unknown error";
            if (error instanceof Error) message = error.message;
            return {
                status: 400,
                data: {},
                message
            }
        }
    }

    /**
     * Default parser.
     * @param data 
     */
    protected abstract parse(data: string): object
}