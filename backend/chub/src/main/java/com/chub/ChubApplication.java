package com.chub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableMongoRepositories
public class ChubApplication {

	public static void main(String[] args) {
		SpringApplication.run(ChubApplication.class, args);
	}

}
