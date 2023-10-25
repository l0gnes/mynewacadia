import {serverSupabaseClient} from '#supabase/server';

function checkForSubjects(supaQuery, params)
{
    let temp = supaQuery;

    if (Array.isArray(params))
    {
        temp.in('department', params);
    }
    else{
        temp = temp.or(`department.eq.${params}`);
    }

    return temp
}

export default defineEventHandler(
    async (event) => {
        const supa = await serverSupabaseClient(event);
        const params = getQuery(event);



        if(event.method === "GET")
        {
            
            let query = supa.from('courses')
                .select("*, sections ( * )");

            if (params.dept)
            {
                query = checkForSubjects(query, params.dept);
            }

            const {data, error} = await query;

            return data

        }

    }
)