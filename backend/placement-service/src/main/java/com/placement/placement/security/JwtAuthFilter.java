package com.placement.placement.security;

import com.placement.placement.util.JwtUtil;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthFilter implements WebFilter {
    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public @NonNull Mono<Void> filter(@NonNull ServerWebExchange exchange, @NonNull WebFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        String method = exchange.getRequest().getMethod().name();
        if (path.contains("/health") || method.equals("OPTIONS"))
            return chain.filter(exchange);

        String userIdFromGateway = exchange.getRequest().getHeaders().getFirst("x-user-id");
        if (userIdFromGateway != null && !userIdFromGateway.isBlank()) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange, "Authorization header missing or malformed.");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.isTokenValid(token)) {
            return unauthorized(exchange, "Invalid or expired token.");
        }
        String userId = jwtUtil.extractUserId(token);
        if (userId == null || userId.isBlank()) {
            return unauthorized(exchange, "Invalid token: missing userId.");
        }
        return chain.filter(exchange);
    }

    private @NonNull Mono<Void> unauthorized(@NonNull ServerWebExchange exchange, String message) {
        exchange.getResponse().getHeaders().set("x-auth-error", message);
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }
}
