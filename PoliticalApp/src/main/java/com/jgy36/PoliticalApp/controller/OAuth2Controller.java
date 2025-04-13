package com.jgy36.PoliticalApp.controller;

import com.jgy36.PoliticalApp.config.JwtTokenUtil;
import com.jgy36.PoliticalApp.entity.User;
import com.jgy36.PoliticalApp.repository.ConnectedAccountRepository;
import com.jgy36.PoliticalApp.repository.UserRepository;
import com.jgy36.PoliticalApp.utils.OAuth2Util;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.UUID;

@Controller
@RequestMapping("/oauth2")
public class OAuth2Controller {
    private static final Logger logger = LoggerFactory.getLogger(OAuth2Controller.class);

    private final UserRepository userRepository;
    private final ConnectedAccountRepository connectedAccountRepository;
    private final JwtTokenUtil jwtTokenUtil;
    private final OAuth2Util oAuth2Util;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public OAuth2Controller(
            UserRepository userRepository,
            ConnectedAccountRepository connectedAccountRepository,
            JwtTokenUtil jwtTokenUtil,
            OAuth2Util oAuth2Util) {
        this.userRepository = userRepository;
        this.connectedAccountRepository = connectedAccountRepository;
        this.jwtTokenUtil = jwtTokenUtil;
        this.oAuth2Util = oAuth2Util;
    }

    @GetMapping("/login/success")
    public String loginSuccess(HttpServletResponse response, Model model) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (!(authentication instanceof OAuth2AuthenticationToken)) {
            logger.error("Authentication is not OAuth2AuthenticationToken");
            return "redirect:" + frontendUrl + "/login?error=authentication_failed";
        }

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();

        String providerName = oauthToken.getAuthorizedClientRegistrationId();
        String email = oAuth2Util.getUserEmail(oAuth2User, providerName);

        if (email == null) {
            logger.error("No email found in OAuth2 user");
            return "redirect:" + frontendUrl + "/login?error=no_email";
        }

        // Find user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found after OAuth2 authentication"));

        // Generate JWT token
        String token = jwtTokenUtil.generateToken(user.getEmail());

        // Set JWT in HTTP-only cookie
        Cookie jwtCookie = new Cookie("jwt", token);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(false); // Set to true in production with HTTPS
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(24 * 60 * 60); // 24 hours in seconds
        response.addCookie(jwtCookie);

        // Add a session identifier cookie
        String sessionId = UUID.randomUUID().toString();
        Cookie sessionCookie = new Cookie("session_id", sessionId);
        sessionCookie.setPath("/");
        sessionCookie.setMaxAge(24 * 60 * 60); // 24 hours
        response.addCookie(sessionCookie);

        // Redirect to frontend with success
        return "redirect:" + frontendUrl + "/login?oauth=success";
    }
}
