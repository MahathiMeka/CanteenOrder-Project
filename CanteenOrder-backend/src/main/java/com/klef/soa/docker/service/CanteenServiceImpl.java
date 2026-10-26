package com.klef.soa.docker.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.klef.soa.docker.entity.Canteen;
import com.klef.soa.docker.repository.CanteenRepository;

@Service
public class CanteenServiceImpl implements CanteenService {

    @Autowired
    private CanteenRepository repository;

    @Override
    public Canteen addOrder(Canteen c) {
        return repository.save(c);
    }

    @Override
    public List<Canteen> displayAllOrders() {
        return repository.findAll();
    }

    @Override
    public String deleteOrderById(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return "Canteen order deleted successfully";
        } else {
            return "Canteen order not found with ID: " + id;
        }
    }
    
    @Override
    public Canteen updatePickupStatus(long id, String pickupStatus) {
        Canteen order = repository.findById(id)
            .orElseThrow(() ->
                new RuntimeException("Order not found with ID: " + id));

        order.setPickupstatus(pickupStatus);

        return repository.save(order);
    }
}