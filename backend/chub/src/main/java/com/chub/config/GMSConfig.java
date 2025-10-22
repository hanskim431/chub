package com.chub.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "gms")
public class GMSConfig {
    private String apiKey;
    private String whisperUrl;
    private String gptUrl;
}
