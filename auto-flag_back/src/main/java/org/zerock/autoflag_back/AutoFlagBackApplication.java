package org.zerock.autoflag_back;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class AutoFlagBackApplication {

    public static void main(String[] args) {
        SpringApplication.run(AutoFlagBackApplication.class, args);
    }

}
