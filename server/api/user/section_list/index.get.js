import {serverSupabaseClient} from '#supabase/server';

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

        const {data : sectionData, err: sectionDErr} = await supa.from('events')
            .select('section_id')
            .eq('event_type', 0)
            .eq('for_user', udat.user.id);

        if(!sectionDErr)
        {
            return sectionData.map((o) => o.section_id);
        }

    }
)