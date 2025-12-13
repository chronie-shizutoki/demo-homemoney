package com.chronie.homemoney.demo.domain.usecase

import com.chronie.homemoney.demo.domain.model.ExpenseFilters
import com.chronie.homemoney.demo.domain.model.ExpenseStatistics
import com.chronie.homemoney.demo.domain.repository.ExpenseRepository
import javax.inject.Inject

/**
 * 获取支出统计数据用例
 */
class GetStatisticsUseCase @Inject constructor(
    private val expenseRepository: ExpenseRepository
) {
    suspend operator fun invoke(filters: ExpenseFilters): Result<ExpenseStatistics> {
        return expenseRepository.getStatistics(filters)
    }
}
