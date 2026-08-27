package com.store.controller;

import com.store.dto.OrderRequest;
import com.store.model.Order;
import com.store.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public Order checkout(@RequestBody OrderRequest request) {
        return orderService.processCheckout(request);
    }

    @GetMapping
    public List<Order> getOrders() {
        return orderService.getAllOrders();
    }
}
