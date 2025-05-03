package com.jgy36.PoliticalApp.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public void sendVerificationEmail(String toEmail, String token) {
        String verificationUrl = frontendUrl + "/verify?token=" + token;
        String subject = "Verify your account";
        String message = "Click the link below to verify your account:\n" + verificationUrl;

        logger.info("Sending verification email to: {}", toEmail);
        logger.info("Verification URL: {}", verificationUrl);
        logger.info("From email: {}", fromEmail);

        try {
            sendEmail(toEmail, subject, message);
            logger.info("Verification email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send verification email to: {}", toEmail, e);
            throw e;
        }
    }

    public void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        logger.debug("Sending email: from={}, to={}, subject={}", fromEmail, to, subject);
        mailSender.send(message);
        logger.debug("Email sent successfully");
    }
}
