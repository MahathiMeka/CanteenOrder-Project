package com.klef.soa.docker.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMethod;

import com.klef.soa.docker.entity.Canteen;
import com.klef.soa.docker.service.CanteenService;

@RestController
@RequestMapping("/canteen")
@CrossOrigin(
    origins = {
        "http://localhost:3000",
        "http://localhost:5173"
    },
    allowedHeaders = "*",
    methods = {
        RequestMethod.GET,
        RequestMethod.POST,
        RequestMethod.PUT,
        RequestMethod.DELETE,
        RequestMethod.OPTIONS
    }
)
public class CanteenController {

    @Autowired
    private CanteenService service;

    @GetMapping("/")
    public String home() {
        return "CanteenOrder Project";
    }

    @PostMapping("/add")
    public ResponseEntity<Canteen> addCanteen(@RequestBody Canteen c) {
        Canteen canteen = service.addOrder(c);
        return ResponseEntity.status(201).body(canteen);
    }

    @GetMapping("/displayall")
    public ResponseEntity<List<Canteen>> displayAllOrders() {
        List<Canteen> orders = service.displayAllOrders();
        return ResponseEntity.ok(orders);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteOrderById(
            @PathVariable("id") Long id) {

        String message = service.deleteOrderById(id);
        return ResponseEntity.ok(message);
    }
    
    @PutMapping("/update/{id}")
    public Canteen updatePickupStatus(
            @PathVariable long id,
            @RequestParam String pickupStatus) {
    	return service.updatePickupStatus(id, pickupStatus);
    }
}