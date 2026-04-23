package com.futskol.admin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FutskolAdminApplication {

    public static void main(String[] args) {
        SpringApplication.run(FutskolAdminApplication.class, args);
    }
}
