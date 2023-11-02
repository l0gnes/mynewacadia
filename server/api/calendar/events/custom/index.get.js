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

        // This basically is just to not return the user id
        const {data: edat, error: eerr} = await supa.from('events')
            .select("event_id, event_type, custom_metadata, days, start_time, end_time")
            .eq('event_type', 1)
            .eq('for_user', udat.user.id);

        return edat;
    }
)