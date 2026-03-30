package com.placement.placement.util;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Base64;
@Component
public class JwtUtil {
    @Value("${jwt.secret}") private String secret;
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(Base64.getDecoder().decode(secret));
    }
    public Claims extractAllClaims(String token) {
        return Jwts.parser().verifyWith(getSigningKey()).build()
                .parseSignedClaims(token).getPayload();
    }
    public String extractUserId(String token) {
        return extractAllClaims(token).getSubject();
    }
    public String extractEmail(String token) {
        return extractAllClaims(token).get("email", String.class);
    }
    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }
    public boolean isTokenValid(String token) {
        try { extractAllClaims(token); return true; } catch (Exception e) { return false; }
    }
}
