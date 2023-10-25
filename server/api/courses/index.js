import {serverSupabaseClient} from '#supabase/server';

function checkForSubjects(supaQuery, params)
{

    if(!params)
    {
        return params;
    }

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

function checkForSearch(supaQuery, params)
{
    if(!params)
    {
        return supaQuery;
    }

    let temp = supaQuery;

    temp.ilike("title", `%${params}%`);

    return temp;

}

export default defineEventHandler(
    async (event) => {
        const supa = await serverSupabaseClient(event);
        const params = getQuery(event);



        if(event.method === "GET")
        {
            
            let query = supa.from('courses')
                .select("*, sections ( * )");

            // Department filtering
            if (params.dept)
                { query = checkForSubjects(query, params.dept); }

            // Search filtering
            if (params.search)
                { query = checkForSearch(query, params.search); }

            const {data, error} = await query;

            return data;

        }

    }
)