package com.hnlrate.backend.service;

import com.hnlrate.backend.client.ApiFootballClient;
import com.hnlrate.backend.dto.external.FixtureGoalsDto;
import com.hnlrate.backend.dto.external.FixtureResponseItem;
import com.hnlrate.backend.dto.external.TeamResponseItem;
import com.hnlrate.backend.model.Club;
import com.hnlrate.backend.model.Match;
import com.hnlrate.backend.repository.ClubRepository;
import com.hnlrate.backend.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SyncService {

    private final ApiFootballClient apiFootballClient;
    private final ClubRepository clubRepository;
    private final MatchRepository matchRepository;

    public int syncClubs() {
        List<TeamResponseItem> teams = apiFootballClient.getTeams();
        int count = 0;

        for (TeamResponseItem item : teams) {
            Integer apiId = item.getTeam().getId();
            Club club = clubRepository.findByApiFootballId(apiId)
                    .orElse(new Club());

            club.setApiFootballId(apiId);
            club.setName(item.getTeam().getName());
            club.setLogoUrl(item.getTeam().getLogo());
            club.setCity(item.getVenue() != null ? item.getVenue().getCity() : "");

            clubRepository.save(club);
            count++;
        }

        return count;
    }

    public int syncMatches() {
        List<FixtureResponseItem> fixtures = apiFootballClient.getFixtures();
        int count = 0;

        for (FixtureResponseItem item : fixtures) {
            Integer apiId = item.getFixture().getId();

            Integer homeApiId = item.getTeams().getHome().getId();
            Integer awayApiId = item.getTeams().getAway().getId();

            Club homeClub = clubRepository.findByApiFootballId(homeApiId).orElse(null);
            Club awayClub = clubRepository.findByApiFootballId(awayApiId).orElse(null);

            // skip if clubs haven't been synced yet
            if (homeClub == null || awayClub == null) continue;

            Match match = matchRepository.findByApiFootballId(apiId).orElse(new Match());

            match.setApiFootballId(apiId);
            match.setHomeClub(homeClub);
            match.setAwayClub(awayClub);
            match.setDate(parseDate(item.getFixture().getDate()));
            match.setRound(parseRound(item.getLeague().getRound()));

            String status = item.getFixture().getStatus().getShortStatus();
            boolean finished = "FT".equals(status) || "AET".equals(status) || "PEN".equals(status);
            match.setFinished(finished);

            if (finished) {
                FixtureGoalsDto goals = item.getGoals();
                if (goals != null && goals.getHome() != null && goals.getAway() != null) {
                    match.setResult(goals.getHome() + "-" + goals.getAway());
                }
            }

            matchRepository.save(match);
            count++;
        }

        return count;
    }

    private LocalDate parseDate(String isoDate) {
        if (isoDate == null) return LocalDate.now();
        return OffsetDateTime.parse(isoDate).toLocalDate();
    }

    private Integer parseRound(String round) {
        if (round == null) return 0;
        // "Regular Season - 3" → 3
        String[] parts = round.split(" - ");
        if (parts.length == 2) {
            try {
                return Integer.parseInt(parts[1].trim());
            } catch (NumberFormatException ignored) {}
        }
        return 0;
    }
}
