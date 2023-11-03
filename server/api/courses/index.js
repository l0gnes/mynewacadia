import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const supa = await serverSupabaseClient(event);
  const params = getQuery(event);

  if (event.method === "GET") {
    let query = supa.from("courses").select("*, sections ( * )");

    const filters = JSON.parse(params.filters ?? "");
    if (filters?.terms?.length === 1) {
      query = query.eq("sections.term", filters.terms[0]);
    }

    // Department filtering
    if (filters?.departments.length) {
      query = query.in("department", filters.departments);
    }

    if (filters?.dows?.length > 0) {
      query = query.containedBy("sections.days", filters.dows);
    }

    // Search filtering
    if (params.search) {
      query = query.ilike("title", `%${params.search}%`);
    }

    if (filters.startTime) {
      query = query.gte("sections.start_time", `${filters.startTime}:00`);
    }
    if (filters.endTime) {
      query = query.lte("sections.end_time", `${filters.endTime}:00`);
    }
    if (filters.professors.length) {
      query = query.in("sections.prof_id", filters.professors);
    }

    const { data, error } = await query;
    return data;
  }
});
