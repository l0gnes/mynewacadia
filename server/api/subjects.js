const all_subject_codes = [
    {
        "name": "Education",
        "code": "EDUC"
    },
    {
        "name": "Kinesiology",
        "code": "KINE"
    },
    {
        "name": "Biology",
        "code": "BIOL"
    },
    {
        "name": "Mathematics and Statistics",
        "code": "MATH"
    },
    {
        "name": "History",
        "code": "HIST"
    },
    {
        "name": "English",
        "code": "ENGL"
    },
    {
        "name": "Music",
        "code": "MUSI"
    },
    {
        "name": "Political Science",
        "code": "POLS"
    },
    {
        "name": "Chemistry",
        "code": "CHEM"
    },
    {
        "name": "Business Administration",
        "code": "BUSI"
    },
    {
        "name": "Sociology",
        "code": "SOCI"
    },
    {
        "name": "Geology",
        "code": "GEOL"
    },
    {
        "name": "Psychology",
        "code": "PSYC"
    },
    {
        "name": "Biblical Studies",
        "code": "BIBL"
    },
    {
        "name": "Computer Science",
        "code": "COMP"
    },
    {
        "name": "Next Generation Ministry",
        "code": "NXGN"
    },
    {
        "name": "Pastoral Care and Counselling",
        "code": "PACC"
    },
    {
        "name": "Evangelism and Mission",
        "code": "EVAN"
    },
    {
        "name": "Theology",
        "code": "THEO"
    },
    {
        "name": "Leadership",
        "code": "LEDR"
    },
    {
        "name": "Pastoral Ministry",
        "code": "PAST"
    },
    {
        "name": "Economics",
        "code": "ECON"
    },
    {
        "name": "Nutrition",
        "code": "NUTR"
    },
    {
        "name": "Community Development",
        "code": "CODE"
    },
    {
        "name": "French",
        "code": "FRAN"
    },
    {
        "name": "Discipleship",
        "code": "DISP"
    },
    {
        "name": "Applied Science",
        "code": "APSC"
    },
    {
        "name": "Ministry",
        "code": "DMIN"
    },
    {
        "name": "Church History",
        "code": "CHUR"
    },
    {
        "name": "Physics",
        "code": "PHYS"
    },
    {
        "name": "Philosophy",
        "code": "PHIL"
    },
    {
        "name": "Interdisciplinary Studies",
        "code": "IDST"
    },
    {
        "name": "Spiritual Formation",
        "code": "SPFM"
    },
    {
        "name": "Theatre",
        "code": "THEA"
    },
    {
        "name": "Classics",
        "code": "CLAS"
    },
    {
        "name": "Greek",
        "code": "GREE"
    },
    {
        "name": "Art",
        "code": "ART"
    },
    {
        "name": "German",
        "code": "GERM"
    },
    {
        "name": "Chaplaincy",
        "code": "CHAP"
    },
    {
        "name": "Indigenous Community Develop.",
        "code": "INCD"
    },
    {
        "name": "Environmental Science",
        "code": "ENVS"
    },
    {
        "name": "Women's and Gender Studies",
        "code": "WGST"
    },
    {
        "name": "Hebrew",
        "code": "HEBR"
    },
    {
        "name": "Spanish",
        "code": "SPAN"
    },
    {
        "name": "Environ. and Sustain. Studies",
        "code": "ESST"
    },
    {
        "name": "Comparative Religion",
        "code": "CREL"
    },
    {
        "name": "Latin",
        "code": "LATI"
    },
    {
        "name": "Cooperative Education",
        "code": "COOP"
    },
    {
        "name": "Biotechnology",
        "code": "BIOT"
    },
    {
        "name": "Communications",
        "code": "COMM"
    },
    {
        "name": "Aramaic",
        "code": "ARAM"
    },
    {
        "name": "Law and Society",
        "code": "LAWS"
    },
    {
        "name": "Applied Geomatics",
        "code": "GEOM"
    },
    {
        "name": "Social and Political Thought",
        "code": "SOPT"
    },
    {
        "name": "Interdisciplinary Studies Theo",
        "code": "IDTH"
    },
    {
        "name": "Languages and Literatures",
        "code": "LANG"
    },
    {
        "name": "Mi'kmaw",
        "code": "MIKM"
    }
]

import { serverSupabaseClient } from "#supabase/server"

export default defineEventHandler(
    async (event) => {
        // Supabase :)
        const supa = await serverSupabaseClient(event);

        // Grabs all of the courses' departments, as we don't want to provide filters that don't have data assoc. with them
        const {data, error} = await supa.from("courses")
            .select("department");
        
        // Grabs a minimize list (using the set) of all of the different course codes we actually have...
        const available_codes = [... new Set(data.map((v) => v.department))];

        // The full course payload that will be sent to the front-end, minus the course count
        const course_codes_to_return = all_subject_codes.filter((v) => available_codes.includes(v.code));
        
        // Adds the course count to each of the different sections (E.g., A department may have 7 courses, this is returned in the query)
        course_codes_to_return.forEach(
            (c) => {
                c.count = data.filter((v) => (c.code === v.department)).length
            }
        )

        return course_codes_to_return


    }
)
