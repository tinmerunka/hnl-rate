package com.hnlrate.backend.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.MulticastMessage;
import com.google.firebase.messaging.Notification;
import com.hnlrate.backend.model.Match;
import com.hnlrate.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final UserRepository userRepository;

    public void sendMatchFinishedNotification(Match match) {
        List<String> tokens = userRepository.findAll().stream()
                .filter(u -> u.getFcmToken() != null && !u.getFcmToken().isBlank())
                .filter(u -> !Boolean.TRUE.equals(u.getBlocked()))
                .map(com.hnlrate.backend.model.User::getFcmToken)
                .toList();

        if (tokens.isEmpty()) {
            log.info("[FCM] Nema registriranih tokena, preskačem slanje notifikacija.");
            return;
        }

        String title = "Utakmica završila!";
        String body = match.getHomeClub().getName() + " vs " + match.getAwayClub().getName()
                + " · " + (match.getResult() != null ? match.getResult() : "")
                + " — Ocijeni utakmicu!";

        try {
            MulticastMessage message = MulticastMessage.builder()
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .putData("matchId", String.valueOf(match.getId()))
                    .putData("type", "MATCH_FINISHED")
                    .addAllTokens(tokens)
                    .build();

            var response = FirebaseMessaging.getInstance().sendEachForMulticast(message);
            log.info("[FCM] Poslano {} notifikacija, {} grešaka.",
                    response.getSuccessCount(), response.getFailureCount());
            response.getResponses().forEach(r -> {
                if (!r.isSuccessful()) {
                    log.error("[FCM] Greška tokena: {}", r.getException().getMessage());
                    Throwable cause = r.getException().getCause();
                    while (cause != null) {
                        log.error("[FCM] Uzrok: {}", cause.getMessage());
                        cause = cause.getCause();
                    }
                }
            });
        } catch (Exception e) {
            log.error("[FCM] Greška pri slanju notifikacija: {}", e.getMessage());
        }
    }
}
