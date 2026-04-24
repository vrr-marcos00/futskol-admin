package com.futskol.admin.dto;

import java.util.List;

public record GenerateMonthlyResult(
        int created,
        int skipped,
        List<String> createdPlayerNames
) {}
