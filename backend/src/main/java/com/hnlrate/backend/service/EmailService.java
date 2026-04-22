package com.hnlrate.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(String to, String token) {
        String resetLink = "http://localhost:3000/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("HNL Rate — Reset lozinke");
        message.setText(
            "Zatražili ste reset lozinke za vaš HNL Rate account.\n\n" +
            "Kliknite na link ispod da postavite novu lozinku (vrijedi 15 minuta):\n\n" +
            resetLink + "\n\n" +
            "Ako niste zatražili reset lozinke, ignorirajte ovaj email."
        );

        mailSender.send(message);
    }
}
