package com.jgy36.PoliticalApp.controller;

import com.jgy36.PoliticalApp.config.JwtTokenUtil;
import com.jgy36.PoliticalApp.dto.AuthResponse;
import com.jgy36.PoliticalApp.dto.LoginRequest;
import com.jgy36.PoliticalApp.dto.RegisterRequest;
import com.jgy36.PoliticalApp.service.TokenBlacklistService;
import com.jgy36.PoliticalApp.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController // ✅ Ensures Spring Boot detects this as a REST API
@RequestMapping("/api/auth") // ✅ Ensures `/api/auth` is the base URL
@CrossOrigin(origins = "*") // ✅ Ensures frontend can access API during development
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;
    private final TokenBlacklistService tokenBlacklistService;

    public AuthController(UserService userService, AuthenticationManager authenticationManager, JwtTokenUtil jwtTokenUtil, TokenBlacklistService tokenBlacklistService) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtTokenUtil = jwtTokenUtil;
        this.tokenBlacklistService = tokenBlacklistService;
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
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtTokenUtil.generateToken(authentication.getName());

        return ResponseEntity.ok(new AuthResponse(token));
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

}
