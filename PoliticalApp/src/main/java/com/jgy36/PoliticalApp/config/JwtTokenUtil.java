package com.jgy36.PoliticalApp.config;

import io.jsonwebtoken.*;
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

    @Value("${jwt.secret}") // ✅ Inject secret from properties
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
        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret)); // ✅ Correct key usage

        return Jwts.builder()
                .subject(email) // ✅ Use subject() instead of setSubject()
                .issuedAt(new Date()) // ✅ Use issuedAt()
                .expiration(new Date(System.currentTimeMillis() + expirationMs)) // ✅ Use expiration()
                .signWith(key, Jwts.SIG.HS256) // ✅ Correct way to sign JWT in JJWT 0.12.6
                .compact();
    }

    /**
     * ✅ Extracts the username (email) from a JWT token.
     *
     * @param token The JWT token.
     * @return The extracted email.
     */
    public String getUsernameFromToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            System.out.println("✅ Extracted Username from Token: " + claims.getSubject());
            return claims.getSubject();
        } catch (Exception e) {
            System.out.println("❌ Error extracting username from JWT: " + e.getMessage());
            return null;
        }
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
        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret)); // ✅ Ensure it's a SecretKey
        JwtParser parser = Jwts.parser().verifyWith(key).build(); // ✅ Correct parsing method

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
        try {
            Claims claims = extractAllClaims(token);
            Date expiration = claims.getExpiration();

            if (expiration.before(new Date())) {
                System.out.println("🚨 Token expired at: " + expiration);
                return false;
            }

            String email = getUsernameFromToken(token);
            return (email.equals(userDetails.getUsername()));
        } catch (ExpiredJwtException e) {
            System.out.println("🚨 Token is expired!");
            return false;
        } catch (JwtException e) {
            System.out.println("🚨 Invalid token!");
            return false;
        }
    }

    /**
     * ✅ Extracts expiration time from a JWT token.
     *
     * @param token The JWT token.
     * @return The expiration timestamp.
     */
    public long getExpirationFromToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret)); // ✅ Correct SecretKey usage

        Claims claims = Jwts.parser()
                .verifyWith(key)  // ✅ Now correctly uses SecretKey
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getExpiration().getTime();
    }
}
