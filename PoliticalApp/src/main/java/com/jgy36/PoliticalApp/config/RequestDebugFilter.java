package com.jgy36.PoliticalApp.config.security; // or your preferred package

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class RequestDebugFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RequestDebugFilter.class);

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        logger.info("🔒 Security request: {} {}", request.getMethod(), request.getRequestURI());
        logger.info("🔒 Authentication: {}", SecurityContextHolder.getContext().getAuthentication());

        try {
            filterChain.doFilter(request, response);
        } finally {
            logger.info("🔒 Response status: {}", response.getStatus());
        }
    }
}
