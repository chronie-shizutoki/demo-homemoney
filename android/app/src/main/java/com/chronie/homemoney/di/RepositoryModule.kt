package com.chronie.homemoney.demo.di

import com.chronie.homemoney.demo.data.local.dao.BudgetDao
import com.chronie.homemoney.demo.data.local.dao.ExpenseDao
import com.chronie.homemoney.demo.data.repository.BudgetRepositoryImpl
import com.chronie.homemoney.demo.data.repository.ExpenseRepositoryImpl
import com.chronie.homemoney.demo.domain.repository.BudgetRepository
import com.chronie.homemoney.demo.domain.repository.ExpenseRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

/**
 * Repository 依赖注入模块
 */
@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {
    
    @Provides
    @Singleton
    fun provideExpenseRepository(
        expenseDao: ExpenseDao
    ): ExpenseRepository {
        return ExpenseRepositoryImpl(expenseDao)
    }
    
    @Provides
    @Singleton
    fun provideBudgetRepository(
        budgetDao: BudgetDao,
        expenseDao: ExpenseDao
    ): BudgetRepository {
        return BudgetRepositoryImpl(budgetDao, expenseDao)
    }
}
