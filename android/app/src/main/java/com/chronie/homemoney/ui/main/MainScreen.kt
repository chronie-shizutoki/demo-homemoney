package com.chronie.homemoney.demo.ui.main

import android.content.Context
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.filled.InsertChart
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.chronie.homemoney.demo.R
import com.chronie.homemoney.demo.ui.expense.ExpenseListScreen
import com.chronie.homemoney.demo.ui.settings.SettingsScreen
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.systemBars
import androidx.compose.foundation.layout.windowInsetsPadding

@Composable
fun MainScreen(
    context: Context,
    shouldRefreshExpenses: Boolean = false,
    onRefreshHandled: () -> Unit = {},
    onNavigateToSettings: () -> Unit,
    onNavigateToDatabaseTest: () -> Unit = {},
    onNavigateToAddExpense: () -> Unit = {},
    onNavigateToEditExpense: (expenseId: String) -> Unit = {},
    onNavigateToMoreFunctions: () -> Unit = {},
    viewModel: MainViewModel = hiltViewModel()
) {
    val isDeveloperMode by viewModel.isDeveloperMode.collectAsState(initial = false)
    var selectedTab by remember { mutableStateOf(0) }
    
    // 原生界面（带底部 Tab 栏）
    Scaffold(
            bottomBar = {
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface,
                    contentColor = MaterialTheme.colorScheme.onSurface
                ) {
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.Home, contentDescription = null) },
                        label = { Text(context.getString(R.string.expense_list_title)) },
                        selected = selectedTab == 0,
                        onClick = { selectedTab = 0 },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = MaterialTheme.colorScheme.onPrimary,
                            selectedTextColor = MaterialTheme.colorScheme.onPrimary,
                            indicatorColor = MaterialTheme.colorScheme.primary
                        )
                    )
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.InsertChart, contentDescription = null) },
                        label = { Text(context.getString(R.string.charts_title)) },
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = MaterialTheme.colorScheme.onPrimary,
                            selectedTextColor = MaterialTheme.colorScheme.onPrimary,
                            indicatorColor = MaterialTheme.colorScheme.primary
                        )
                    )
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.Settings, contentDescription = null) },
                        label = { Text(context.getString(R.string.settings)) },
                        selected = selectedTab == 2,
                        onClick = { selectedTab = 2 },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = MaterialTheme.colorScheme.onPrimary,
                            selectedTextColor = MaterialTheme.colorScheme.onPrimary,
                            indicatorColor = MaterialTheme.colorScheme.primary
                        )
                    )
                }
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
                            context = context,
                            onRequireLogin = onRequireLogin,
                            onRequireMembership = onRequireMembership
                        )
                    }
                    2 -> {
                        // 设置界面
                        SettingsScreen(
                            context = context,
                            onNavigateToDatabaseTest = onNavigateToDatabaseTest,
                            onNavigateToMembership = {
                                android.util.Log.d("MainScreen", "收到 onNavigateToMembership 回调")
                                onRequireMembership()
                            },
                            onLogout = {
                                android.util.Log.d("MainScreen", "收到 onLogout 回调")
                                onRequireLogin()
                            },
                            onRequireLogin = onRequireLogin,
                            onRequireMembership = onRequireMembership
                        )
                    }
                }
            }
        }
}
