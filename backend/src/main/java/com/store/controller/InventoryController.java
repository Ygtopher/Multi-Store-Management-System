package com.store.controller;

import com.store.model.Category;
import com.store.model.Product;
import com.store.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/products")
    public List<Product> getProducts() {
        return inventoryService.getAllProducts();
    }

    @PostMapping("/products")
    public Product addProduct(@RequestBody Product product) {
        return inventoryService.createProduct(product);
    }

    @GetMapping("/categories")
    public List<Category> getCategories() {
        return inventoryService.getAllCategories();
    }

    @PostMapping("/categories")
    public Category addCategory(@RequestBody Category category) {
        return inventoryService.createCategory(category);
    }
}
