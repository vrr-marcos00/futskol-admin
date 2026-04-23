package com.futskol.admin.controller;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.futskol.admin.dto.PaymentRequest;
import com.futskol.admin.dto.PaymentResponse;
import com.futskol.admin.enums.PaymentStatus;
import com.futskol.admin.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService service;

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> list(
            @RequestParam(required = false) UUID playerId,
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(required = false)
            @DateTimeFormat(pattern = "yyyy-MM")
            @JsonFormat(pattern = "yyyy-MM") YearMonth yearMonth) {
        return ResponseEntity.ok(service.search(playerId, status, yearMonth));
    }

    @GetMapping("/month/{yearMonth}")
    public ResponseEntity<List<PaymentResponse>> listByMonth(
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM") YearMonth yearMonth) {
        return ResponseEntity.ok(service.findByMonth(yearMonth));
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> create(@Valid @RequestBody PaymentRequest req) {
        return ResponseEntity.ok(service.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentResponse> update(@PathVariable UUID id,
                                                  @Valid @RequestBody PaymentRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }
}
