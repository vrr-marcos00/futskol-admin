package com.futskol.admin.controller;

import com.futskol.admin.dto.InjuryCloseRequest;
import com.futskol.admin.dto.InjuryResponse;
import com.futskol.admin.dto.InjuryStartRequest;
import com.futskol.admin.service.InjuryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class InjuryController {

    private final InjuryService service;

    @GetMapping("/injuries")
    public ResponseEntity<List<InjuryResponse>> list(@RequestParam(required = false) Boolean active,
                                                     @RequestParam(required = false) UUID playerId) {
        return ResponseEntity.ok(service.listAll(active, playerId));
    }

    @GetMapping("/players/{playerId}/injuries")
    public ResponseEntity<List<InjuryResponse>> listForPlayer(@PathVariable UUID playerId) {
        return ResponseEntity.ok(service.listAll(null, playerId));
    }

    @PostMapping("/players/{playerId}/injuries")
    public ResponseEntity<InjuryResponse> start(@PathVariable UUID playerId,
                                                @Valid @RequestBody InjuryStartRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.start(playerId, req));
    }

    @PostMapping("/players/{playerId}/injuries/{injuryId}/close")
    public ResponseEntity<InjuryResponse> close(@PathVariable UUID playerId,
                                                @PathVariable UUID injuryId,
                                                @Valid @RequestBody InjuryCloseRequest req) {
        return ResponseEntity.ok(service.close(playerId, injuryId, req));
    }
}
