import { serverSupabaseClient } from "#supabase/server"

export default defineEventHandler(
    async (event) => {
        const supa = await serverSupabaseClient(event);
        const sectionId = parseInt(getRouterParam(event, 'id'));

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

        const {count: n} = await supa.from('events')
            .delete({count: 'exact'})
            .eq('event_type', 0)
            .eq('for_user', udat.user.id)
            .eq('section_id', sectionId);

        return n

    }
);