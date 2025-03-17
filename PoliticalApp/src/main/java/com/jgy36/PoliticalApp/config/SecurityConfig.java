package com.jgy36.PoliticalApp.config;

import com.jgy36.PoliticalApp.service.UserDetailsServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final JwtTokenFilter jwtTokenFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    public SecurityConfig(UserDetailsServiceImpl userDetailsService, JwtTokenFilter jwtTokenFilter,
                          JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint) {
        this.userDetailsService = userDetailsService;
        this.jwtTokenFilter = jwtTokenFilter;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOrigins(List.of("http://localhost:3000")); // ✅ Allow frontend
                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    config.setAllowedHeaders(List.of("*"));
                    return config;
                }))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Allow access to static resources without authentication
                        .requestMatchers("/images/**", "/css/**", "/js/**").permitAll()
                        // ✅ Public Endpoints
                        .requestMatchers("/api/auth/**").permitAll()  // Public Auth Routes
                        .requestMatchers(HttpMethod.GET, "/api/posts/**").permitAll() // Public GET Posts
                        .requestMatchers(HttpMethod.GET, "/api/comments/**").permitAll()  // Public GET Comments

                        // ✅ FIX: Also allow access to politician endpoints without /api prefix
                        .requestMatchers(HttpMethod.GET, "/politicians/**").permitAll()  // Public GET Politicians
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // ✅ Allow CORS Preflight

                        // ✅ PROTECTED Endpoints (Require JWT Token)
                        .requestMatchers(HttpMethod.POST, "/api/comments/**").authenticated()  // ✅ Require authentication for posting/liking comments
                        .requestMatchers(HttpMethod.POST, "/api/follow/**").authenticated()  // ✅ Secure Follow API (Users must be logged in)
                        .requestMatchers(HttpMethod.POST, "/api/posts/**").authenticated()  // ✅ Users must be logged in to create a post

                        // ✅ Admin Only
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")  // ✅ Use hasRole instead of hasAuthority

                        .anyRequest().authenticated() // ✅ Everything else requires authentication
                )
                .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint)) // Custom 401 Response
                .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
