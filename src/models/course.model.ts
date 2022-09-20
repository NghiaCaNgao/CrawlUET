
import CrawlModel from './base.model';
import semesterObject from "./semester.model"
import * as moment from 'moment'
import {
    Course, RespondCourse, QueryCourse, Response
} from "../interfaces";


class CrawlCourse extends CrawlModel {
    private static readonly HostName: string = "http://112.137.129.87/qldt/";

    constructor() {
        super(
            CrawlCourse.HostName, 5000, "035",
            new Map<string, string>(Object.entries({
                "studentID": "SinhvienLmh[masvTitle]",
                "studentName": "SinhvienLmh[hotenTitle]",
                "studentDateBirth": "SinhvienLmh[ngaysinhTitle]",
                "studentOfficialClass": "SinhvienLmh[lopkhoahocTitle]",
                "courseSubjectClassID": "SinhvienLmh[tenlopmonhocTitle]",
                "courseSubjectName": "SinhvienLmh[tenmonhocTitle]",
                "courseGroup": "SinhvienLmh[nhom]",
                "courseCredits": "SinhvienLmh[sotinchiTitle]",
                "courseNote": "SinhvienLmh[ghichu]",
                "semesterID": "SinhvienLmh[term_id]",
                "page": "SinhvienLmh_page",
                "limit": "pageSize"
            }))
        )
    }

    /**
     * @override
     * Parse data to correct form.
     * @param data 
     * @returns 
     */
    protected parse(data: string): RespondCourse {

        // Count page
        const totalContent = Number(
            data.match(/summary.*?</g)![0]
                .match(/(\d)+/g)![2]);

        const currentPage = Math.floor(Number(
            data.match(/summary.*?</g)![0]
                .match(/(\d)+/g)![1]) / this.limit) + 1;

        const totalPage = (totalContent % this.limit === 0)
            ? totalContent / this.limit
            : Math.floor(totalContent / this.limit) + 1;

        //Parse data
        const rowContents: string[] = data.match(/<tr(.|\n)*?tr>/g)?.slice(2) || [];
        const rowData: Course[] = rowContents.map(item => {

            // Expose item data
            const colContents: string[] = item.match(/<td(.|\n)*?td>/g) || [];
            const data = colContents.map(content =>
                content.match(/>(.|\n)*?</g)![0].slice(1, -1));

            // Convert
            if (data.length == 11) {
                return {
                    index: Number(data[0]),
                    studentID: data[1],
                    studentName: data[2],
                    studentDateBirth: moment(data[3], "DD-MM-YYYY").toDate(),
                    studentOfficialClass: data[4],
                    courseSubjectClassID: data[5],
                    courseSubjectName: data[6],
                    courseGroup: data[7],
                    courseCredits: Number(data[8]),
                    courseNote: data[9],
                    semesterID: data[10]
                }
            } else throw new Error("Can not parsing")
        });

        return {
            length: rowData.length,
            data: rowData,
            totalPage: totalPage,
            page: currentPage
        }
    }

    /**
     * Endpoint model.
     * @returns 
     */
    public async getCourse(): Promise<Response<Response<RespondCourse>[]>> {
        const semester = await semesterObject.getSemesters();
        const latestSemesterID = (semester.status === 200)
            ? semester.data.data[0].id
            : this.semesterID;

        const queryData: QueryCourse = {
            limit: this.limit,
            semesterID: latestSemesterID
        }

        const content: Response<RespondCourse>[] = [];

        // TODO: xử lý vấn đề trung lặp
        const removeDuplsFnc = {}

        function addContent(tmpData: Response<RespondCourse>) {
            content.push({
                status: tmpData.status,
                data: {
                    length: tmpData.data.length,
                    page: tmpData.data.page,
                    totalPage: tmpData.data.totalPage
                },
                message: tmpData.message,
            });
        }

        async function explore(response: Response) {
            // add response content to send to client
            addContent(response);

            // Clear data to release memory
            response.data.data = [];
        }


        try {
            const response =
                this.parseResponse<RespondCourse>(await this.fetch(queryData)) as
                Response<RespondCourse>;

            if (response.status === 200) {
                await explore(response);

                // If have more than one page, continue to explore
                if (response.data.totalPage > 1) {
                    for (let i = 2; i <= response.data.totalPage; i++) {
                        queryData.page = i;
                        const tmpData = this.parseResponse(await this.fetch(queryData));
                        if (tmpData.status === 200) explore(tmpData);
                        else throw new Error(tmpData.message);
                    }
                }

                return {
                    status: 200,
                    data: content,
                    message: "success"
                };
            } else throw new Error(response.message);
        } catch (error) {
            return {
                status: 400,
                data: [],
                message: error.message
            };
        }
    }
}

export default CrawlCourse;
