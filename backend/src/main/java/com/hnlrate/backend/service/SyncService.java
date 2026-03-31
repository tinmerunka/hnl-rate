package com.hnlrate.backend.service;

import com.hnlrate.backend.client.ApiFootballClient;
import com.hnlrate.backend.dto.external.TeamResponseItem;
import com.hnlrate.backend.model.Club;
import com.hnlrate.backend.repository.ClubRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SyncService {

    private final ApiFootballClient apiFootballClient;
    private final ClubRepository clubRepository;

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
}