package com.hnlrate.backend.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ScheduledSyncJob {

    private static final Logger log = LoggerFactory.getLogger(ScheduledSyncJob.class);

    private final SyncService syncService;

    // Runs 1 min after startup, then every 30 min after each completion.
    @Scheduled(initialDelay = 60 * 1000, fixedDelay = 30 * 60 * 1000)
    public void syncMatches() {
        log.info("[SCHEDULED] syncMatches START");
        try {
            int count = syncService.syncMatches();
            log.info("[SCHEDULED] syncMatches DONE — {} fixtures upserted", count);
        } catch (Exception e) {
            log.error("[SCHEDULED] syncMatches FAILED: {}", e.getMessage(), e);
        }
    }
}
