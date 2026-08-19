import {
  SEASON_1_DATASET,
  getSeason1MappedAchievements,
  getMockActiveMissions,
  type ActiveMissionsResponse,
} from "@/data/season1Data";
import mockMissionsData from "@/data/mockMissionsData.json";

export async function handleApiV1Request(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();

  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // GET /api/v1/missions or /api/v1/missions/payload
  if ((path === "/api/v1/missions" || path === "/api/v1/missions/payload") && method === "GET") {
    return new Response(
      JSON.stringify({
        status: "success",
        data: mockMissionsData,
      }),
      { status: 200, headers: corsHeaders },
    );
  }

  // 1. GET /api/v1/missions/active
  if (path === "/api/v1/missions/active" && method === "GET") {
    const data = getMockActiveMissions();
    return new Response(
      JSON.stringify({
        status: "success",
        data,
      }),
      { status: 200, headers: corsHeaders },
    );
  }

  // 2. POST /api/v1/missions/claim-mastery
  if (path === "/api/v1/missions/claim-mastery" && method === "POST") {
    let body: { type?: "daily" | "weekly" | "seasonal"; userId?: string } = {};
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          status: "error",
          code: "INVALID_JSON_BODY",
          message:
            "Request body must be valid JSON containing 'type' ('daily', 'weekly', or 'seasonal').",
        }),
        { status: 400, headers: corsHeaders },
      );
    }

    const { type } = body;
    if (!type || !["daily", "weekly", "seasonal"].includes(type)) {
      return new Response(
        JSON.stringify({
          status: "error",
          code: "INVALID_MASTERY_TYPE",
          message: "Field 'type' is required and must be one of: 'daily', 'weekly', 'seasonal'.",
        }),
        { status: 400, headers: corsHeaders },
      );
    }

    const masteryRewards = SEASON_1_DATASET.masteryRewards;
    const rewardConfig = masteryRewards[type];

    const result = {
      status: "success",
      message: `${type.toUpperCase()} Mastery Bonus successfully claimed!`,
      data: {
        type,
        xpGranted: rewardConfig.xp,
        itemGranted: rewardConfig.item,
        titleGranted: rewardConfig.title,
        claimedAt: new Date().toISOString(),
      },
    };

    return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders });
  }

  // 3. GET /api/v1/achievements/season1
  if (path === "/api/v1/achievements/season1" && method === "GET") {
    const achievements = getSeason1MappedAchievements();
    const totalCount = achievements.length;
    const unlockedCount = achievements.filter((a) => a.unlocked).length;

    return new Response(
      JSON.stringify({
        status: "success",
        seasonId: SEASON_1_DATASET.seasonId,
        seasonName: SEASON_1_DATASET.seasonName,
        meta: {
          totalAchievements: totalCount,
          unlockedAchievements: unlockedCount,
          completionPercentage: Math.round((unlockedCount / totalCount) * 100),
          durationDays: SEASON_1_DATASET.durationDays,
        },
        data: achievements,
      }),
      { status: 200, headers: corsHeaders },
    );
  }

  // 4. GET /api/v1/community/season-meter
  // TODO backend: replace getSeasonMeter() (localStorage) with a real aggregate query
  // across all players this week. Response shape is the contract the client already
  // expects — see CommunityMeterState in src/services/communityMeters.ts.
  if (path === "/api/v1/community/season-meter" && method === "GET") {
    const { getSeasonMeter } = await import("@/services/communityMeters");
    return new Response(JSON.stringify({ status: "success", data: getSeasonMeter() }), {
      status: 200,
      headers: corsHeaders,
    });
  }

  // 5. GET /api/v1/community/warchest-meter
  // TODO backend: same as above, aggregated from verified external_boost_submitted /
  // donation_contributed events across all players this week.
  if (path === "/api/v1/community/warchest-meter" && method === "GET") {
    const { getWarchestMeter } = await import("@/services/communityMeters");
    return new Response(JSON.stringify({ status: "success", data: getWarchestMeter() }), {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Fallback for unmatched /api/v1 routes
  if (path.startsWith("/api/v1/")) {
    return new Response(
      JSON.stringify({
        status: "error",
        code: "ROUTE_NOT_FOUND",
        message: `Endpoint ${method} ${path} was not recognized. Available routes: GET /api/v1/missions/active, POST /api/v1/missions/claim-mastery, GET /api/v1/achievements/season1, GET /api/v1/community/season-meter, GET /api/v1/community/warchest-meter`,
      }),
      { status: 404, headers: corsHeaders },
    );
  }

  return null;
}
