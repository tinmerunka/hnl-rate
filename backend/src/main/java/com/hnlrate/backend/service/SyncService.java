package com.hnlrate.backend.service;

import com.hnlrate.backend.client.ApiFootballClient;
import com.hnlrate.backend.dto.external.*;
import com.hnlrate.backend.model.Club;
import com.hnlrate.backend.model.Match;
import com.hnlrate.backend.model.MatchPlayer;
import com.hnlrate.backend.model.Player;
import com.hnlrate.backend.model.Referee;
import com.hnlrate.backend.repository.ClubRepository;
import com.hnlrate.backend.repository.MatchPlayerRepository;
import com.hnlrate.backend.repository.MatchRepository;
import com.hnlrate.backend.repository.PlayerRepository;
import com.hnlrate.backend.repository.RefereeRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SyncService {

    private static final Logger log = LoggerFactory.getLogger(SyncService.class);

    private final ApiFootballClient apiFootballClient;
    private final ClubRepository clubRepository;
    private final MatchRepository matchRepository;
    private final MatchPlayerRepository matchPlayerRepository;
    private final PlayerRepository playerRepository;
    private final RefereeRepository refereeRepository;

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
        log.info("[SYNC] syncMatches() START");
        List<FixtureResponseItem> fixtures = apiFootballClient.getFixtures();
        log.info("[SYNC] getFixtures() returned {} items", fixtures == null ? "null" : fixtures.size());
        if (fixtures == null || fixtures.isEmpty()) return 0;
        int count = 0;

        for (FixtureResponseItem item : fixtures) {
            Integer apiId = item.getFixture().getId();

            Integer homeApiId = item.getTeams().getHome().getId();
            Integer awayApiId = item.getTeams().getAway().getId();

            Club homeClub = clubRepository.findByApiFootballId(homeApiId).orElse(null);
            Club awayClub = clubRepository.findByApiFootballId(awayApiId).orElse(null);

            if (homeClub == null || awayClub == null) continue;

            Match match = matchRepository.findByApiFootballId(apiId).orElse(new Match());

            match.setApiFootballId(apiId);
            match.setHomeClub(homeClub);
            match.setAwayClub(awayClub);
            match.setDate(parseDate(item.getFixture().getDate()));
            match.setRound(parseRound(item.getLeague().getRound()));

            Referee referee = parseReferee(item.getFixture().getReferee());
            match.setReferee(referee);

            FixtureGoalsDto goals = item.getGoals();
            boolean hasGoals = goals != null && goals.getHome() != null && goals.getAway() != null;

            // Primary: check API status code
            FixtureStatusDto statusDto = item.getFixture().getStatus();
            String statusCode = statusDto != null ? statusDto.getShortStatus() : null;
            boolean finished = "FT".equals(statusCode) || "AET".equals(statusCode)
                    || "PEN".equals(statusCode) || "AWD".equals(statusCode) || "WO".equals(statusCode);

            log.info("[SYNC] fixture={} date={} statusCode={} hasGoals={} goalsHome={} goalsAway={} finished={}",
                    apiId,
                    item.getFixture().getDate(),
                    statusCode,
                    hasGoals,
                    goals != null ? goals.getHome() : null,
                    goals != null ? goals.getAway() : null,
                    finished);

            // Fallback: if status couldn't be parsed (Jackson annotation issue),
            // use date + goals as the ground truth — a past match with goals is finished
            if (!finished && hasGoals) {
                LocalDate matchDate = parseDate(item.getFixture().getDate());
                finished = matchDate != null && matchDate.isBefore(LocalDate.now());
                log.info("[SYNC] fixture={} fallback applied → finished={}", apiId, finished);
            }

            match.setFinished(finished);

            if (finished && hasGoals) {
                match.setResult(goals.getHome() + "-" + goals.getAway());
            }

            matchRepository.save(match);
            count++;
        }

        return count;
    }

    public int syncPlayers() {
        List<PlayerResponseItem> players = apiFootballClient.getPlayers();
        int count = 0;

        for (PlayerResponseItem item : players) {
            if (item.getPlayer() == null) continue;

            Integer apiId = item.getPlayer().getId();
            String firstName = item.getPlayer().getFirstname();
            String lastName = item.getPlayer().getLastname();

            if (firstName == null || lastName == null) continue;

            // find which club this player belongs to via statistics
            Club club = resolvePlayerClub(item);
            if (club == null) continue;

            Player player = playerRepository.findByApiFootballId(apiId).orElse(new Player());
            player.setApiFootballId(apiId);
            player.setFirstName(firstName);
            player.setLastName(lastName);
            player.setClub(club);

            if (item.getStatistics() != null && !item.getStatistics().isEmpty()) {
                PlayerStatisticsDto stats = item.getStatistics().get(0);
                if (stats.getGames() != null) {
                    player.setPosition(stats.getGames().getPosition());
                    player.setNumber(stats.getGames().getNumber());
                }
            }

            playerRepository.save(player);
            count++;
        }

        return count;
    }

    public void syncLineups(Match match) {
        if (match.getApiFootballId() == null) return;

        List<LineupResponseItem> lineups = apiFootballClient.getLineups(match.getApiFootballId());
        if (lineups.isEmpty()) return;

        matchPlayerRepository.deleteByMatch(match);

        for (LineupResponseItem lineup : lineups) {
            Club club = clubRepository.findByApiFootballId(lineup.getTeam().getId()).orElse(null);
            if (club == null) continue;

            persistLineupEntries(match, club, lineup.getStartXI(), true);
            persistLineupEntries(match, club, lineup.getSubstitutes(), false);
        }
    }

    private void persistLineupEntries(Match match, Club club, List<LineupPlayerEntryDto> entries, boolean starter) {
        if (entries == null) return;
        for (LineupPlayerEntryDto entry : entries) {
            LineupPlayerDto p = entry.getPlayer();
            if (p == null || p.getId() == null) continue;

            playerRepository.findByApiFootballId(p.getId()).ifPresent(player -> {
                MatchPlayer mp = new MatchPlayer();
                mp.setMatch(match);
                mp.setPlayer(player);
                mp.setClub(club);
                mp.setStarter(starter);
                mp.setPosition(p.getPos());
                mp.setNumber(p.getNumber());
                mp.setGrid(p.getGrid());
                matchPlayerRepository.save(mp);
            });
        }
    }

    private Club resolvePlayerClub(PlayerResponseItem item) {
        if (item.getStatistics() == null || item.getStatistics().isEmpty()) return null;
        PlayerStatTeamDto team = item.getStatistics().get(0).getTeam();
        if (team == null || team.getId() == null) return null;
        return clubRepository.findByApiFootballId(team.getId()).orElse(null);
    }

    // Parses "Ante Vucemilovic (Croatia)" → upserts Referee by firstName+lastName
    private Referee parseReferee(String refereeString) {
        if (refereeString == null || refereeString.isBlank()) return null;

        // strip country "(Country)"
        String name = refereeString.contains("(")
                ? refereeString.substring(0, refereeString.lastIndexOf('(')).trim()
                : refereeString.trim();

        int lastSpace = name.lastIndexOf(' ');
        if (lastSpace < 0) return null;

        String firstName = name.substring(0, lastSpace).trim();
        String lastName = name.substring(lastSpace + 1).trim();

        return refereeRepository.findByFirstNameAndLastName(firstName, lastName)
                .orElseGet(() -> {
                    Referee r = new Referee();
                    r.setFirstName(firstName);
                    r.setLastName(lastName);
                    return refereeRepository.save(r);
                });
    }

    private LocalDate parseDate(String isoDate) {
        if (isoDate == null) return LocalDate.now();
        return OffsetDateTime.parse(isoDate).toLocalDate();
    }

    private Integer parseRound(String round) {
        if (round == null) return 0;
        String[] parts = round.split(" - ");
        if (parts.length == 2) {
            try {
                return Integer.parseInt(parts[1].trim());
            } catch (NumberFormatException ignored) {}
        }
        return 0;
    }
}
