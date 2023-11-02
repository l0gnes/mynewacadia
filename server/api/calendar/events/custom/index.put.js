import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

// PUT /api/calendar/events/custom || Requires Body
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

        // Read the request body
        const body = await readBody(event);

        // This is yikes
        const {error : inerr} = await supa.from('events')
            .insert(
                {
                    for_user: udat.user.id,
                    event_type: 1,
                    section_id: null,
                    custom_metadata: {"name" : body.name},
                    days: body.days,
                    start_time: body.start_time,
                    end_time: body.end_time
                }
            );

        if(!inerr)
        {
            return {"statusCode": 200, "statusMessage" : "Event Created!"}
        }

    }
)