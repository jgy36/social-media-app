package com.jgy36.PoliticalApp.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtTokenUtil {

    @Value("${jwt.secret}") // ✅ Securely inject secret from properties
    private String secret;

    @Value("${jwt.expirationMs}") // ✅ Inject expiration time from properties
    private long expirationMs;

    /**
     * ✅ Generates a JWT token for an authenticated user.
     *
     * @param email The user's email (unique identifier).
     * @return A JWT token as a String.
     */
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email) // Set email as subject
                .setIssuedAt(new Date()) // Token issue time
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs)) // Expiry date
                .signWith(SignatureAlgorithm.HS256, secret) // Sign with secret key
                .compact();
    }

    /**
     * ✅ Extracts the username (email) from a JWT token.
     *
     * @param token The JWT token.
     * @return The extracted email.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * ✅ Extracts the expiration date from a JWT token.
     *
     * @param token The JWT token.
     * @return The expiration date.
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * ✅ Extracts a specific claim from a JWT token.
     *
     * @param token          The JWT token.
     * @param claimsResolver A function to extract a claim.
     * @param <T>            The claim type.
     * @return The extracted claim.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * ✅ Parses the JWT token and retrieves all claims.
     *
     * @param token The JWT token.
     * @return The claims inside the token.
     */

    private Claims extractAllClaims(String token) {
        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret)); // Ensure it's a SecretKey
        JwtParser parser = Jwts.parser().verifyWith(key).build(); // Now verifyWith() will work

        return parser.parseSignedClaims(token).getPayload();
    }

    /**
     * ✅ Checks if a JWT token is expired.
     *
     * @param token The JWT token.
     * @return True if expired, False if valid.
     */
    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * ✅ Validates a JWT token by checking username and expiration.
     *
     * @param token       The JWT token.
     * @param userDetails The authenticated user details.
     * @return True if valid, False otherwise.
     */
    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }
}
