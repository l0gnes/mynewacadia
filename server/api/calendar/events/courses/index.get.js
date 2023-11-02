import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(
    async (event) => {
        const supa = await serverSupabaseClient(event);

        // Get the user
        const {
            data : udat,
            error: uerr
        } = await supa.auth.getUser();

        // If there is no data logged in, then raise an error
        if(!udat.user)
        {
            return createError({
                statusCode: 401,
                statusMessage: "You must be signed in to do this"
            })
        }

        // I know this isn't the cleanest way of doing it but I cba to figure out a better way rn
        const {data: edat, error: eerr} = await supa.from('events')
            .select("event_id, event_type, section_id, days, start_time, end_time, course: sections ( courses ( * ) )")
            .eq('event_type', 0)
            .eq('for_user', udat.user.id);

        return edat;
    }
)