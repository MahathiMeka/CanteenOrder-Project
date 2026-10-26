package com.klef.soa.docker.service;



import java.util.List;

import com.klef.soa.docker.entity.Canteen;

public interface CanteenService {
	
	Canteen addOrder(Canteen c);
	List<Canteen> displayAllOrders();
	String deleteOrderById(Long id);
	Canteen updatePickupStatus(long id, String pickupStatus);
}
