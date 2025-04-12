package com.jgy36.PoliticalApp.controller;

import com.jgy36.PoliticalApp.config.JwtTokenUtil;
import com.jgy36.PoliticalApp.entity.ConnectedAccount;
import com.jgy36.PoliticalApp.entity.User;
import com.jgy36.PoliticalApp.repository.ConnectedAccountRepository;
import com.jgy36.PoliticalApp.repository.UserRepository;
import com.jgy36.PoliticalApp.utils.OAuth2Util;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Controller
@RequestMapping("/oauth2")
public class OAuth2Controller {
    private final UserRepository userRepository;
    private final ConnectedAccountRepository connectedAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final OAuth2AuthorizedClientService authorizedClientService;
    private final OAuth2Util oAuth2Util;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public OAuth2Controller(
            UserRepository userRepository,
            ConnectedAccountRepository connectedAccountRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenUtil jwtTokenUtil,
            OAuth2AuthorizedClientService authorizedClientService,
            OAuth2Util oAuth2Util) {
        this.userRepository = userRepository;
        this.connectedAccountRepository = connectedAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenUtil = jwtTokenUtil;
        this.authorizedClientService = authorizedClientService;
        this.oAuth2Util = oAuth2Util;
    }

    @GetMapping("/login/success")
    public String loginSuccess(HttpServletResponse response, Model model) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (!(authentication instanceof OAuth2AuthenticationToken)) {
            return "redirect:" + frontendUrl + "/login?error=authentication_failed";
        }

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();

        String providerName = oauthToken.getAuthorizedClientRegistrationId();
        String providerUserId = oAuth2Util.getProviderUserId(oAuth2User, providerName);
        String email = oAuth2Util.getUserEmail(oAuth2User, providerName);
        String name = oAuth2Util.getUserName(oAuth2User, providerName);

        // Check if account is already connected to a user
        Optional<ConnectedAccount> existingConnection = connectedAccountRepository.findByProviderAndProviderUserId(
                providerName, providerUserId);

        User user;

        if (existingConnection.isPresent()) {
            // User already exists, get the user
            user = existingConnection.get().getUser();
        } else if (email != null && userRepository.findByEmail(email).isPresent()) {
            // User with this email already exists, connect account
            user = userRepository.findByEmail(email).get();
            connectAccount(user, oauthToken, providerUserId);
        } else {
            // Create new user
            user = createNewUser(email, name);
            connectAccount(user, oauthToken, providerUserId);
        }

        // Generate JWT token
        String token = jwtTokenUtil.generateToken(user.getEmail());

        // Set JWT in HTTP-only cookie
        Cookie jwtCookie = new Cookie("jwt", token);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(false); // Set to true in production with HTTPS
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(24 * 60 * 60); // 24 hours in seconds
        response.addCookie(jwtCookie);

        // Add a session identifier cookie (not HTTP-only so JS can read it)
        String sessionId = UUID.randomUUID().toString();
        Cookie sessionCookie = new Cookie("session_id", sessionId);
        sessionCookie.setPath("/");
        sessionCookie.setMaxAge(24 * 60 * 60); // 24 hours
        response.addCookie(sessionCookie);

        model.addAttribute("token", token);
        model.addAttribute("frontendUrl", frontendUrl);

        return "oauth2/success"; // This will be a simple HTML page that redirects to frontend with token
    }

    @GetMapping("/connect/{provider}/callback")
    public String connectCallback(@PathVariable String provider, Model model) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (!(authentication instanceof OAuth2AuthenticationToken)) {
            return "redirect:" + frontendUrl + "/settings?error=authentication_failed";
        }

        // Current user from JWT token
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not authenticated properly"));

        // OAuth2 user
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();

        String providerName = oauthToken.getAuthorizedClientRegistrationId();
        String providerUserId = oAuth2Util.getProviderUserId(oAuth2User, providerName);

        // Connect the account
        connectAccount(user, oauthToken, providerUserId);

        model.addAttribute("provider", provider);
        model.addAttribute("frontendUrl", frontendUrl);

        return "oauth2/connected"; // This will be a simple HTML page that closes the popup
    }

    private User createNewUser(String email, String name) {
        User user = new User();
        user.setEmail(email);
        user.setUsername(generateUsername(name));
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // Random password
        return userRepository.save(user);
    }

    private String generateUsername(String name) {
        // Create username based on name and random suffix
        String baseUsername = name.replaceAll("\\s+", "").toLowerCase();
        String username = baseUsername;
        int attempt = 1;

        // Make sure username is unique
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + attempt;
            attempt++;
        }

        return username;
    }

    private void connectAccount(User user, OAuth2AuthenticationToken oauthToken, String providerUserId) {
        String providerName = oauthToken.getAuthorizedClientRegistrationId();

        // Get authorized client
        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(
                oauthToken.getAuthorizedClientRegistrationId(),
                oauthToken.getName());

        // Check if already connected
        Optional<ConnectedAccount> existingAccount = connectedAccountRepository.findByUserIdAndProvider(
                user.getId(), providerName);

        if (existingAccount.isPresent()) {
            // Update existing connection
            ConnectedAccount account = existingAccount.get();
            account.setProviderUserId(providerUserId);
            account.setAccessToken(client.getAccessToken().getTokenValue());
            if (client.getRefreshToken() != null) {
                account.setRefreshToken(client.getRefreshToken().getTokenValue());
            }
            account.setExpiresAt(LocalDateTime.now().plusSeconds(client.getAccessToken().getExpiresAt().getEpochSecond() - System.currentTimeMillis() / 1000));
            connectedAccountRepository.save(account);
        } else {
            // Create new connection
            ConnectedAccount account = new ConnectedAccount();
            account.setUser(user);
            account.setProvider(providerName);
            account.setProviderUserId(providerUserId);
            account.setAccessToken(client.getAccessToken().getTokenValue());
            if (client.getRefreshToken() != null) {
                account.setRefreshToken(client.getRefreshToken().getTokenValue());
            }
            account.setExpiresAt(LocalDateTime.now().plusSeconds(client.getAccessToken().getExpiresAt().getEpochSecond() - System.currentTimeMillis() / 1000));
            connectedAccountRepository.save(account);
        }
    }
}
