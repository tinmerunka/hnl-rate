package com.hnlrate.backend.dto;

import com.hnlrate.backend.model.Club;
import com.hnlrate.backend.model.MatchPlayer;
import lombok.Getter;

import java.util.List;

@Getter
public class MatchLineupDTO {

    private final TeamLineup homeTeam;
    private final TeamLineup awayTeam;

    public MatchLineupDTO(Club homeClub, Club awayClub, List<MatchPlayer> allPlayers) {
        this.homeTeam = new TeamLineup(homeClub, allPlayers);
        this.awayTeam = new TeamLineup(awayClub, allPlayers);
    }

    @Getter
    public static class TeamLineup {
        private final ClubDTO club;
        private final List<LineupPlayerDTO> startingXI;
        private final List<LineupPlayerDTO> bench;

        public TeamLineup(Club club, List<MatchPlayer> allPlayers) {
            this.club = new ClubDTO(club);
            this.startingXI = allPlayers.stream()
                    .filter(mp -> mp.getClub().getId().equals(club.getId()) && Boolean.TRUE.equals(mp.getStarter()))
                    .map(LineupPlayerDTO::new)
                    .toList();
            this.bench = allPlayers.stream()
                    .filter(mp -> mp.getClub().getId().equals(club.getId()) && Boolean.FALSE.equals(mp.getStarter()))
                    .map(LineupPlayerDTO::new)
                    .toList();
        }
    }

    @Getter
    public static class LineupPlayerDTO {
        private final Integer id;
        private final String firstName;
        private final String lastName;
        private final Integer number;
        private final String position;
        private final String grid;

        public LineupPlayerDTO(MatchPlayer mp) {
            this.id = mp.getPlayer().getId();
            this.firstName = mp.getPlayer().getFirstName();
            this.lastName = mp.getPlayer().getLastName();
            this.number = mp.getNumber();
            this.position = mp.getPosition();
            this.grid = mp.getGrid();
        }
    }
}
