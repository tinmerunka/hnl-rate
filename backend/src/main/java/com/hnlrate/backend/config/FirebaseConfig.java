package com.hnlrate.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.service-account-path}")
    private String serviceAccountPath;

    @PostConstruct
    public void initialize() {
        if (!FirebaseApp.getApps().isEmpty()) return;

        try {
            InputStream serviceAccount;
            if (serviceAccountPath.startsWith("classpath:")) {
                String path = serviceAccountPath.substring("classpath:".length());
                serviceAccount = getClass().getClassLoader().getResourceAsStream(path);
            } else {
                serviceAccount = new FileInputStream(serviceAccountPath);
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp.initializeApp(options);
            log.info("[Firebase] Inicijalizacija uspješna.");
        } catch (IOException e) {
            log.error("[Firebase] Greška pri inicijalizaciji: {}", e.getMessage());
        }
    }
}
