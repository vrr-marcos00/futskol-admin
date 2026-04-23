package com.futskol.admin.controller;

import com.futskol.admin.dto.CostRequest;
import com.futskol.admin.dto.CostResponse;
import com.futskol.admin.enums.CostCategory;
import com.futskol.admin.service.CostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/costs")
@RequiredArgsConstructor
public class CostController {

    private final CostService service;

    @GetMapping
    public ResponseEntity<List<CostResponse>> list(
            @RequestParam(required = false) CostCategory category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(service.search(category, from, to));
    }

    @PostMapping
    public ResponseEntity<CostResponse> create(@Valid @RequestBody CostRequest req) {
        return ResponseEntity.ok(service.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CostResponse> update(@PathVariable UUID id, @Valid @RequestBody CostRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
