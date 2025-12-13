package com.chronie.homemoney.demo.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.chronie.homemoney.demo.data.local.dao.BudgetDao
import com.chronie.homemoney.demo.data.local.dao.ExpenseDao
import com.chronie.homemoney.demo.data.local.entity.BudgetEntity
import com.chronie.homemoney.demo.data.local.entity.ExpenseEntity

/**
 * 应用数据库
 * 版本 2: 添加 budgets 表
 * 版本 3: 向 expenses 表添加 date 字段
 */
@Database(
    entities = [
        ExpenseEntity::class,
        BudgetEntity::class
    ],
    version = 3,
    exportSchema = true
)
abstract class AppDatabase : RoomDatabase() {
    
    abstract fun expenseDao(): ExpenseDao
    abstract fun budgetDao(): BudgetDao
    
    companion object {
        const val DATABASE_NAME = "homemoney.db"
    }
}
