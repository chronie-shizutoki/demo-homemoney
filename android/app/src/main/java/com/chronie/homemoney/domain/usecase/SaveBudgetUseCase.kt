package com.chronie.homemoney.demo.domain.usecase

import com.chronie.homemoney.demo.domain.model.Budget
import com.chronie.homemoney.demo.domain.repository.BudgetRepository
import javax.inject.Inject

/**
 * 保存预算设置用例
 */
class SaveBudgetUseCase @Inject constructor(
    private val budgetRepository: BudgetRepository
) {
    suspend operator fun invoke(budget: Budget) {
        budgetRepository.saveBudget(budget)
    }
}
