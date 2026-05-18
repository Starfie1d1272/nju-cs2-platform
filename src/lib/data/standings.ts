import "server-only";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db/client";
import { matches, teams } from "@/db/schema";
import { calculateStandings, type TeamStanding } from "@/lib/standings";

export async function getStandings(seasonId: string): Promise<TeamStanding[]> {
  const [allTeams, allMatches] = await Promise.all([
    db.query.teams.findMany({
      where: eq(teams.seasonId, seasonId),
      orderBy: [asc(teams.draftOrder)],
    }),
    db.query.matches.findMany({
      where: eq(matches.seasonId, seasonId),
      orderBy: [asc(matches.createdAt)],
    }),
  ]);

  const finished = allMatches.filter((m) => m.status === "finished");
  return calculateStandings(allTeams, finished);
}
