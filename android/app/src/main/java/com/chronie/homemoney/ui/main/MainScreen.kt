package com.chronie.homemoney.demo.ui.main

import android.content.Context
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.chronie.homemoney.demo.R
import com.chronie.homemoney.demo.ui.expense.ExpenseListScreen
import com.chronie.homemoney.demo.ui.settings.SettingsScreen
import com.chronie.homemoney.demo.ui.main.BottomNavigationBar

@Composable
fun MainScreen(
    context: Context,
    shouldRefreshExpenses: Boolean = false,
    onRefreshHandled: () -> Unit = {},
    onNavigateToSettings: () -> Unit,
    onNavigateToAddExpense: () -> Unit = {},
    onNavigateToEditExpense: (expenseId: String) -> Unit = {},
    onNavigateToMoreFunctions: () -> Unit = {},
    viewModel: MainViewModel = hiltViewModel()
) {
    var selectedTab by remember { mutableStateOf(0) }
    
    Scaffold(
        bottomBar = {
            BottomNavigationBar(
                context = context,
                selectedTab = selectedTab,
                onTabChange = { selectedTab = it }
            )
        }
    ) { paddingValues ->
            Box(modifier = Modifier.padding(paddingValues)) {
                when (selectedTab) {
                    0 -> {
                        // 支出记录界面
                        ExpenseListScreen(
                            context = context,
                            shouldRefresh = shouldRefreshExpenses,
                            onRefreshHandled = onRefreshHandled,
                            onNavigateToMoreFunctions = {},
                            onNavigateToAddExpense = onNavigateToAddExpense,
                            onNavigateToEditExpense = onNavigateToEditExpense
                        )
                    }
                    1 -> {
                        // 图表界面
                        com.chronie.homemoney.demo.ui.charts.ChartsScreen(
                            context = context
                        )
                    }
                    2 -> {
                        // 设置界面
                        SettingsScreen(
                            context = context
                        )
                    }
                }
            }
        }
}
