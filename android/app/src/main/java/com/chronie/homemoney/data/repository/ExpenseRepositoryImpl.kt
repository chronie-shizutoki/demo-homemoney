package com.chronie.homemoney.demo.data.repository

import com.chronie.homemoney.demo.data.local.dao.ExpenseDao
import com.chronie.homemoney.demo.data.local.entity.ExpenseEntity
import com.chronie.homemoney.demo.data.mapper.ExpenseMapper
import com.chronie.homemoney.demo.domain.model.Expense
import com.chronie.homemoney.demo.domain.model.ExpenseFilters
import com.chronie.homemoney.demo.domain.model.ExpenseStatistics
import com.chronie.homemoney.demo.domain.model.SortOption
import com.chronie.homemoney.demo.domain.repository.ExpenseRepository
import kotlinx.coroutines.flow.first
import javax.inject.Inject
import javax.inject.Singleton
import java.time.LocalDate
import kotlin.math.min

/**
 * 支出记录 Repository 实现
 */
@Singleton
class ExpenseRepositoryImpl @Inject constructor(
    private val expenseDao: ExpenseDao
) : ExpenseRepository {
    
    override suspend fun getExpensesList(
        page: Int,
        limit: Int,
        filters: ExpenseFilters
    ): Result<List<Expense>> {
        return try {
            // 从本地数据库获取并应用筛选
            val allExpenses = expenseDao.getAllExpenses().first()
            var filteredExpenses = allExpenses.map { ExpenseMapper.toDomain(it) }
            
            // 应用筛选条件
            if (filters.keyword != null) {
                filteredExpenses = filteredExpenses.filter { expense ->
                    expense.remark?.contains(filters.keyword, ignoreCase = true) == true ||
                    getChineseTypeName(expense.type).contains(filters.keyword, ignoreCase = true)
                }
            }
            
            if (filters.type != null) {
                filteredExpenses = filteredExpenses.filter { it.type == filters.type }
            }
            
            if (filters.minAmount != null) {
                filteredExpenses = filteredExpenses.filter { it.amount >= filters.minAmount }
            }
            
            if (filters.maxAmount != null) {
                filteredExpenses = filteredExpenses.filter { it.amount <= filters.maxAmount }
            }
            
            if (filters.startDate != null) {
                filteredExpenses = filteredExpenses.filter { expense ->
                    LocalDate.parse(expense.date) >= filters.startDate
                }
            }
            
            if (filters.endDate != null) {
                filteredExpenses = filteredExpenses.filter { expense ->
                    LocalDate.parse(expense.date) <= filters.endDate
                }
            }
            
            // 应用排序
            filteredExpenses = when (filters.sortBy) {
                SortOption.DATE_ASC -> filteredExpenses.sortedBy { expense -> expense.date }
                SortOption.DATE_DESC -> filteredExpenses.sortedByDescending { expense -> expense.date }
                SortOption.AMOUNT_ASC -> filteredExpenses.sortedBy { expense -> expense.amount }
                SortOption.AMOUNT_DESC -> filteredExpenses.sortedByDescending { expense -> expense.amount }
            }
            
            // 应用分页
            val startIndex = (page - 1) * limit
            val endIndex = min(startIndex + limit, filteredExpenses.size)
            val localExpenses = if (startIndex < filteredExpenses.size) {
                filteredExpenses.subList(startIndex, endIndex)
            } else {
                emptyList()
            }
            
            Result.success(localExpenses)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getExpenseById(id: String): Result<Expense> {
        return try {
            val entity = expenseDao.getExpenseById(id)
            if (entity != null) {
                Result.success(ExpenseMapper.toDomain(entity))
            } else {
                Result.failure(Exception("Expense not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun addExpense(expense: Expense): Result<Expense> {
        return try {
            // 保存到本地数据库
            val entity = ExpenseMapper.toEntity(expense)
            expenseDao.insertExpense(entity)
            
            Result.success(expense)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun updateExpense(expense: Expense): Result<Expense> {
        return try {
            // 本地更新逻辑
            val entity = ExpenseMapper.toEntity(expense)
            expenseDao.updateExpense(entity)
            
            Result.success(expense)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun deleteExpense(id: String): Result<Unit> {
        return try {
            // 从本地数据库删除
            expenseDao.deleteExpenseById(id)
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getStatistics(filters: ExpenseFilters): Result<ExpenseStatistics> {
        return try {
            // 从本地数据库计算统计数据
            val allExpenses = expenseDao.getAllExpenses().first()
            var expenses = allExpenses.map { ExpenseMapper.toDomain(it) }
            
            // 应用筛选条件
            if (filters.keyword != null) {
                expenses = expenses.filter { expense ->
                    expense.remark?.contains(filters.keyword, ignoreCase = true) == true ||
                    getChineseTypeName(expense.type).contains(filters.keyword, ignoreCase = true)
                }
            }
            
            if (filters.type != null) {
                expenses = expenses.filter { it.type == filters.type }
            }
            
            if (filters.minAmount != null) {
                expenses = expenses.filter { it.amount >= filters.minAmount }
            }
            
            if (filters.maxAmount != null) {
                expenses = expenses.filter { it.amount <= filters.maxAmount }
            }
            
            if (filters.startDate != null) {
                expenses = expenses.filter { expense ->
                    try {
                        val expenseDate = java.time.LocalDate.parse(expense.date)
                        expenseDate >= filters.startDate
                    } catch (e: Exception) {
                        false
                    }
                }
            }
            
            if (filters.endDate != null) {
                expenses = expenses.filter { expense ->
                    try {
                        val expenseDate = java.time.LocalDate.parse(expense.date)
                        expenseDate <= filters.endDate
                    } catch (e: Exception) {
                        false
                    }
                }
            }
            
            if (expenses.isEmpty()) {
                return Result.success(
                    ExpenseStatistics(
                        count = 0,
                        totalAmount = 0.0,
                        averageAmount = 0.0,
                        medianAmount = 0.0,
                        minAmount = 0.0,
                        maxAmount = 0.0
                    )
                )
            }
            
            val amounts = expenses.map { it.amount }.sorted()
            val total = amounts.sum()
            val average = total / amounts.size
            val median = if (amounts.size % 2 == 0) {
                (amounts[amounts.size / 2 - 1] + amounts[amounts.size / 2]) / 2
            } else {
                amounts[amounts.size / 2]
            }
            
            Result.success(
                ExpenseStatistics(
                    count = expenses.size,
                    totalAmount = total,
                    averageAmount = average,
                    medianAmount = median,
                    minAmount = amounts.first(),
                    maxAmount = amounts.last()
                )
            )
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    private fun getChineseTypeName(type: com.chronie.homemoney.demo.domain.model.ExpenseType): String {
        return when (type) {
            com.chronie.homemoney.demo.domain.model.ExpenseType.DAILY_GOODS -> "日常用品"
            com.chronie.homemoney.demo.domain.model.ExpenseType.LUXURY -> "奢侈品"
            com.chronie.homemoney.demo.domain.model.ExpenseType.COMMUNICATION -> "通讯费用"
            com.chronie.homemoney.demo.domain.model.ExpenseType.FOOD -> "食品"
            com.chronie.homemoney.demo.domain.model.ExpenseType.SNACKS -> "零食糖果"
            com.chronie.homemoney.demo.domain.model.ExpenseType.COLD_DRINKS -> "冷饮"
            com.chronie.homemoney.demo.domain.model.ExpenseType.CONVENIENCE_FOOD -> "方便食品"
            com.chronie.homemoney.demo.domain.model.ExpenseType.TEXTILES -> "纺织品"
            com.chronie.homemoney.demo.domain.model.ExpenseType.BEVERAGES -> "饮品"
            com.chronie.homemoney.demo.domain.model.ExpenseType.CONDIMENTS -> "调味品"
            com.chronie.homemoney.demo.domain.model.ExpenseType.TRANSPORTATION -> "交通出行"
            com.chronie.homemoney.demo.domain.model.ExpenseType.DINING -> "餐饮"
            com.chronie.homemoney.demo.domain.model.ExpenseType.MEDICAL -> "医疗费用"
            com.chronie.homemoney.demo.domain.model.ExpenseType.FRUITS -> "水果"
            com.chronie.homemoney.demo.domain.model.ExpenseType.OTHER -> "其他"
            com.chronie.homemoney.demo.domain.model.ExpenseType.SEAFOOD -> "水产品"
            com.chronie.homemoney.demo.domain.model.ExpenseType.DAIRY -> "乳制品"
            com.chronie.homemoney.demo.domain.model.ExpenseType.GIFTS -> "礼物人情"
            com.chronie.homemoney.demo.domain.model.ExpenseType.TRAVEL -> "旅行度假"
            com.chronie.homemoney.demo.domain.model.ExpenseType.GOVERNMENT -> "政务"
            com.chronie.homemoney.demo.domain.model.ExpenseType.UTILITIES -> "水电煤气"
        }
    }
    
    private fun getSortString(sortOption: SortOption): String {
        return when (sortOption) {
            SortOption.DATE_ASC -> "dateAsc"
            SortOption.DATE_DESC -> "dateDesc"
            SortOption.AMOUNT_ASC -> "amountAsc"
            SortOption.AMOUNT_DESC -> "amountDesc"
        }
    }
}
