package com.placement.auth_service.util;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secret;
    @Value("${jwt.expiration}")
    private long expiration;
    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;
    @Value("${jwt.reset-expiration}")
    private long resetExpiration;
    private SecretKey getSigningKey() {
        byte[] keyBytes = Base64.getDecoder().decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    public String generateToken(String userId, String email, String role) {
        return generateToken(userId, email, role, null);
    }
    public String generateToken(String userId, String email, String role, String fullName) {
        var builder = Jwts.builder().subject(userId).claim("email", email).claim("role", role);
        if (fullName != null) builder.claim("fullName", fullName);
        return builder.issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey()).compact();
    }
    public String generateRefreshToken(String userId) {
        return Jwts.builder().subject(userId).issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(getSigningKey()).compact();
    }

    public String generatePasswordResetToken(String userId, String email) {
        // Token purpose is validated via the `type` claim in the reset endpoint.
        return Jwts.builder()
                .subject(userId)
                .claim("email", email)
                .claim("type", "password_reset")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + resetExpiration))
                .signWith(getSigningKey())
                .compact();
    }
    public Claims extractAllClaims(String token) {
        return Jwts.parser().verifyWith(getSigningKey()).build()
                .parseSignedClaims(token).getPayload();
    }
    public String extractUserId(String token) {
        return extractAllClaims(token).getSubject();
    }
    public String extractRole(String token) {
        Object role = extractAllClaims(token).get("role");
        return role == null ? null : role.toString();
    }

    public String extractTokenType(String token) {
        Object type = extractAllClaims(token).get("type");
        return type == null ? null : type.toString();
    }
    public boolean isTokenValid(String token) {
        try { extractAllClaims(token); return true; } catch (Exception e) { return false; }
    }
}
