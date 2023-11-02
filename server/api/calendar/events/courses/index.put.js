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

        // Read the request body
        const body = await readBody(event);

        // Grab the section_id from the query body
        const section_id = parseInt(body.section_id);

        // Selecting the data which we will be pushing into the `events` table
        const {data: cdat, error : cerr} = await supa.from('sections')
            .select('section_id, start_time, end_time, days')
            .eq('section_id', section_id)
            .maybeSingle();

        // If there is an error or no data is returned
        if(cerr || !cdat)
        {
            return createError({
                statusCode: 404,
                statusMessage: "Course not found!",
            });
        }

        // Ensure that there is only once instance of the section for this user
        const {data: dupDat} = await supa.from('events')
            .select('section_id')
            .eq('for_user', udat.user.id)
            .eq('section_id', section_id)
            .maybeSingle();

        if(dupDat !== null)
        {
            return createApp({
                statusCode: 401,
                statusMessage: "User is already enrolled in this section"
            });
        }

        // Inserting the course data into events
        const {error: inerr} = await supa.from('events')
            .insert({
                for_user: udat.user.id,
                event_type: 0,
                section_id: cdat.section_id,
                days: cdat.days,
                start_time: cdat.start_time,
                end_time: cdat.end_time
            });

        if(!inerr)
        {
            return {"statusCode" : 200, "statusMessage" : "Enrolled Successfully!"}
        }

    }
)