package com.placement.placement.security;

import com.placement.placement.util.JwtUtil;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        String method = exchange.getRequest().getMethod().name();
        if (path.contains("/health") || method.equals("OPTIONS"))
            return chain.filter(exchange);
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("[AUTH] Missing or malformed Authorization header in placement-service (non-blocking)");
            return chain.filter(exchange);
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.isTokenValid(token)) {
            System.out.println("[AUTH] Invalid or expired token in placement-service (non-blocking)");
            return chain.filter(exchange);
        }
        return chain.filter(exchange);
    }
}
