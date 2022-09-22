export interface Course {
    index?: number,
    studentID?: string,
    studentName?: string,
    studentDateBirth?: Date,
    studentOfficialClass?: string,
    courseSubjectID?: number,
    courseSubjectClassID?: string,
    courseSubjectName?: string,
    courseGroup?: string,
    courseCredits?: number,
    courseNote?: string,
    semesterID?: string,
}

export interface Calendar {
    index?: number,
    courseSubjectID?: string,
    courseSubjectName?: string,
    courseCredits?: number,
    courseSubjectClassID?: string,
    teacherName?: string,
    studentCount?: number,
    lessonOfDay?: string,
    day?: string,
    lessons?: Array<Number>,
    amphitheater?: string,
    courseGroup?: string,
    semesterID?: number
}

export interface Semester {
    id: string,
    value: string
}

export interface Query { }

export interface QueryCourse extends Query, Course {
    page?: number,
    limit?: number
}

export interface QueryCalendar extends Query, Calendar { }

export interface ResponseSemester {
    length: number
    data: Semester[]
}

export interface ResponseCalendar {
    length: number
    data: Calendar[]
}

export interface RespondCourse {
    length: number
    data?: Course[],
    totalPage: number,
    page: number
}

export interface Response<T = any> {
    status: number;
    data: T;
    message: string;
    config?: any
}