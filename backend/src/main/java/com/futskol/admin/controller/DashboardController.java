package com.futskol.admin.controller;

import com.futskol.admin.dto.CashResponse;
import com.futskol.admin.dto.DashboardResponse;
import com.futskol.admin.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.YearMonth;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService service;

    @GetMapping
    public ResponseEntity<DashboardResponse> summary(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM") YearMonth yearMonth) {
        return ResponseEntity.ok(service.summary(yearMonth));
    }

    @GetMapping("/cash")
    public ResponseEntity<CashResponse> cash() {
        return ResponseEntity.ok(service.cash());
    }
}
