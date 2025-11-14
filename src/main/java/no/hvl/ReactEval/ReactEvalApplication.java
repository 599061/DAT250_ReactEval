package no.hvl.ReactEval;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class ReactEvalApplication {

	public static void main(String[] args) {
		SpringApplication.run(ReactEvalApplication.class, args);
	}

}
