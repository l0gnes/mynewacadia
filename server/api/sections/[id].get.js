import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(
    async (event) => {
        const supa = await serverSupabaseClient(event);
        const section_id = parseInt(getRouterParam(event, "id"));

        const {data, error} = await supa.from("sections")
            .select("*, course : courses ( * )")
            .eq("section_id", section_id)
            .maybeSingle();

        return data;
    }
)