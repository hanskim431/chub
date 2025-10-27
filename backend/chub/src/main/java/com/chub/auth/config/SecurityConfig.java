package com.chub.auth.config;


import com.chub.auth.jwt.JwtAuthenticationFilter;
import com.chub.auth.jwt.TokenProvider;
import com.chub.auth.service.TokenService;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.FrameOptionsConfig;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Profile("!test")
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final TokenProvider tokenProvider;
    private final TokenService tokenService;

     @Value("${app.cors.allowed-origins}")
     private String allowedOriginsString;

    private static final List<String> ALLOWED_METHODS = List.of(
            "GET", "POST", "PUT", "DELETE", "OPTIONS"
    );

    private static final List<String> ALLOWED_HEADERS = List.of(
            "Authorization", "Content-Type"
    );

    private static final String[] PERMIT_ALL_PATHS = {
            "/",
            "/oauth2/authorization/kakao",
            "/oauth2/authorization/kakao/callback",
            "/auth/**",
            "/api/health",
            "/ws/**",
            "/actuator/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/api-docs/**",
            "/v3/api-docs/**",
            "/realtime-test.html",
            "/static/**",
            "/*.html",
            "/*.css",
            "/*.js",
            "/*.ico",
            "/dev/**",
    };

    private static final long HSTS_MAX_AGE_IN_SECONDS = 31536000L;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PERMIT_ALL_PATHS).permitAll()
                        .requestMatchers("/api/portfolios/*/stocks/batch").permitAll()

                        .anyRequest().authenticated()
                )

//                // 모든 요청 HTTPS 강제 적용
//                .requiresChannel(channel -> channel.anyRequest().requiresSecure())

                // 보안 헤더 설정
                .headers(headers -> headers
                        .contentSecurityPolicy(csp ->
                                csp.policyDirectives("default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; connect-src 'self' ws: wss:"))
                        // HSTS 정책 적용
                        .httpStrictTransportSecurity(hsts ->
                                hsts.includeSubDomains(true).maxAgeInSeconds(HSTS_MAX_AGE_IN_SECONDS)) // HSTS 1년
                        .frameOptions(FrameOptionsConfig::sameOrigin)
                        .referrerPolicy(referrer ->
                                referrer.policy(
                                        ReferrerPolicy.ORIGIN_WHEN_CROSS_ORIGIN))
                )

                .addFilterBefore(new JwtAuthenticationFilter(tokenProvider, tokenService),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // allowedOriginsString에서 origin 목록 파싱
        List<String> allowedOrigins = Arrays.asList(allowedOriginsString.split(","));
        configuration.setAllowedOrigins(allowedOrigins);

        // 카카오 인증 origin 추가
        configuration.addAllowedOrigin("https://kauth.kakao.com");

        // 개발환경에서만 모든 origin 패턴 허용 (credentials가 false일 때만)
        if (allowedOrigins.contains("*")) {
            configuration.setAllowCredentials(false);
            configuration.addAllowedOriginPattern("*");
        } else {
            configuration.setAllowCredentials(true);
        }

        configuration.setAllowedMethods(ALLOWED_METHODS);
        configuration.setAllowedHeaders(ALLOWED_HEADERS);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
