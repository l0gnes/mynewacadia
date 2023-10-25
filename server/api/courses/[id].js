import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(
    async (event) => {
        const supa = await serverSupabaseClient(event);
        const courseIdSearch = getRouterParam(event, "id");

        const {data, error} = await supa.from("courses")
            .select(`
                *,
                sections ( *, professors!inner( * ) )
            `)
            .eq("course_id", courseIdSearch)
            .maybeSingle()

        return data;
    }
)