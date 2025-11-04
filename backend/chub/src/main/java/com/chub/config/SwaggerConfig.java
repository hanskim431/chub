package com.chub.config;

import com.chub.auth.annotation.LoginUser;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springdoc.core.models.GroupedOpenApi;
import org.springdoc.core.utils.SpringDocUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    static {
        SpringDocUtils.getConfig().addAnnotationsToIgnore(LoginUser.class);
    }

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("chub-api")
                .pathsToMatch("/**")
                .packagesToScan(
                        "com.chub.controller",
                        "com.chub.auth.controller",
                        "com.chub.dashboard.controller",
                        "com.chub.chat.controller"
                )
                .build();
    }

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Development Server"),
                        new Server().url("https://chub.ai.kr").description("Production Server")
                ))
                .addSecurityItem(new SecurityRequirement().addList("JWT"))
                .components(new Components()
                        .addSecuritySchemes("JWT", new SecurityScheme()
                                .name("Authorization")
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .in(SecurityScheme.In.HEADER)
                                .description("JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"")
                        )
                );
    }

    private Info apiInfo() {
        return new Info()
                .title("Chub API")
                .description("모의 면접 지원 서비스")
                .version("1.0.0")
                .contact(new Contact()
                        .name("ㅊhub Team")
                        .email("support@chub.com")
                        .url("https://chub.ai.kr")
                );
    }
}