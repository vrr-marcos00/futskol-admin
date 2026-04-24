package com.futskol.admin.dto;

import java.util.List;

public record AnnualPaymentResult(
        List<PaymentResponse> created,
        List<String> skipped
) {}
