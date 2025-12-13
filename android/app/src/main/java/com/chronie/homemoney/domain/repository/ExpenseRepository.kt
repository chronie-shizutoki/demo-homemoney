package com.chronie.homemoney.demo.domain.repository

import com.chronie.homemoney.demo.domain.model.Expense
import com.chronie.homemoney.demo.domain.model.ExpenseFilters
import com.chronie.homemoney.demo.domain.model.ExpenseStatistics

/**
 * 支出记录 Repository 接口
 */
interface ExpenseRepository {
    
    /**
     * 获取支出记录列表（分页）
     */
    suspend fun getExpensesList(
        page: Int,
        limit: Int,
        filters: ExpenseFilters
    ): Result<List<Expense>>
    
    /**
     * 根据ID获取支出记录
     */
    suspend fun getExpenseById(id: String): Result<Expense>
    
    /**
     * 添加支出记录
     */
    suspend fun addExpense(expense: Expense): Result<Expense>
    
    /**
     * 更新支出记录
     */
    suspend fun updateExpense(expense: Expense): Result<Expense>
    
    /**
     * 删除支出记录
     */
    suspend fun deleteExpense(id: String): Result<Unit>
    
    /**
     * 获取统计数据
     */
    suspend fun getStatistics(filters: ExpenseFilters): Result<ExpenseStatistics>
}
