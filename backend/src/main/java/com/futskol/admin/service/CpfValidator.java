package com.futskol.admin.service;

public final class CpfValidator {

    private CpfValidator() {}

    public static boolean isValid(String cpf) {
        if (cpf == null || !cpf.matches("\\d{11}")) return false;
        if (cpf.chars().distinct().count() == 1) return false;

        int d1 = digit(cpf, 9, 10);
        int d2 = digit(cpf, 10, 11);

        return d1 == Character.getNumericValue(cpf.charAt(9))
                && d2 == Character.getNumericValue(cpf.charAt(10));
    }

    private static int digit(String cpf, int length, int startWeight) {
        int sum = 0;
        int weight = startWeight;
        for (int i = 0; i < length; i++) {
            sum += Character.getNumericValue(cpf.charAt(i)) * weight--;
        }
        int mod = sum % 11;
        return mod < 2 ? 0 : 11 - mod;
    }
}
