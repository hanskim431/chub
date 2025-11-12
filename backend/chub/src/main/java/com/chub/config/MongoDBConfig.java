package com.chub.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@Profile("!test")
@EnableMongoAuditing
@EnableMongoRepositories(basePackages = "com.chub.repository.mongo")
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