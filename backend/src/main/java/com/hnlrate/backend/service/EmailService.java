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
            "Vaš kod za reset lozinke (vrijedi 15 minuta):\n\n" +
            "  " + token + "\n\n" +
            "Unesite ovaj kod u mobilnoj aplikaciji ili kliknite na link ispod (web):\n\n" +
            resetLink + "\n\n" +
            "Ako niste zatražili reset lozinke, ignorirajte ovaj email."
        );

        mailSender.send(message);
    }
}
