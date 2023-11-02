import { serverSupabaseClient } from "#supabase/server"

export default defineEventHandler(
    async (event) => {
        const supa = await serverSupabaseClient(event);
        const eventIDParam = parseInt(getRouterParam(event, 'id'));

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

        // Try to find the event
        const {data : authIdConf, error: authIdErr} = await supa.from('events')
            .select('event_id')
            .eq('for_user', udat.user.id)
            .eq('event_id', eventIDParam);

        
        // If no event is found assoc. with the user, raise a 403
        if(!authIdConf)
        {
            return createError({
                statusCode: 403,
                statusMessage: "Event not found"
            });
        }
        
            
        // Actually delete the event
        const {error: remErr} = await supa.from('events')
            .delete()
            .eq('event_id', eventIDParam)
            .eq('for_user', udat.user.id);
            
        // If there are no errors, return 200
        if(!remErr)
        {
            return {"statusCode" : 200, "statusMessage" : "Event removed!"}
        }


    }
)