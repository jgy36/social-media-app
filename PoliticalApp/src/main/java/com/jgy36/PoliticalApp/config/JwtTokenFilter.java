package com.jgy36.PoliticalApp.config;

import com.jgy36.PoliticalApp.service.TokenBlacklistService;
import com.jgy36.PoliticalApp.service.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtTokenFilter extends OncePerRequestFilter {

    private final JwtTokenUtil jwtTokenUtil;
    private final TokenBlacklistService tokenBlacklistService;
    private final UserDetailsServiceImpl userDetailsService;

    public JwtTokenFilter(JwtTokenUtil jwtTokenUtil, TokenBlacklistService tokenBlacklistService, UserDetailsServiceImpl userDetailsService) {
        this.jwtTokenUtil = jwtTokenUtil;
        this.tokenBlacklistService = tokenBlacklistService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        System.out.println("🔍 Received Authorization Header: " + header);

        if (header == null || !header.startsWith("Bearer ")) {
            System.out.println("❌ No valid Authorization header found, skipping authentication.");
            chain.doFilter(request, response);
            return;
        }

        final String token = header.substring(7);
        System.out.println("✅ Extracted Token: " + token);

        if (tokenBlacklistService.isTokenBlacklisted(token)) {
            System.out.println("❌ Token is blacklisted.");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Token has been blacklisted");
            return;
        }

        // ✅ Extract Username from Token
        String username;
        try {
            username = jwtTokenUtil.getUsernameFromToken(token);
            System.out.println("✅ Extracted Username from Token: " + username);
        } catch (Exception e) {
            System.out.println("❌ Invalid JWT Token: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Invalid JWT Token");
            return;
        }

        // ✅ Load UserDetails from Database
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        // ✅ Set Authentication in Security Context
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authToken);
        System.out.println("✅ User authenticated: " + username);

        chain.doFilter(request, response);
    }
}
