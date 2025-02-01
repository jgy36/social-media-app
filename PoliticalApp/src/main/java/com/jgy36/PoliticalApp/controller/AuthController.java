package com.jgy36.PoliticalApp.controller;

import com.jgy36.PoliticalApp.dto.RegisterRequest;
import com.jgy36.PoliticalApp.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController // ✅ Ensures Spring Boot detects this as a REST API
@RequestMapping("/api/auth") // ✅ Ensures `/api/auth` is the base URL
@CrossOrigin(origins = "*") // ✅ Ensures frontend can access API during development
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /**
     * ✅ Register a new user.
     */
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        userService.registerUser(request.getUsername(), request.getEmail(), request.getPassword());
        return ResponseEntity.ok("User registered. Please check your email for verification.");
    }
}
