import CrawlModel from "./base.model"
import { Calendar, ResponseCalendar, Response } from "../interfaces"

class CrawlCalendar extends CrawlModel {
    private static readonly HostName: string = "http://112.137.129.115/tkb/listbylist.php";

    constructor() {
        super(
            CrawlCalendar.HostName, 0, "",
            new Map<string, string>()
        )
    }

    /**
     * Convert from "n-m" to [n,m].
     * 
     * @param data input
     * @returns Array<number>
     */
    private parseLesson(data: string): Array<number> {
        return data.split("-").map(item => Number(item));
    }

    /**
     * @override
     * Parse data to correct form.
     * 
     * @param data 
     * @returns 
     */
    protected parse(data: string): ResponseCalendar {
        const rowContents: string[] = data.match(/<tr(.|\n)*?tr>/g)?.slice(4) || [];

        const rowData: Calendar[] = rowContents.map(item => {

            // Expose item data
            const colContents: string[] = item.match(/<td(.|\n)*?td>/g) || [];
            const data: string[] = colContents.map(content =>
                content.match(/>(.|\n)*?</g)![0].slice(1, -1));

            // Convert
            if (data.length == 12) {
                return {
                    index: Number(data[0]),
                    courseSubjectID: data[1],
                    courseSubjectName: data[2],
                    courseCredits: Number(data[3]),
                    courseSubjectClassID: data[4],
                    teacherName: data[5],
                    studentCount: Number(data[6]),
                    lessonOfDay: data[7],
                    day: data[8],
                    lessons: this.parseLesson(data[9]),
                    amphitheater: data[10],
                    courseGroup: data[11],
                }
            } else throw new Error("Cannot parsing");
        });

        return {
            length: rowData.length,
            data: rowData
        }
    }

    /**
    * Endpoint model.
    * @returns {Promise<Response<ResponseCalendar>>}
    */

    public async getCalendar(): Promise<Response<ResponseCalendar>> {
        return this.parseResponse<ResponseCalendar>(await this.fetch()) as
            Response<ResponseCalendar>;
    }
}

export default CrawlCalendar;