package com.jgy36.PoliticalApp.controller;

import com.jgy36.PoliticalApp.config.JwtTokenUtil;
import com.jgy36.PoliticalApp.dto.AuthResponse;
import com.jgy36.PoliticalApp.dto.LoginRequest;
import com.jgy36.PoliticalApp.dto.RegisterRequest;
import com.jgy36.PoliticalApp.entity.User;
import com.jgy36.PoliticalApp.repository.UserRepository;
import com.jgy36.PoliticalApp.service.TokenBlacklistService;
import com.jgy36.PoliticalApp.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
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

@RestController // ✅ Ensures Spring Boot detects this as a REST API
@RequestMapping("/api/auth") // ✅ Ensures `/api/auth` is the base URL
@CrossOrigin(origins = "*") // ✅ Ensures frontend can access API during development
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
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // ✅ Extract username from Authentication object
        String username = ((org.springframework.security.core.userdetails.User) authentication.getPrincipal()).getUsername();
        String token = jwtTokenUtil.generateToken(username); // ✅ Now passing the correct type

        User user = userRepository.findByEmail(username) // ✅ Now using `username` instead of `loginRequest.getEmail()`
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // ✅ Return both token & user info
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", Map.of(
                "id", user.getId(),
                "username", user.getUsername()
        ));

        return ResponseEntity.ok(response);
    }


    /**
     * ✅ Logout User by Invalidating Token
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            long expiration = jwtTokenUtil.getExpirationFromToken(token); // Get token expiration

            tokenBlacklistService.blacklistToken(token, expiration - System.currentTimeMillis());
        }

        return ResponseEntity.ok("Logged out successfully");
    }

    @PostMapping("/google-login")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody Map<String, String> userData) {
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

        return ResponseEntity.ok(new AuthResponse(token));
    }

}
