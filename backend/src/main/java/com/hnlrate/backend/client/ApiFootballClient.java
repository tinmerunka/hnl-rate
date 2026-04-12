package com.hnlrate.backend.client;

import com.hnlrate.backend.dto.external.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Component
public class ApiFootballClient {

    private final RestClient restClient;

    @Value("${api.football.league-id}")
    private int leagueId;

    @Value("${api.football.season}")
    private int season;

    public ApiFootballClient(@Value("${api.football.base-url}") String baseUrl,
                             @Value("${api.football.key}") String apiKey) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("x-apisports-key", apiKey)
                .build();
    }

    public List<TeamResponseItem> getTeams() {
        ApiResponse<TeamResponseItem> response = restClient.get()
                .uri("/teams?league={league}&season={season}", leagueId, season)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        return response.getResponse();
    }

    public List<FixtureResponseItem> getFixtures() {
        ApiResponse<FixtureResponseItem> response = restClient.get()
                .uri("/fixtures?league={league}&season={season}", leagueId, season)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        return response.getResponse();
    }

    public List<PlayerResponseItem> getPlayers() {
        List<PlayerResponseItem> all = new ArrayList<>();
        int page = 1;

        while (true) {
            ApiResponse<PlayerResponseItem> response = restClient.get()
                    .uri("/players?league={league}&season={season}&page={page}", leagueId, season, page)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            if (response == null || response.getResponse() == null || response.getResponse().isEmpty()) break;

            all.addAll(response.getResponse());

            PagingDto paging = response.getPaging();
            if (paging == null || page >= paging.getTotal()) break;
            page++;
        }

        return all;
    }
}
