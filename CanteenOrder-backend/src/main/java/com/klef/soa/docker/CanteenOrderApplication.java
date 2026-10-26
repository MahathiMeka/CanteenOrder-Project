package com.klef.soa.docker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CanteenOrderApplication {

	public static void main(String[] args) {
		SpringApplication.run(CanteenOrderApplication.class, args);
		System.out.println("Project is running...!!!");
	}

}
