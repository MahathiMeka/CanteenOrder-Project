package com.klef.soa.docker.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="CanteenOrder")
public class Canteen {
	
	

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name="oid")
	private long id;
	@Column(name="ocode", unique=true)
	private String ordercode;
	@Column(name="itemcount")
	private int itemcount;
	@Column(name="ocost")
	private double totalcost;
	@Column(name="ostatus", length=100)
	private String pickupstatus;
	
	
	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getOrdercode() {
		return ordercode;
	}

	public void setOrdercode(String ordercode) {
		this.ordercode = ordercode;
	}

	public int getItemcount() {
		return itemcount;
	}

	public void setItemcount(int itemcount) {
		this.itemcount = itemcount;
	}

	public double getTotalcost() {
		return totalcost;
	}

	public void setTotalcost(double totalcost) {
		this.totalcost = totalcost;
	}

	public String getPickupstatus() {
		return pickupstatus;
	}

	public void setPickupstatus(String pickupstatus) {
		this.pickupstatus = pickupstatus;
	}
	
	@Override
	public String toString() {
		return "Canteen [id=" + id + ", ordercode=" + ordercode + ", itemcount=" + itemcount + ", totalcost="
				+ totalcost + ", pickupstatus=" + pickupstatus + "]";
	}
	
	

}


