package com.jgy36.PoliticalApp.config;

import com.jgy36.PoliticalApp.service.UserDetailsServiceImpl;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtTokenFilter extends OncePerRequestFilter {

    private final JwtTokenUtil jwtTokenUtil;
    private final UserDetailsServiceImpl userDetailsService;

    public JwtTokenFilter(JwtTokenUtil jwtTokenUtil, UserDetailsServiceImpl userDetailsService) {
        this.jwtTokenUtil = jwtTokenUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String header = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (header == null || !header.startsWith("Bearer ")) {
            logger.debug("❌ No JWT token found in request headers");
            chain.doFilter(request, response);
            return;
        }

        final String token = header.substring(7);
        logger.debug("🔍 Extracted Token: " + token);

        try {
            String email = jwtTokenUtil.extractUsername(token);
            logger.debug("✅ Token belongs to: " + email);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                if (jwtTokenUtil.validateToken(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.debug("✅ Authentication successful for: " + email);
                } else {
                    logger.debug("❌ Invalid JWT Token");
                    response.sendError(HttpStatus.UNAUTHORIZED.value(), "Invalid JWT Token");
                    return;
                }
            }
        } catch (ExpiredJwtException e) {
            logger.debug("❌ Expired JWT Token");
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Expired JWT Token");
            return;
        } catch (JwtException e) {
            logger.debug("❌ Invalid JWT Token");
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Invalid JWT Token");
            return;
        }

        chain.doFilter(request, response);
    }

}
