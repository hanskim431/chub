package com.chub.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MongoDBConfig {

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @Bean
    public com.mongodb.client.MongoClient mongoClient() {
        try {
            return com.mongodb.client.MongoClients.create(mongoUri);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create MongoDB client", e);
        }
    }

}