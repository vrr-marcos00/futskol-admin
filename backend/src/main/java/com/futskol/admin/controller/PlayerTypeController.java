package com.futskol.admin.controller;

import com.futskol.admin.dto.PlayerTypeRequest;
import com.futskol.admin.dto.PlayerTypeResponse;
import com.futskol.admin.service.PlayerTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/player-types")
@RequiredArgsConstructor
public class PlayerTypeController {

    private final PlayerTypeService service;

    @GetMapping
    public ResponseEntity<List<PlayerTypeResponse>> list(@RequestParam(required = false) Boolean active) {
        return ResponseEntity.ok(service.list(active));
    }

    @PostMapping
    public ResponseEntity<PlayerTypeResponse> create(@Valid @RequestBody PlayerTypeRequest req) {
        return ResponseEntity.ok(service.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlayerTypeResponse> update(@PathVariable UUID id,
                                                     @Valid @RequestBody PlayerTypeRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }
}
