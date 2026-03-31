package com.hnlrate.backend.client;

import com.hnlrate.backend.dto.external.ApiResponse;
import com.hnlrate.backend.dto.external.TeamResponseItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

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
}