package com.futskol.admin.service;

import com.futskol.admin.dto.CostRequest;
import com.futskol.admin.dto.CostResponse;
import com.futskol.admin.entity.Cost;
import com.futskol.admin.enums.CostCategory;
import com.futskol.admin.exception.NotFoundException;
import com.futskol.admin.repository.CostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CostService {

    private final CostRepository repository;

    @Transactional(readOnly = true)
    public List<CostResponse> search(CostCategory category, LocalDate from, LocalDate to) {
        boolean hasRange = from != null && to != null;
        List<Cost> results;
        if (category != null && hasRange) {
            results = repository.findAllByCategoryAndDateBetweenOrderByDateDesc(category, from, to);
        } else if (category != null) {
            results = repository.findAllByCategoryOrderByDateDesc(category);
        } else if (hasRange) {
            results = repository.findAllByDateBetweenOrderByDateDesc(from, to);
        } else {
            results = repository.findAllByOrderByDateDesc();
        }
        return results.stream().map(CostResponse::from).toList();
    }

    @Transactional
    public CostResponse create(CostRequest req) {
        Cost cost = Cost.builder()
                .name(req.name())
                .category(req.category())
                .amount(req.amount())
                .date(req.date())
                .notes(req.notes())
                .build();
        return CostResponse.from(repository.save(cost));
    }

    @Transactional
    public CostResponse update(UUID id, CostRequest req) {
        Cost cost = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Custo não encontrado"));
        cost.setName(req.name());
        cost.setCategory(req.category());
        cost.setAmount(req.amount());
        cost.setDate(req.date());
        cost.setNotes(req.notes());
        return CostResponse.from(cost);
    }

    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Custo não encontrado");
        }
        repository.deleteById(id);
    }
}
