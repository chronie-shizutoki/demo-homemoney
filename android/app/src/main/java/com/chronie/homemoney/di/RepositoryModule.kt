package com.chronie.homemoney.di

import com.chronie.homemoney.data.local.dao.BudgetDao
import com.chronie.homemoney.data.local.dao.ExpenseDao
import com.chronie.homemoney.data.repository.BudgetRepositoryImpl
import com.chronie.homemoney.data.repository.ExpenseRepositoryImpl
import com.chronie.homemoney.domain.repository.BudgetRepository
import com.chronie.homemoney.domain.repository.ExpenseRepository
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
