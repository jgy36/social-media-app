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
        logger.info("=== sendVerificationEmail START ===");
        logger.info("Recipient email: {}", toEmail);
        logger.info("Token: {}", token);
        logger.info("Frontend URL: {}", frontendUrl);
        logger.info("From email: {}", fromEmail);

        if (toEmail == null) {
            logger.error("toEmail is null!");
            throw new IllegalArgumentException("Email cannot be null");
        }

        if (token == null) {
            logger.error("Token is null!");
            throw new IllegalArgumentException("Token cannot be null");
        }

        String verificationUrl = frontendUrl + "/verify?token=" + token;
        logger.info("Constructed verification URL: {}", verificationUrl);

        String subject = "Verify your account";
        String message = "Click the link below to verify your account:\n" + verificationUrl;

        try {
            logger.info("Calling sendEmail method...");
            sendEmail(toEmail, subject, message);
            logger.info("sendEmail completed successfully");
        } catch (Exception e) {
            logger.error("Exception in sendEmail: ", e);
            throw e;
        }

        logger.info("=== sendVerificationEmail END ===");
    }

    public void sendEmail(String to, String subject, String text) {
        logger.info("=== sendEmail START ===");
        logger.info("To: {}", to);
        logger.info("Subject: {}", subject);
        logger.info("From: {}", fromEmail);
        logger.info("Text length: {}", text != null ? text.length() : "null");

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            logger.info("Sending mail message...");
            mailSender.send(message);
            logger.info("Mail sent successfully!");
        } catch (Exception e) {
            logger.error("Failed to send email: ", e);
            throw e;
        }

        logger.info("=== sendEmail END ===");
    }
}
