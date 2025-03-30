package com.jgy36.PoliticalApp.controller;

import com.jgy36.PoliticalApp.config.JwtTokenUtil;
import com.jgy36.PoliticalApp.dto.AuthResponse;
import com.jgy36.PoliticalApp.dto.LoginRequest;
import com.jgy36.PoliticalApp.dto.RegisterRequest;
import com.jgy36.PoliticalApp.entity.User;
import com.jgy36.PoliticalApp.repository.UserRepository;
import com.jgy36.PoliticalApp.service.TokenBlacklistService;
import com.jgy36.PoliticalApp.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
        origins = "http://localhost:3000",
        allowCredentials = "true",
        allowedHeaders = {
                "Authorization", "Content-Type", "Accept", "X-Requested-With",
                "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers",
                "Cache-Control", "Pragma", "Expires"
        },
        exposedHeaders = {"Authorization"}
)
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;
    private final TokenBlacklistService tokenBlacklistService;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(UserService userService, AuthenticationManager authenticationManager, JwtTokenUtil jwtTokenUtil, TokenBlacklistService tokenBlacklistService, UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtTokenUtil = jwtTokenUtil;
        this.tokenBlacklistService = tokenBlacklistService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * ✅ Register a new user.
     */
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        userService.registerUser(request.getUsername(), request.getEmail(), request.getPassword());
        return ResponseEntity.ok("User registered. Please check your email for verification.");
    }

    /**
     * ✅ Login endpoint: Authenticates user and returns JWT token.
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // ✅ Extract username from Authentication object
        String username = ((org.springframework.security.core.userdetails.User) authentication.getPrincipal()).getUsername();
        String token = jwtTokenUtil.generateToken(username); // ✅ Generate the JWT token

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // ✅ Set JWT in HTTP-only cookie
        Cookie jwtCookie = new Cookie("jwt", token);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(false); // Set to true in production with HTTPS
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(24 * 60 * 60); // 24 hours in seconds
        response.addCookie(jwtCookie);

        // ✅ Add a session identifier cookie (not HTTP-only so JS can read it)
        String sessionId = UUID.randomUUID().toString();
        Cookie sessionCookie = new Cookie("session_id", sessionId);
        sessionCookie.setPath("/");
        sessionCookie.setMaxAge(24 * 60 * 60); // 24 hours
        response.addCookie(sessionCookie);

        // Also set the token as Authorization header for API clients
        response.setHeader("Authorization", "Bearer " + token);

        // ✅ Return user info only (token is in cookie)
        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("id", user.getId());
        userResponse.put("username", user.getUsername());
        userResponse.put("email", user.getEmail());

        // ✅ Create response with token (for API clients) and user info
        Map<String, Object> fullResponse = new HashMap<>();
        fullResponse.put("token", token); // Still include token for API clients
        fullResponse.put("user", userResponse);
        fullResponse.put("sessionId", sessionId);

        return ResponseEntity.ok(fullResponse);
    }

    /**
     * ✅ Logout User by Invalidating Token and clearing cookies
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        // Get token from cookie
        Cookie[] cookies = request.getCookies();
        String token = null;

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("jwt".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        // If no cookie, try Authorization header
        if (token == null) {
            String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }

        // Blacklist the token if we found one
        if (token != null) {
            long expiration = jwtTokenUtil.getExpirationFromToken(token);
            tokenBlacklistService.blacklistToken(token, expiration - System.currentTimeMillis());
        }

        // Clear cookies regardless
        Cookie jwtCookie = new Cookie("jwt", null);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(0); // Delete the cookie
        response.addCookie(jwtCookie);

        Cookie sessionCookie = new Cookie("session_id", null);
        sessionCookie.setPath("/");
        sessionCookie.setMaxAge(0); // Delete the cookie
        response.addCookie(sessionCookie);

        return ResponseEntity.ok("Logged out successfully");
    }

    @PostMapping("/google-login")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody Map<String, String> userData, HttpServletResponse response) {
        String email = userData.get("email");
        String name = userData.get("name");

        // ✅ Check if user already exists
        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
        } else {
            // ✅ If user doesn't exist, create a new one with a random password
            user = new User();
            user.setEmail(email);
            user.setUsername(name);
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // Random password
            userRepository.save(user);
        }

        // ✅ Generate JWT token for authentication
        String token = jwtTokenUtil.generateToken(user.getEmail());

        // ✅ Set JWT in HTTP-only cookie
        Cookie jwtCookie = new Cookie("jwt", token);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(false); // Set to true in production with HTTPS
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(24 * 60 * 60); // 24 hours in seconds
        response.addCookie(jwtCookie);

        // ✅ Add a session identifier cookie (not HTTP-only so JS can read it)
        String sessionId = UUID.randomUUID().toString();
        Cookie sessionCookie = new Cookie("session_id", sessionId);
        sessionCookie.setPath("/");
        sessionCookie.setMaxAge(24 * 60 * 60); // 24 hours
        response.addCookie(sessionCookie);

        // Return token for API clients
        AuthResponse authResponse = new AuthResponse(token);
        return ResponseEntity.ok(authResponse);
    }

    /**
     * ✅ Refresh token endpoint
     * Gets a new token using an existing valid token
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        // Get token from cookie
        Cookie[] cookies = request.getCookies();
        String token = null;

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("jwt".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        // If no cookie, try Authorization header
        if (token == null) {
            String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No valid token provided");
            }
            token = authHeader.substring(7);
        }

        try {
            // Validate existing token before refreshing
            String username = jwtTokenUtil.getUsernameFromToken(token);

            // Check if token is blacklisted
            if (tokenBlacklistService.isTokenBlacklisted(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token has been invalidated");
            }

            // Check if token is expired
            if (jwtTokenUtil.isTokenExpired(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token has expired");
            }

            // Generate new token
            String newToken = jwtTokenUtil.generateToken(username);

            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            // ✅ Set new JWT in HTTP-only cookie
            Cookie jwtCookie = new Cookie("jwt", newToken);
            jwtCookie.setHttpOnly(true);
            jwtCookie.setSecure(false); // Set to true in production with HTTPS
            jwtCookie.setPath("/");
            jwtCookie.setMaxAge(24 * 60 * 60); // 24 hours in seconds
            response.addCookie(jwtCookie);

            // ✅ Set a new session ID
            String sessionId = UUID.randomUUID().toString();
            Cookie sessionCookie = new Cookie("session_id", sessionId);
            sessionCookie.setPath("/");
            sessionCookie.setMaxAge(24 * 60 * 60); // 24 hours
            response.addCookie(sessionCookie);

            // Also set the new token as Authorization header for API clients
            response.setHeader("Authorization", "Bearer " + newToken);

            // Return both token & user info
            Map<String, Object> userResponse = new HashMap<>();
            userResponse.put("id", user.getId());
            userResponse.put("username", user.getUsername());

            Map<String, Object> fullResponse = new HashMap<>();
            fullResponse.put("token", newToken);
            fullResponse.put("user", userResponse);
            fullResponse.put("sessionId", sessionId);

            return ResponseEntity.ok(fullResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
    }
}
