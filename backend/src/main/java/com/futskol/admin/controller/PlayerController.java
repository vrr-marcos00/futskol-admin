package com.futskol.admin.controller;

import com.futskol.admin.dto.PlayerRequest;
import com.futskol.admin.dto.PlayerResponse;
import com.futskol.admin.service.PlayerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/players")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerService service;

    @GetMapping
    public ResponseEntity<List<PlayerResponse>> list(@RequestParam(required = false) Boolean active,
                                                     @RequestParam(required = false) UUID typeId,
                                                     @RequestParam(required = false) String search) {
        return ResponseEntity.ok(service.search(active, typeId, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlayerResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<PlayerResponse> create(@Valid @RequestBody PlayerRequest req) {
        return ResponseEntity.ok(service.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlayerResponse> update(@PathVariable UUID id,
                                                 @Valid @RequestBody PlayerRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.softDelete(id);
        return ResponseEntity.noContent().build();
    }
}
